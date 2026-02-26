import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store'
import { X, Save, Upload } from 'lucide-react'

export default function Settings() {
  const { config, updateConfig, toggleSettings } = useStore()
  const [localConfig, setLocalConfig] = useState(config)
  const [showApiKey, setShowApiKey] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setLocalConfig({ ...localConfig, system_prompt: content })
    }
    reader.readAsText(file)
  }

  const handleSave = () => {
    if (localConfig) {
      updateConfig(localConfig)
      toggleSettings()
    }
  }

  if (!localConfig) return null

  const providers = [
    { value: 'DeepSeek Official', label: 'DeepSeek 官方' },
    { value: 'SiliconFlow (硅基流动)', label: 'SiliconFlow (硅基流动)' },
    { value: 'Volcengine (火山引擎/豆包)', label: 'Volcengine (火山引擎/豆包)' }
  ]

  const models = {
    'DeepSeek Official': ['deepseek-chat', 'deepseek-reasoner'],
    'SiliconFlow (硅基流动)': [
      'deepseek-ai/DeepSeek-V3',
      'deepseek-ai/DeepSeek-R1',
      'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
      'deepseek-ai/DeepSeek-R1-Distill-Llama-70B'
    ],
    'Volcengine (火山引擎/豆包)': ['ep-202xxxx-xxxxx', 'doubao-pro-32k', 'doubao-lite-32k']
  }

  const currentApiKey =
    localConfig.provider === 'DeepSeek Official'
      ? localConfig.api_key_deepseek
      : localConfig.provider === 'SiliconFlow (硅基流动)'
        ? localConfig.api_key_siliconflow
        : localConfig.api_key_volcengine

  const setCurrentApiKey = (value: string) => {
    if (localConfig.provider === 'DeepSeek Official') {
      setLocalConfig({ ...localConfig, api_key_deepseek: value })
    } else if (localConfig.provider === 'SiliconFlow (硅基流动)') {
      setLocalConfig({ ...localConfig, api_key_siliconflow: value })
    } else {
      setLocalConfig({ ...localConfig, api_key_volcengine: value })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold">设置</h2>
          <button
            onClick={toggleSettings}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* API 提供商 */}
            <div>
              <label className="block text-sm font-medium mb-2">API 提供商</label>
              <select
                value={localConfig.provider}
                onChange={(e) => setLocalConfig({ ...localConfig, provider: e.target.value })}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {providers.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-sm font-medium mb-2 text-red-500">API Key *</label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={currentApiKey}
                  onChange={(e) => setCurrentApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-4 py-2 pr-10 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showApiKey ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Base URL */}
            <div>
              <label className="block text-sm font-medium mb-2">Base URL</label>
              <input
                type="text"
                value={localConfig.base_url}
                onChange={(e) => setLocalConfig({ ...localConfig, base_url: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* 模型 */}
            <div>
              <label className="block text-sm font-medium mb-2">模型</label>
              <select
                value={localConfig.model}
                onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {models[localConfig.provider as keyof typeof models]?.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* 最大输出长度 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                最大输出长度: {localConfig.max_tokens}
              </label>
              <input
                type="range"
                min="512"
                max="8192"
                step="256"
                value={localConfig.max_tokens}
                onChange={(e) => setLocalConfig({ ...localConfig, max_tokens: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* 温度 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                随机性 (Temperature): {localConfig.temperature.toFixed(1)}
              </label>
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.1"
                value={localConfig.temperature}
                onChange={(e) => setLocalConfig({ ...localConfig, temperature: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                0.0 = 确定性，1.5 = 创造性
              </div>
            </div>

            {/* 上下文长度 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                上下文记忆: {localConfig.context_limit === 0 ? '无限' : `${localConfig.context_limit} 条`}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={localConfig.context_limit}
                onChange={(e) => setLocalConfig({ ...localConfig, context_limit: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* 系统提示词 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">系统提示词 / 人物设定</label>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <Upload size={16} />
                  加载本地文件
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
              <textarea
                value={localConfig.system_prompt}
                onChange={(e) => setLocalConfig({ ...localConfig, system_prompt: e.target.value })}
                rows={6}
                placeholder="输入系统提示词或人物设定，也可以点击上方按钮加载本地 .txt 或 .md 文件"
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                支持加载 .txt 和 .md 格式的人物设定文件
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleSettings}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Save size={18} />
            保存设置
          </button>
        </div>
      </div>
    </div>
  )
}


