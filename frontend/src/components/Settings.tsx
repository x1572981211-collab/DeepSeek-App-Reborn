import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store'
import { X, Save, Upload } from 'lucide-react'

export default function Settings() {
  const { config, updateConfig, toggleSettings } = useStore()
  const [localConfig, setLocalConfig] = useState(config)
  const [showApiKey, setShowApiKey] = useState(false)
  const [newCustomModel, setNewCustomModel] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const userAvatarInputRef = useRef<HTMLInputElement>(null)
  const aiAvatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'user' | 'ai') => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setLocalConfig(prev => prev ? { ...prev, [target === 'user' ? 'user_avatar' : 'ai_avatar']: base64 } : null)
    }
    reader.readAsDataURL(file)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setLocalConfig(prev => prev ? { ...prev, system_prompt: content } : null)
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
                onChange={(e) => {
                  const newProvider = e.target.value;
                  let newBaseUrl = localConfig.base_url;
                  let newModel = localConfig.model;

                  if (newProvider === 'DeepSeek Official') {
                    newBaseUrl = 'https://api.deepseek.com';
                    newModel = 'deepseek-chat';
                  } else if (newProvider === 'SiliconFlow (硅基流动)') {
                    newBaseUrl = 'https://api.siliconflow.cn/v1';
                    newModel = 'deepseek-ai/DeepSeek-V3';
                  } else if (newProvider === 'Volcengine (火山引擎/豆包)') {
                    newBaseUrl = 'https://ark.cn-beijing.volces.com/api/v3';
                    newModel = 'ep-202xxxx-xxxxx'; // Users must still replace this
                  }

                  setLocalConfig(prev => {
                    if (!prev) return null;
                    return {
                      ...prev,
                      provider: newProvider,
                      base_url: newBaseUrl,
                      model: newModel
                    };
                  });
                }}
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
                {localConfig.custom_models?.map(m => (
                  <option key={m} value={m}>{m} (自定义)</option>
                ))}
              </select>
            </div>

            {/* 自定义模型管理 */}
            <div>
              <label className="block text-sm font-medium mb-2">自定义模型</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newCustomModel}
                  onChange={(e) => setNewCustomModel(e.target.value)}
                  placeholder="输入你私有部署或第三方支持的模型名称..."
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (newCustomModel.trim()) {
                      setLocalConfig(prev => {
                        if (!prev) return null;
                        const currentModels = prev.custom_models || [];
                        if (!currentModels.includes(newCustomModel.trim())) {
                          return { ...prev, custom_models: [...currentModels, newCustomModel.trim()] };
                        }
                        return prev;
                      });
                      setNewCustomModel('');
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  添加
                </button>
              </div>
              {localConfig.custom_models && localConfig.custom_models.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {localConfig.custom_models.map(m => (
                    <div key={m} className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-2 py-1 rounded text-sm">
                      <span>{m}</span>
                      <button onClick={() => {
                        setLocalConfig(prev => {
                          if (!prev) return null;
                          const newModels = prev.custom_models?.filter(x => x !== m) || [];
                          let selectModel = prev.model;
                          if (prev.model === m) {
                            selectModel = models[prev.provider as keyof typeof models]?.[0] || 'deepseek-chat';
                          }
                          return { ...prev, model: selectModel, custom_models: newModels };
                        });
                      }} className="text-gray-500 hover:text-red-500 ml-1"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 头像设置 */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">我的头像</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                    {localConfig.user_avatar ? <img src={localConfig.user_avatar} alt="User" className="w-full h-full object-cover" /> : <div className="text-gray-500">U</div>}
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    <button onClick={() => userAvatarInputRef.current?.click()} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">上传图片</button>
                    {localConfig.user_avatar && (
                      <button onClick={() => setLocalConfig(prev => prev ? { ...prev, user_avatar: '' } : null)} className="text-red-500 text-xs hover:underline">清除头像</button>
                    )}
                  </div>
                  <input ref={userAvatarInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleAvatarUpload(e, 'user')} />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">AI 头像</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                    {localConfig.ai_avatar ? <img src={localConfig.ai_avatar} alt="AI" className="w-full h-full object-cover" /> : <div className="text-gray-500">AI</div>}
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    <button onClick={() => aiAvatarInputRef.current?.click()} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">上传图片</button>
                    {localConfig.ai_avatar && (
                      <button onClick={() => setLocalConfig(prev => prev ? { ...prev, ai_avatar: '' } : null)} className="text-red-500 text-xs hover:underline">清除头像</button>
                    )}
                  </div>
                  <input ref={aiAvatarInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleAvatarUpload(e, 'ai')} />
                </div>
              </div>
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


