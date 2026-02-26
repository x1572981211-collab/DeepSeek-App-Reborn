import { useEffect, useState } from 'react'
import { useStore } from './store'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import Settings from './components/Settings'
import { Menu, Settings as SettingsIcon } from 'lucide-react'

function App() {
  const { 
    loadSessions, 
    loadConfig, 
    connectWebSocket, 
    disconnectWebSocket,
    isSidebarOpen,
    isSettingsOpen,
    toggleSidebar,
    toggleSettings,
    config
  } = useStore()

  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    // 初始化
    loadSessions()
    loadConfig()
    connectWebSocket()

    // 清理
    return () => {
      disconnectWebSocket()
    }
  }, [])

  useEffect(() => {
    // 应用主题
    if (config?.theme === 'dark' || (!config?.theme && isDark)) {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    } else {
      document.documentElement.classList.remove('dark')
      setIsDark(false)
    }
  }, [config?.theme, isDark])

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark'
    setIsDark(!isDark)
    if (config) {
      useStore.getState().updateConfig({ ...config, theme: newTheme })
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* 侧边栏 */}
      <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden`}>
        <Sidebar />
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部工具栏 */}
        <div className="h-14 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="切换侧边栏"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold">DeepSeek App Reborn</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* 主题切换 */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="切换主题"
            >
              {isDark ? '🌙' : '☀️'}
            </button>

            {/* 设置按钮 */}
            <button
              onClick={toggleSettings}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="设置"
            >
              <SettingsIcon size={20} />
            </button>
          </div>
        </div>

        {/* 聊天区域 */}
        <ChatArea />
      </div>

      {/* 设置面板 */}
      {isSettingsOpen && <Settings />}
    </div>
  )
}

export default App





