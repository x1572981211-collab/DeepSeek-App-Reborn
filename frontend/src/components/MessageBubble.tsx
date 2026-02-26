import React, { useState } from 'react'
import { Message } from '../store'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, User, AlertCircle, RotateCcw, RefreshCw, MessageSquareQuote } from 'lucide-react'

interface MessageBubbleProps {
  message: Message
  index: number
  onRevoke?: (index: number) => void
  onResend?: (index: number) => void
  onQuote?: (content: string) => void
}

const MessageBubble = React.memo(function MessageBubble({ message, index, onRevoke, onResend, onQuote }: MessageBubbleProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  // 解析角色前缀（如 “Name: ” 或 “【Name】 ”）
  let displayName = 'Bot'
  let displayContent = message.content || '💭 思考中...'

  if (!isUser && !isSystem && message.content) {
    // 匹配常规模式: "Name: " 或 "Name："
    const prefixMatch = message.content.match(/^([A-Za-z0-9_\-\u4e00-\u9fa5]+)\s*[:：]\s*/)
    if (prefixMatch) {
      displayName = prefixMatch[1]
      displayContent = message.content.substring(prefixMatch[0].length)
    } else {
      // 匹配中括号模式: "【Name】"
      const bracketMatch = message.content.match(/^【([A-Za-z0-9_\-\u4e00-\u9fa5]+)】\s*/)
      if (bracketMatch) {
        displayName = bracketMatch[1]
        displayContent = message.content.substring(bracketMatch[0].length)
      }
    }
  }

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''} message-bubble`}>
      {/* 头像 */}
      <div className="flex flex-col items-center">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isUser
          ? 'bg-primary-500 text-white'
          : isSystem
            ? 'bg-red-500 text-white'
            : 'bg-purple-500 text-white'
          } `}>
          {isUser ? <User size={20} /> : isSystem ? <AlertCircle size={20} /> : <span className="text-xs font-bold leading-none">{displayName.substring(0, 2)}</span>}
        </div>
        {!isUser && !isSystem && (
          <div className="mt-1 text-[10px] text-gray-400 font-medium truncate max-w-[3rem] text-center" title={displayName}>
            {displayName}
          </div>
        )}
      </div>

      {/* 消息内容 */}
      <div className={`group flex-1 max-w-3xl ${isUser ? 'text-right' : ''} `}>
        <div className={`inline-block text-left px-4 py-3 rounded-2xl ${isUser
          ? 'bg-primary-500 text-white break-words'
          : isSystem
            ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 break-words'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 break-words'
          } `}>
          {isUser ? (
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  code({ className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '')
                    const codeString = String(children).replace(/\n$/, '')
                    const codeId = `code-${Math.random()}`

                    // Check if it's an inline code block by checking if it contains newlines or if explicitly passed.
                    // ReactMarkdown v9 passes node context, but we can usually derive inline from the absence of match.
                    if (!match) {
                      return (
                        <code className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm" {...props}>
                          {children}
                        </code>
                      )
                    }

                    return (
                      <div className="relative group">
                        <button
                          onClick={() => copyToClipboard(codeString, codeId)}
                          className="absolute right-2 top-2 p-2 bg-gray-700 hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="复制代码"
                        >
                          {copiedCode === codeId ? (
                            <Check size={16} className="text-green-400" />
                          ) : (
                            <Copy size={16} className="text-gray-300" />
                          )}
                        </button>
                        <SyntaxHighlighter
                          style={vscDarkPlus as any}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {codeString}
                        </SyntaxHighlighter>
                      </div>
                    )
                  }
                }}
              >
                {displayContent}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* 底部信息和操作栏 */}
        <div className={`flex items-center gap-3 mt-1 px-2 ${isUser ? 'justify-end' : 'justify-start'} `}>
          {message.timestamp && (
            <div className="text-xs text-gray-400 dark:text-gray-500">
              {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}

          {/* 交互按钮栏 */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isUser && onRevoke && (
              <button onClick={() => onRevoke(index)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400 hint-bottom" title="撤回编辑">
                <RotateCcw size={14} />
              </button>
            )}
            {isUser && onResend && (
              <button onClick={() => onResend(index)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400 hint-bottom" title="重新发送">
                <RefreshCw size={14} />
              </button>
            )}
            {onQuote && !isSystem && (
              <button onClick={() => onQuote(message.content)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400 hint-bottom" title="引用">
                <MessageSquareQuote size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

export default MessageBubble



