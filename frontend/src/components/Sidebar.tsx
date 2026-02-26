import { useState } from 'react'
import { useStore } from '../store'
import { Plus, MessageSquare, Trash2, Edit2, Check } from 'lucide-react'

export default function Sidebar() {
  const { sessions, currentSessionId, createSession, deleteSession, switchSession, updateSessionTitle } = useStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleEditStart = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation()
    setEditingId(id)
    setEditTitle(title)
  }

  const handleEditSave = async (e?: React.MouseEvent | React.KeyboardEvent, id?: string) => {
    if (e) e.stopPropagation()
    if (!editingId) return

    const targetId = id || editingId
    if (editTitle.trim()) {
      await updateSessionTitle(targetId, editTitle.trim())
    }
    setEditingId(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleEditSave(e, id)
    } else if (e.key === 'Escape') {
      setEditingId(null)
    }
  }

  return (
    <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* 新建对话按钮 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={createSession}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors font-medium"
        >
          <Plus size={20} />
          新建对话
        </button>
      </div>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto p-2">
        {sessions.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
            <p>暂无对话</p>
          </div>
        ) : (
          sessions.map(session => (
            <div
              key={session.id}
              className={`group relative mb-2 p-3 rounded-lg cursor-pointer transition-all ${currentSessionId === session.id
                ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent'
                }`}
              onClick={() => switchSession(session.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {editingId === session.id ? (
                    <div className="flex items-center gap-2 mb-1" onClick={e => e.stopPropagation()}>
                      <input
                        autoFocus
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, session.id)}
                        onBlur={() => handleEditSave(undefined, session.id)}
                        className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-primary-500 rounded outline-none"
                      />
                      <button onClick={(e) => handleEditSave(e, session.id)} className="text-green-500 hover:text-green-600">
                        <Check size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare size={16} className="flex-shrink-0" />
                      <h3 className="font-medium truncate">{session.title}</h3>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {session.message_count ?? session.messages?.length ?? 0} 条消息
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(session.updated_at).toLocaleString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className={`flex items-center gap-1 transition-all ${deleteConfirmId === session.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  {deleteConfirmId === session.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-red-500 whitespace-nowrap">确认删除?</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteSession(session.id); setDeleteConfirmId(null); }}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        是
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }}
                        className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                      >
                        否
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={(e) => handleEditStart(e, session.id, session.title)}
                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="重命名"
                      >
                        <Edit2 size={16} className="text-gray-500 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteConfirmId(session.id)
                        }}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                        title="删除对话"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 底部信息 */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        <p>DeepSeek App Reborn v2.0</p>
        <p className="mt-1">共 {sessions.length} 个对话</p>
      </div>
    </div>
  )
}





