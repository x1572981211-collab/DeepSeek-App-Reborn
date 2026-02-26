import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import MessageBubble from './MessageBubble'
import { Send, Loader2, Settings as SettingsIcon, X, Upload } from 'lucide-react'

export default function ChatArea() {
  const { sessions, currentSessionId, sendMessage, isGenerating, isLoadingSession, revokeMessage, updateSessionConfig, config } = useStore()
  const [input, setInput] = useState('')
  const [showSessionSettings, setShowSessionSettings] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const currentSession = sessions.find(s => s.id === currentSessionId)
  const [localSessionConfig, setLocalSessionConfig] = useState<Record<string, any>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setLocalSessionConfig({ ...localSessionConfig, system_prompt: content })
    }
    reader.readAsText(file)
  }

  useEffect(() => {
    if (currentSession?.config) {
      setLocalSessionConfig(currentSession.config)
    } else {
      setLocalSessionConfig({})
    }
  }, [currentSession?.config, currentSessionId])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentSession?.messages])

  // 自动调整输入框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [input])

  const handleSend = () => {
    if (!input.trim() || isGenerating) return

    sendMessage(input.trim())
    setInput('')

    // 重置输入框高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleRevoke = async (index: number) => {
    if (!currentSession) return
    const msgToRevoke = currentSession.messages[index]
    if (msgToRevoke && msgToRevoke.role === 'user') {
      setInput(msgToRevoke.content)
      await revokeMessage(index)
    }
  }

  const handleResend = async (index: number) => {
    if (!currentSession) return
    const msgToRevoke = currentSession.messages[index]
    if (msgToRevoke && msgToRevoke.role === 'user') {
      const content = msgToRevoke.content
      await revokeMessage(index)
      sendMessage(content)
    }
  }

  const handleQuote = (content: string) => {
    setInput(prev => `${prev ? prev + '\n\n' : ''}> ${content.split('\n').join('\n> ')}\n\n`)
    textareaRef.current?.focus()
  }

  const saveSessionSettings = () => {
    if (currentSessionId) {
      updateSessionConfig(currentSessionId, localSessionConfig)
    }
    setShowSessionSettings(false)
  }

  if (!currentSession) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-xl">选择或创建一个对话开始聊天</p>
        </div>
      </div>
    )
  }

  if (isLoadingSession) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 gap-4">
        <Loader2 size={48} className="animate-spin text-primary-500" />
        <p className="text-xl">加载会话中...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col relative w-full overflow-hidden">
      {/* 顶部标题栏 + 会话设置按钮 */}
      {currentSession && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
          <h2 className="font-semibold px-2">{currentSession.title}</h2>
          <button
            onClick={() => setShowSessionSettings(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
          >
            <SettingsIcon size={16} /> 会话专属设定
          </button>
        </div>
      )}

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {currentSession.messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold mb-2">开始新对话</h2>
              <p className="text-sm">
                我是 DeepSeek AI 助手，可以帮你解答问题、编写代码、创作内容等。
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="font-medium mb-1">💡 解答问题</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    回答各类知识问题
                  </div>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="font-medium mb-1">💻 编写代码</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    生成和调试代码
                  </div>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="font-medium mb-1">✍️ 创作内容</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    写作、翻译、润色
                  </div>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="font-medium mb-1">🔍 分析数据</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    数据处理和分析
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {currentSession.messages.map((message, index) => (
              <MessageBubble
                key={`${currentSession.id}-${index}`}
                message={message}
                index={index}
                onRevoke={handleRevoke}
                onResend={handleResend}
                onQuote={handleQuote}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 会话设置弹窗 */}
      {showSessionSettings && (
        <div className="absolute top-16 right-4 w-80 bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-xl z-20 animate-fade-in p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">当前对话设定</h3>
            <button onClick={() => setShowSessionSettings(false)} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"><X size={16} /></button>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-gray-500">专属背景设定 (System Prompt)</label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                >
                  <Upload size={12} />
                  本地加载
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              <textarea
                className="w-full text-sm p-2 border rounded bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 resize-none h-24"
                placeholder="留空则使用全局设定"
                value={localSessionConfig.system_prompt || ''}
                onChange={(e) => setLocalSessionConfig({ ...localSessionConfig, system_prompt: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-500">专属模型 (Model)</label>
              <input
                type="text"
                className="w-full text-sm p-2 border rounded bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                placeholder={`默认: ${config?.model || ''}`}
                value={localSessionConfig.model || ''}
                onChange={(e) => setLocalSessionConfig({ ...localSessionConfig, model: e.target.value })}
              />
            </div>
            <button
              onClick={saveSessionSettings}
              className="w-full py-2 bg-primary-500 text-white rounded text-sm hover:bg-primary-600 transition"
            >
              保存专属设定
            </button>
          </div>
        </div>
      )}

      {/* 输入区域 */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入消息... (Shift+Enter 换行，Enter 发送)"
                disabled={isGenerating}
                className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none max-h-40 disabled:opacity-50 overflow-y-auto"
                rows={1}
              />
            </div>

            <button
              onClick={handleSend}
              disabled={!input.trim() || isGenerating}
              className="px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  生成中
                </>
              ) : (
                <>
                  <Send size={20} />
                  发送
                </>
              )}
            </button>
          </div>

          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            DeepSeek App Reborn 可能会出错，请核实重要信息
          </div>
        </div>
      </div>
    </div>
  )
}





