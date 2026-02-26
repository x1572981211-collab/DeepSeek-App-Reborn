import { create } from 'zustand'
import axios from 'axios'

const API_BASE = '' // 使用相对路径，以便适配不同的部署环境 (代理)

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
}

export interface Session {
  id: string
  title: string
  created_at: string
  updated_at: string
  messages: Message[]
  config?: Record<string, any>
  message_count?: number
}

export interface Config {
  api_key_deepseek: string
  api_key_siliconflow: string
  api_key_volcengine: string
  provider: string
  base_url: string
  model: string
  max_tokens: number
  temperature: number
  system_prompt: string
  context_limit: number
  theme: string
  custom_models?: string[]
  user_avatar?: string
  ai_avatar?: string
}

interface AppState {
  // 会话管理
  sessions: Session[]
  currentSessionId: string | null

  // 配置
  config: Config | null

  // UI 状态
  isGenerating: boolean
  isSidebarOpen: boolean
  isSettingsOpen: boolean
  isLoadingSession: boolean

  // WebSocket
  ws: WebSocket | null

  // 操作方法
  loadSessions: () => Promise<void>
  loadConfig: () => Promise<void>
  createSession: () => Promise<void>
  deleteSession: (id: string) => Promise<void>
  switchSession: (id: string) => Promise<void>
  updateConfig: (config: Config) => Promise<void>
  updateSessionTitle: (id: string, title: string) => Promise<void>
  updateSessionConfig: (id: string, config: Record<string, any>) => Promise<void>
  sendMessage: (message: string) => void
  revokeMessage: (messageIndex: number) => Promise<void>
  setIsGenerating: (value: boolean) => void
  toggleSidebar: () => void
  toggleSettings: () => void
  connectWebSocket: () => void
  disconnectWebSocket: () => void
}

export const useStore = create<AppState>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  config: null,
  isGenerating: false,
  isSidebarOpen: true,
  isSettingsOpen: false,
  isLoadingSession: false,
  ws: null,

  loadSessions: async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/sessions`)
      // Metadata only, no messages array returned initially
      const sessions = response.data.sessions.map((s: any) => ({ ...s, messages: [] }))
      set({ sessions })

      // 如果没有当前会话，选择第一个
      if (!get().currentSessionId && sessions.length > 0) {
        await get().switchSession(sessions[0].id)
      } else if (get().currentSessionId) {
        // 重新加载当前会话的内容
        await get().switchSession(get().currentSessionId!)
      }
    } catch (error) {
      console.error('加载会话失败:', error)
    }
  },

  loadConfig: async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/config`)
      set({ config: response.data })
    } catch (error) {
      console.error('加载配置失败:', error)
    }
  },

  createSession: async () => {
    try {
      const response = await axios.post(`${API_BASE}/api/sessions`)
      const newSession = response.data
      set(state => ({
        sessions: [newSession, ...state.sessions],
        currentSessionId: newSession.id
      }))
    } catch (error) {
      console.error('创建会话失败:', error)
    }
  },

  deleteSession: async (id: string) => {
    try {
      await axios.delete(`${API_BASE}/api/sessions/${id}`)
      const state = get()
      const newSessions = state.sessions.filter(s => s.id !== id)

      let newCurrentId = state.currentSessionId
      if (state.currentSessionId === id) {
        newCurrentId = newSessions.length > 0 ? newSessions[0].id : null
      }

      set({ sessions: newSessions, currentSessionId: newCurrentId })

      // 重新加载会话以同步状态
      await get().loadSessions()
    } catch (error) {
      console.error('删除会话失败:', error)
    }
  },

  switchSession: async (id: string) => {
    set({ currentSessionId: id, isLoadingSession: true })
    try {
      const response = await axios.get(`${API_BASE}/api/sessions/${id}/messages`)
      const messages = response.data.messages

      set(state => ({
        sessions: state.sessions.map(s =>
          s.id === id ? { ...s, messages } : s
        ),
        isLoadingSession: false
      }))
    } catch (error) {
      console.error('加载会话消息失败:', error)
      set({ isLoadingSession: false })
    }
  },

  updateConfig: async (config: Config) => {
    try {
      await axios.post(`${API_BASE}/api/config`, config)
      set({ config })
    } catch (error) {
      console.error('更新配置失败:', error)
    }
  },

  updateSessionTitle: async (id: string, title: string) => {
    try {
      await axios.put(`${API_BASE}/api/sessions/${id}/title?title=${encodeURIComponent(title)}`)
      set(state => ({
        sessions: state.sessions.map(s => s.id === id ? { ...s, title } : s)
      }))
    } catch (error) {
      console.error('更新会话标题失败:', error)
    }
  },

  updateSessionConfig: async (id: string, config: Record<string, any>) => {
    try {
      await axios.put(`${API_BASE}/api/sessions/${id}/config`, config)
      set(state => ({
        sessions: state.sessions.map(s => s.id === id ? { ...s, config } : s)
      }))
    } catch (error) {
      console.error('更新会话配置失败:', error)
    }
  },

  sendMessage: (message: string) => {
    const { ws, currentSessionId, config } = get()

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket 未连接')
      alert('WebSocket 未连接，请刷新页面重试')
      return
    }

    if (!currentSessionId) {
      console.error('没有选中的会话')
      return
    }

    // 🔥 立即添加用户消息到界面（不等待后端）
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }

    set(state => ({
      sessions: state.sessions.map(s =>
        s.id === state.currentSessionId
          ? { ...s, messages: [...s.messages, userMessage] }
          : s
      ),
      isGenerating: true
    }))

    // 🔥 立即添加空的 AI 消息占位符
    const aiPlaceholder: Message = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    }

    set(state => ({
      sessions: state.sessions.map(s =>
        s.id === state.currentSessionId
          ? { ...s, messages: [...s.messages, aiPlaceholder] }
          : s
      )
    }))

    // 获取当前会话特定的配置
    const session = get().sessions.find(s => s.id === currentSessionId)
    const sessionConfig = session?.config || {}

    // 发送消息到后端
    ws.send(JSON.stringify({
      session_id: currentSessionId,
      message,
      config: {
        api_key: config?.provider === 'DeepSeek Official'
          ? config.api_key_deepseek
          : config?.provider === 'SiliconFlow (硅基流动)'
            ? config.api_key_siliconflow
            : config?.api_key_volcengine,
        base_url: config?.base_url,
        model: sessionConfig.model || config?.model,
        max_tokens: sessionConfig.max_tokens || config?.max_tokens,
        temperature: sessionConfig.temperature ?? config?.temperature,
        system_prompt: sessionConfig.system_prompt || config?.system_prompt,
        context_limit: sessionConfig.context_limit ?? config?.context_limit,
      }
    }))
  },

  revokeMessage: async (messageIndex: number) => {
    const { currentSessionId, sessions } = get()
    if (!currentSessionId) return

    const session = sessions.find(s => s.id === currentSessionId)
    if (!session) return

    // 截断消息：保留 messageIndex 之前的消息
    const newMessages = session.messages.slice(0, messageIndex)

    // 更新本地状态
    set(state => ({
      sessions: state.sessions.map(s =>
        s.id === currentSessionId ? { ...s, messages: newMessages } : s
      )
    }))

    // 同步到后端
    try {
      await axios.put(`${API_BASE}/api/sessions/${currentSessionId}/messages`, newMessages)
    } catch (error) {
      console.error('撤回消息失败:', error)
    }
  },

  setIsGenerating: (value: boolean) => {
    set({ isGenerating: value })
  },

  toggleSidebar: () => {
    set(state => ({ isSidebarOpen: !state.isSidebarOpen }))
  },

  toggleSettings: () => {
    set(state => ({ isSettingsOpen: !state.isSettingsOpen }))
  },

  connectWebSocket: () => {
    const existingWs = get().ws
    if (existingWs && existingWs.readyState === WebSocket.OPEN) {
      console.log('WebSocket 已连接，跳过重复连接')
      return
    }

    console.log('正在连接 WebSocket...')
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsHost = window.location.host
    const ws = new WebSocket(`${wsProtocol}//${wsHost}/ws/chat`)

    ws.onopen = () => {
      console.log('✅ WebSocket 连接成功')
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'user_message_saved') {
        // 🔥 用户消息已在 sendMessage 中添加，这里忽略
        console.log('用户消息已保存到后端')
      } else if (data.type === 'stream') {
        // 🔥 流式更新最后一条 AI 消息
        set(state => ({
          sessions: state.sessions.map(s => {
            if (s.id === state.currentSessionId) {
              const messages = [...s.messages]
              const lastMsg = messages[messages.length - 1]
              if (lastMsg && lastMsg.role === 'assistant') {
                lastMsg.content += data.content
              }
              return { ...s, messages }
            }
            return s
          })
        }))
      } else if (data.type === 'done') {
        // 🔥 生成完成
        console.log('AI 响应完成')
        set({ isGenerating: false })
      } else if (data.type === 'error') {
        // 🔥 错误处理 - 移除空的 AI 占位符，添加错误消息
        console.error('API 错误:', data.content)

        set(state => ({
          sessions: state.sessions.map(s => {
            if (s.id === state.currentSessionId) {
              const messages = [...s.messages]
              // 移除最后的空 AI 消息
              if (messages.length > 0 && messages[messages.length - 1].role === 'assistant' && !messages[messages.length - 1].content) {
                messages.pop()
              }
              // 添加错误消息
              messages.push({
                role: 'system',
                content: `❌ ${data.content}`,
                timestamp: new Date().toISOString()
              })
              return { ...s, messages }
            }
            return s
          }),
          isGenerating: false
        }))
      }
    }

    ws.onerror = (error) => {
      console.error('❌ WebSocket 错误:', error)
      set({ isGenerating: false })
    }

    ws.onclose = () => {
      console.log('⚠️ WebSocket 连接关闭，3秒后尝试重连...')
      set({ ws: null, isGenerating: false })

      // 🔥 自动重连
      setTimeout(() => {
        console.log('尝试重新连接 WebSocket...')
        get().connectWebSocket()
      }, 3000)
    }

    set({ ws })
  },

  disconnectWebSocket: () => {
    const { ws } = get()
    if (ws) {
      ws.close()
      set({ ws: null })
    }
  },
}))



