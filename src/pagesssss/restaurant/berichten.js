import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/router'
import chatDatabase from '../../utils/chatDatabase'

export default function Berichten() {
  const { user } = useAuth()
  const router = useRouter()
  const [chatHistory, setChatHistory] = useState(null)
  const [messages, setMessages] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  
  const restaurantId = typeof window !== 'undefined' ? localStorage.getItem('restaurant_id') || 'REST_LIMON_001' : 'REST_LIMON_001'
  const restaurantName = typeof window !== 'undefined' ? localStorage.getItem('restaurant_name') || 'Limon Food & Drinks' : 'Limon Food & Drinks'

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    
    loadChatHistory()
    
    // Auto-refresh chat history every 5 seconds
    const interval = setInterval(() => {
      loadChatHistory()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [user])

  const loadChatHistory = () => {
    // Load chat data from database
    const chat = chatDatabase.getChatByRestaurantId(restaurantId)
    const savedMessages = chatDatabase.getMessages(restaurantId)
    
    setChatHistory(chat)
    setMessages(savedMessages)
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return 'Zojuist'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minuten geleden`
    if (diff < 86400000) {
      return date.toLocaleTimeString('nl-NL', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleDateString('nl-NL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const groupMessagesByDate = (messages) => {
    const groups = {}
    
    messages.forEach(message => {
      const date = new Date(message.createdAt).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })
    
    return groups
  }

  const messageGroups = groupMessagesByDate(messages)
  const isRestaurantUser = (userId) => userId?.includes('restaurant_')

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Berichten</h1>
              <p className="text-sm text-gray-600 mt-1">
                Bekijk je gespreksgeschiedenis met het support team
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {chatHistory?.status === 'open' && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                  💬 Gesprek Open
                </span>
              )}
              {(chatHistory?.status === 'resolved' || chatHistory?.status === 'closed') && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  ✅ Opgelost
                </span>
              )}
              {chatHistory?.priority && (
                <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                  🔴 Prioriteit
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Chat Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Totaal berichten</p>
            <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Laatste bericht</p>
            <p className="text-sm font-medium text-gray-900">
              {messages.length > 0 ? formatTime(messages[messages.length - 1].createdAt) : 'Geen berichten'}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Gesprek gestart</p>
            <p className="text-sm font-medium text-gray-900">
              {chatHistory?.createdAt ? formatTime(chatHistory.createdAt) : 'Nog niet gestart'}
            </p>
          </div>
        </div>

        {/* Messages Display */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Gespreksgeschiedenis</h2>
          </div>
          
          <div className="p-6">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-500 mb-4">Nog geen berichten</p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start een gesprek
                </button>
              </div>
            ) : (
              <div className="space-y-6 max-h-[600px] overflow-y-auto">
                {Object.entries(messageGroups).map(([date, dayMessages]) => (
                  <div key={date}>
                    {/* Date Separator */}
                    <div className="flex items-center justify-center my-4">
                      <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                        {formatDate(dayMessages[0].createdAt)}
                      </div>
                    </div>
                    
                    {/* Messages for this date */}
                    <div className="space-y-3">
                      {dayMessages.map((message) => {
                        const isMe = isRestaurantUser(message.sender?.userId)
                        const isSystem = message.customType?.startsWith('SYSTEM')
                        
                        // Filter out unwanted system messages
                        if (message.customType === 'SYSTEM_PRIORITY') {
                          return null
                        }
                        
                        // Show system messages differently
                        if (isSystem) {
                          if (message.customType === 'SYSTEM_NEW_CHAT') {
                            return (
                              <div key={message.messageId} className="flex justify-center my-4">
                                <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-2 rounded-lg">
                                  {message.message}
                                </div>
                              </div>
                            )
                          }
                          
                          if (message.customType === 'SYSTEM_RESOLVED') {
                            return (
                              <div key={message.messageId} className="flex justify-center my-4">
                                <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2 rounded-lg">
                                  {message.message}
                                </div>
                              </div>
                            )
                          }
                          
                          return (
                            <div key={message.messageId} className="flex justify-center my-2">
                              <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                                {message.message}
                              </div>
                            </div>
                          )
                        }
                        
                        return (
                          <div
                            key={message.messageId}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] ${isMe ? 'order-2' : ''}`}>
                              {!isMe && (
                                <div className="flex items-center space-x-2 mb-1">
                                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                                    </svg>
                                  </div>
                                  <span className="text-xs text-gray-500 font-medium">
                                    {message.sender?.nickname || 'Support Team'}
                                  </span>
                                </div>
                              )}
                              <div
                                className={`rounded-2xl px-4 py-3 ${
                                  isMe
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-gray-200 text-gray-800'
                                }`}
                              >
                                <p className="text-sm leading-relaxed">{message.message}</p>
                              </div>
                              <div className={`mt-1 text-xs text-gray-400 ${isMe ? 'text-right mr-2' : 'ml-2'}`}>
                                {formatTime(message.createdAt)}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {messages.length > 0 && chatHistory?.status === 'open' ? (
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Ga naar Live Chat
              </button>
            </div>
          ) : chatHistory?.status !== 'open' && messages.length > 0 ? (
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">Dit gesprek is afgesloten</p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Start Nieuw Gesprek
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Conversation History */}
        {chatHistory?.conversationHistory && chatHistory.conversationHistory.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Eerdere Gesprekken</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {chatHistory.conversationHistory.map((conv, index) => (
                  <div key={index} className="border-l-4 border-gray-200 pl-4 py-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        Gesprek {index + 1}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(conv.startedAt)} - {formatDate(conv.closedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}