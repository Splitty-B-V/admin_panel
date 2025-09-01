import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import sendbirdSingleton from '../utils/sendbirdSingleton'
import chatDatabase from '../../utils/chatDatabase'

export default function SendbirdChat({ onClose }) {
  const { user } = useAuth()
  const [sb, setSb] = useState(null)
  const [channel, setChannel] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const channelHandlerRef = useRef(null)
  
  // Restaurant ID from localStorage (set during login)
  const restaurantId = localStorage.getItem('restaurant_id') || 'REST_LIMON_001'
  const sendbirdUserId = `restaurant_${restaurantId}`
  const restaurantName = localStorage.getItem('restaurant_name') || 'Limon Food & Drinks'

  useEffect(() => {
    let mounted = true
    
    const init = async () => {
      if (!mounted) return
      
      try {
        await initializeSendbird()
      } catch (error) {
        console.error('Failed to initialize SendBird:', error)
        setError('Kon niet verbinden met chat service')
        setLoading(false)
      }
    }
    
    init()
    
    return () => {
      mounted = false
      cleanup()
    }
  }, [])

  const cleanup = () => {
    // Save messages before cleanup
    if (messages.length > 0 && restaurantId) {
      chatDatabase.saveMessages(restaurantId, messages)
    }
    
    // Remove handler
    if (channelHandlerRef.current) {
      sendbirdSingleton.removeHandler('RESTAURANT_CHAT_HANDLER')
      channelHandlerRef.current = null
    }
  }

  const initializeSendbird = async () => {
    try {
      // Connect using the global singleton
      const user = await sendbirdSingleton.connect(sendbirdUserId, restaurantName)
      
      if (!user) {
        throw new Error('Could not connect to SendBird')
      }
      
      console.log('Connected to Sendbird as:', user.userId)
      const sendbird = sendbirdSingleton.getInstance()
      
      if (!sendbird) {
        throw new Error('SendBird SDK not available')
      }
      
      setSb(sendbird)
      setConnected(true)
      
      // Get or create support channel
      await getOrCreateChannel(sendbird)
      
    } catch (error) {
      console.error('Error initializing Sendbird:', error)
      setError(error.message)
      setLoading(false)
      setConnected(false)
    }
  }

  const getOrCreateChannel = async (sendbird) => {
    const channelUrl = `support_${restaurantId}`
    
    // First try to get existing channel
    sendbird.GroupChannel.getChannel(channelUrl, async (existingChannel, error) => {
      if (!error && existingChannel) {
        console.log('Found existing channel:', existingChannel.url)
        
        // Check channel status
        let channelData = {}
        try {
          channelData = JSON.parse(existingChannel.data || '{}')
        } catch (e) {
          channelData = {}
        }
        
        // If channel is closed, don't use it - create new one
        if (channelData.status === 'closed' || channelData.status === 'resolved') {
          console.log('Previous channel was closed, creating new one')
          await createNewChannel(sendbird)
          return
        }
        
        // Use existing open channel
        setChannel(existingChannel)
        await loadMessages(existingChannel)
        setupMessageHandler(sendbird, existingChannel)
        setLoading(false)
        
        // Save to database
        chatDatabase.saveChat(restaurantId, {
          channelUrl: existingChannel.url,
          name: existingChannel.name,
          restaurantName: restaurantName,
          status: channelData.status || 'open',
          priority: channelData.priority || false,
          createdAt: existingChannel.createdAt,
          data: channelData
        })
      } else {
        // No existing channel, create new one
        console.log('No existing channel found, creating new one')
        await createNewChannel(sendbird)
      }
    })
  }

  const createNewChannel = async (sendbird) => {
    // Create unique channel URL with timestamp to avoid conflicts
    const timestamp = Date.now()
    const channelUrl = `support_${restaurantId}_${timestamp}`
    
    const params = new sendbird.GroupChannelParams()
    params.isPublic = false
    params.isEphemeral = false
    params.isDistinct = false
    params.channelUrl = channelUrl
    params.name = `Support - ${restaurantName}`
    params.addUserIds([sendbirdUserId])
    params.customType = 'SUPPORT'
    params.data = JSON.stringify({
      restaurant_id: restaurantId,
      restaurant_name: restaurantName,
      status: 'open',
      priority: false,
      createdAt: new Date().toISOString()
    })
    
    // Also add support admin if they exist
    params.addUserIds(['support_admin_001'])

    sendbird.GroupChannel.createChannel(params, (newChannel, error) => {
      if (error) {
        console.error('Error creating channel:', error)
        setError('Kon geen chat kanaal maken')
        setLoading(false)
        return
      }
      
      console.log('Created new channel:', newChannel.url)
      setChannel(newChannel)
      
      // Save new channel to database
      chatDatabase.saveChat(restaurantId, {
        channelUrl: newChannel.url,
        name: newChannel.name,
        restaurantName: restaurantName,
        status: 'open',
        priority: false,
        createdAt: newChannel.createdAt,
        data: {
          restaurant_id: restaurantId,
          restaurant_name: restaurantName
        }
      })
      
      // Send welcome message
      const initialMessage = new sendbird.UserMessageParams()
      initialMessage.message = 'Hallo! Hoe kunnen we je helpen?'
      initialMessage.customType = 'WELCOME'
      
      newChannel.sendUserMessage(initialMessage, (message, error) => {
        if (!error) {
          setMessages([message])
          chatDatabase.saveMessages(restaurantId, [message])
        }
      })
      
      setupMessageHandler(sendbird, newChannel)
      setLoading(false)
    })
  }

  const loadMessages = async (channel) => {
    return new Promise((resolve) => {
      const messageListQuery = channel.createPreviousMessageListQuery()
      messageListQuery.limit = 100
      messageListQuery.reverse = false

      messageListQuery.load((messageList, error) => {
        if (error) {
          console.error('Error loading messages:', error)
          resolve([])
          return
        }
        
        const reversedMessages = messageList.reverse()
        setMessages(reversedMessages)
        
        // Save to database
        if (reversedMessages.length > 0) {
          chatDatabase.saveMessages(restaurantId, reversedMessages)
        }
        
        channel.markAsRead()
        resolve(reversedMessages)
      })
    })
  }

  const setupMessageHandler = (sendbird, channel) => {
    // Remove existing handler first
    sendbirdSingleton.removeHandler('RESTAURANT_CHAT_HANDLER')
    
    const channelHandler = new sendbird.ChannelHandler()
    
    channelHandler.onMessageReceived = (targetChannel, message) => {
      if (targetChannel.url === channel.url) {
        console.log('New message received:', message.message)
        
        // Check if it's a close message
        if (message.customType === 'SYSTEM_RESOLVED' || message.customType === 'SYSTEM_CLOSED') {
          handleChatClosed(message)
          return
        }
        
        setMessages(prev => {
          const newMessages = [...prev, message]
          chatDatabase.saveMessages(restaurantId, newMessages)
          return newMessages
        })
        channel.markAsRead()
      }
    }
    
    channelHandler.onChannelChanged = (targetChannel) => {
      if (targetChannel.url === channel.url) {
        console.log('Channel changed')
        
        // Check if channel was closed
        let channelData = {}
        try {
          channelData = JSON.parse(targetChannel.data || '{}')
        } catch (e) {}
        
        if (channelData.status === 'closed' || channelData.status === 'resolved') {
          console.log('Channel was closed by support')
          handleChatClosed()
        }
        
        // Update priority status if changed
        if (channelData.priority !== undefined) {
          chatDatabase.saveChat(restaurantId, {
            priority: channelData.priority,
            status: channelData.status
          })
        }
      }
    }

    channelHandler.onTypingStatusUpdated = (targetChannel) => {
      if (targetChannel.url === channel.url) {
        const typingMembers = targetChannel.getTypingMembers()
        const supportTyping = typingMembers.some(member => 
          member.userId.startsWith('support_')
        )
        setIsTyping(supportTyping)
      }
    }

    // Store handler reference
    channelHandlerRef.current = channelHandler
    sendbirdSingleton.addHandler('RESTAURANT_CHAT_HANDLER', channelHandler)
  }
  
  const handleChatClosed = (closeMessage) => {
    // Save final state
    if (messages.length > 0) {
      chatDatabase.saveMessages(restaurantId, messages)
      chatDatabase.closeChat(restaurantId, 'resolved')
    }
    
    // Show closing message
    const closingMessage = closeMessage || {
      messageId: 'closed_' + Date.now(),
      message: 'Dit gesprek is gesloten door het support team. Je kunt de geschiedenis bekijken in Berichten.',
      customType: 'SYSTEM_CLOSED',
      createdAt: Date.now(),
      sender: { userId: 'system', nickname: 'System' }
    }
    
    setMessages(prev => [...prev, closingMessage])
    
    // Close chat after delay
    setTimeout(() => {
      onClose()
    }, 3000)
  }

  const sendMessage = (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || !channel || !sb) return

    const params = new sb.UserMessageParams()
    params.message = inputMessage
    params.customType = 'TEXT'

    channel.sendUserMessage(params, (message, error) => {
      if (error) {
        console.error('Error sending message:', error)
        return
      }
      
      setMessages(prev => {
        const newMessages = [...prev, message]
        chatDatabase.saveMessages(restaurantId, newMessages)
        return newMessages
      })
      setInputMessage('')
    })
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return 'Zojuist'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min geleden`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} uur geleden`
    return date.toLocaleDateString('nl-NL')
  }

  // Auto-save messages periodically
  useEffect(() => {
    if (messages.length > 0) {
      const saveTimer = setTimeout(() => {
        chatDatabase.saveMessages(restaurantId, messages)
      }, 5000)
      
      return () => clearTimeout(saveTimer)
    }
  }, [messages, restaurantId])

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="border-b border-gray-200 bg-white">
          <nav className="px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 16 16">
                  <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <h1 className="text-base font-semibold text-gray-900">Support Chat</h1>
              <div className="w-10"></div>
            </div>
          </nav>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Verbinden met support...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !connected) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="border-b border-gray-200 bg-white">
          <nav className="px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 16 16">
                  <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <h1 className="text-base font-semibold text-gray-900">Support Chat</h1>
              <div className="w-10"></div>
            </div>
          </nav>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-900 font-medium mb-2">Kon niet verbinden met support</p>
            <p className="text-gray-600 text-sm">{error || 'Probeer het later opnieuw'}</p>
            <button
              onClick={() => {
                setError(null)
                setLoading(true)
                initializeSendbird()
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Opnieuw proberen
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="border-b border-gray-200 bg-white">
        <nav className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 16 16">
                <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h1 className="text-base font-semibold text-gray-900">Support Chat</h1>
            <div className="w-10"></div>
          </div>
        </nav>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
          {messages.map((message) => {
            const isMe = message.sender.userId === sendbirdUserId
            const isSystem = message.customType?.startsWith('SYSTEM') || message.customType === 'WELCOME'
            
            // System messages
            if (isSystem) {
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
                <div className={`max-w-[80%] ${isMe ? 'order-2' : ''}`}>
                  {!isMe && (
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">
                        {message.sender.nickname || 'Support Team'}
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
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[80%]">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">Support is aan het typen...</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 bg-white p-3">
        <form onSubmit={sendMessage} className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Stel een vraag..."
              className="w-full px-4 py-2.5 pr-10 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className={`p-2.5 rounded-full transition-colors ${
              inputMessage.trim() 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}