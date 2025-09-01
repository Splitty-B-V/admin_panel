import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import SendbirdChat from './SendbirdChat'
import sendbirdSingleton from '../utils/sendbirdSingleton'
import ErrorBoundary from './ErrorBoundary'

// APP_ID is now in sendbirdSingleton

export default function SupportWidget() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [conversations, setConversations] = useState([])
  const [expandedFAQ, setExpandedFAQ] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [hasActiveChat, setHasActiveChat] = useState(false)
  const messagesEndRef = useRef(null)
  const sbRef = useRef(null)

  // Load chat history from Sendbird when messages tab is opened
  useEffect(() => {
    if (activeTab === 'messages' && !sbRef.current) {
      loadChatHistory()
    }
    
    // Check for active chat when widget opens
    if (isOpen && !sbRef.current) {
      checkActiveChat()
    }
    
    // Cleanup on unmount
    return () => {
      // Don't disconnect the singleton
      sbRef.current = null
    }
  }, [activeTab, isOpen])
  
  const checkActiveChat = async () => {
    try {
      const restaurantId = localStorage.getItem('restaurant_id') || 'REST_LIMON_001'
      const sendbirdUserId = `restaurant_${restaurantId}`
      const channelUrl = `support_${restaurantId}`
      
      // Connect using singleton
      await sendbirdSingleton.connect(sendbirdUserId)
      const sb = sendbirdSingleton.getInstance()
      
      sb.GroupChannel.getChannel(channelUrl, (channel, error) => {
        if (!error && channel) {
          // Check if channel is active
          let channelData = {}
          try {
            channelData = JSON.parse(channel.data || '{}')
          } catch (e) {
            console.log('Error parsing channel data')
          }
          
          // If channel exists and is not closed, there's an active chat
          if (channelData.status !== 'closed' && channelData.status !== 'resolved') {
            setHasActiveChat(true)
          } else {
            setHasActiveChat(false)
          }
        } else {
          setHasActiveChat(false)
        }
      })
    } catch (error) {
      console.error('Error checking active chat:', error)
      setHasActiveChat(false)
    }
  }

  const loadChatHistory = async () => {
    setLoadingHistory(true)
    try {
      const restaurantId = localStorage.getItem('restaurant_id') || 'REST_LIMON_001'
      const sendbirdUserId = `restaurant_${restaurantId}`
      const channelUrl = `support_${restaurantId}`
      
      // Connect using singleton
      await sendbirdSingleton.connect(sendbirdUserId)
      const sb = sendbirdSingleton.getInstance()
      sbRef.current = sb
      
      loadChannelMessages(sb, channelUrl)
    } catch (error) {
      console.error('Error loading chat history:', error)
      setLoadingHistory(false)
      setChatHistory([])
    }
  }

  const loadChannelMessages = (sb, channelUrl) => {
    // Add timeout for channel operations
    const channelTimeout = setTimeout(() => {
      console.log('Channel operation timeout')
      setLoadingHistory(false)
      setChatHistory([])
    }, 8000)
    
    sb.GroupChannel.getChannel(channelUrl, (channel, error) => {
      clearTimeout(channelTimeout)
      
      if (error) {
        console.log('No channel found')
        setLoadingHistory(false)
        setChatHistory([])
        return
      }
      
      // Load messages from the channel
      const messageListQuery = channel.createPreviousMessageListQuery()
      messageListQuery.limit = 50
      messageListQuery.reverse = true
      
      // Add timeout for message loading
      const messageTimeout = setTimeout(() => {
        console.log('Message loading timeout')
        setLoadingHistory(false)
        setChatHistory([])
      }, 5000)
      
      messageListQuery.load((messageList, error) => {
        clearTimeout(messageTimeout)
        
        if (error) {
          console.error('Error loading messages:', error)
          setLoadingHistory(false)
          setChatHistory([])
          return
        }
        
        // Format messages for display
        const formattedHistory = formatChatHistory(messageList)
        setChatHistory(formattedHistory)
        setLoadingHistory(false)
      })
    })
  }

  const formatChatHistory = (messages) => {
    // Group messages by conversation (split on SYSTEM_CLOSED messages)
    const conversations = []
    let currentConversation = null
    
    messages.forEach((msg, index) => {
      const msgDate = new Date(msg.createdAt)
      const isSupport = msg.sender.userId.startsWith('support_')
      const isClosed = msg.customType === 'SYSTEM_CLOSED'
      
      // Create a new conversation for first message, after closed message, or if more than 1 hour gap
      if (!currentConversation || index === 0 || isClosed ||
          (msg.createdAt - currentConversation.lastMessageTime > 3600000)) {
        
        // If this is a close message, mark the previous conversation as closed
        if (isClosed && currentConversation) {
          currentConversation.isClosed = true
        }
        
        // Start new conversation after close message
        if (!isClosed) {
          currentConversation = {
            id: `conv_${msg.messageId}`,
            messages: [],
            lastMessage: msg.message,
            lastMessageTime: msg.createdAt,
            senderName: isSupport ? 'Support Team' : 'Jij',
            senderAvatar: isSupport ? 'https://ui-avatars.com/api/?name=Support&background=4299e1&color=fff' : 
                                       'https://ui-avatars.com/api/?name=Restaurant&background=48bb78&color=fff',
            timeAgo: formatTimeAgo(msgDate),
            isClosed: false
          }
          conversations.push(currentConversation)
        }
      }
      
      if (currentConversation && !isClosed) {
        currentConversation.messages.push(msg)
        currentConversation.lastMessage = msg.message
        currentConversation.lastMessageTime = msg.createdAt
      }
    })
    
    return conversations
  }

  const formatTimeAgo = (date) => {
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return 'Zojuist'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min. geleden`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} uur geleden`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} d. geleden`
    if (diff < 2592000000) return `${Math.floor(diff / 604800000)} wk. geleden`
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
  }

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Send message
  const sendMessage = (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputMessage,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        text: 'Bedankt voor je bericht! Een van onze teamleden zal zo snel mogelijk reageren.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
      
      // Add to conversations
      if (conversations.length === 0 || conversations[0].messages.length > 0) {
        setConversations(prev => [{
          id: Date.now(),
          preview: inputMessage.substring(0, 50),
          timestamp: new Date().toISOString(),
          messages: [userMessage, botResponse]
        }, ...prev])
      }
    }, 1500)
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div 
          id="support-widget-trigger"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-50 cursor-pointer group"
        >
          <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div 
          className="fixed bottom-5 right-5 z-50 flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
          style={{ width: '440px', height: '680px' }}
        >
          {/* Header with gradient background - only show on home tab and not in chat */}
          {!showChat && activeTab === 'home' && (
            <div className="relative">
              {/* Gradient background */}
              <div className="absolute inset-0 h-48 bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500" />
              
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 z-10 p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 16 16">
                  <path d="M13.25 3.95L12.05 2.75L8 6.8L3.95 2.75L2.75 3.95L6.8 8L2.75 12.05L3.95 13.25L8 9.2L12.05 13.25L13.25 12.05L9.2 8L13.25 3.95Z" fill="currentColor" />
                </svg>
              </button>
              
              {/* Header content */}
              <div className="relative px-6 pt-12 pb-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    {/* Logo */}
                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                      <img src="/logo-trans.webp" alt="Splitty" className="w-8 h-8" />
                    </div>
                    
                    {/* Team avatars */}
                    <div className="flex -space-x-2">
                      <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-purple-500">
                        <img src="https://static.intercomassets.com/avatars/7983956/square_128/Scherm%C2%ADafbeelding_2025-01-29_om_14.49.27-1738158578.png" alt="Shay" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-green-500">
                        <img src="https://static.intercomassets.com/avatars/6615041/square_128/Profile_Photo-1713533689.jpeg" alt="Adrianna" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-yellow-500">
                        <img src="https://static.intercomassets.com/avatars/5693990/square_128/Rinkel_Martijn_Knol-1662988381.png" alt="Martijn" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Greeting */}
                <div className="text-white">
                  <h1 className="text-2xl font-semibold mb-1">Hallo {user?.name?.split(' ')[0] || 'daar'} 👋</h1>
                  <p className="text-base opacity-90">Hoe kunnen we je helpen?</p>
                </div>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-hidden bg-gray-50">
            {/* Chat View - Shows when "Stel een vraag" is clicked */}
            {showChat && (
              <SendbirdChat onClose={() => {
                setShowChat(false)
                setHasActiveChat(false)
                // Reload chat history after closing
                if (activeTab === 'messages') {
                  loadChatHistory()
                }
                // Check for active chat again
                checkActiveChat()
              }} />
            )}
            
            {/* Original mock chat - hidden now, using Sendbird instead */}
            {false && showChat && (
              <div className="flex flex-col h-full bg-white">
                {/* Chat Header */}
                <div className="border-b border-gray-200 bg-white">
                  <nav className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setShowChat(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 16 16">
                          <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <h1 className="text-base font-semibold text-gray-900">Nieuw gesprek</h1>
                      <div className="w-10"></div>
                    </div>
                  </nav>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : ''}`}>
                          {message.type === 'bot' && (
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                                </svg>
                              </div>
                              <span className="text-xs text-gray-500 font-medium">Splitty AI • Support Team</span>
                            </div>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-3 ${
                              message.type === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-200 text-gray-800'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.text}</p>
                          </div>
                          {message.type === 'bot' && (
                            <div className="mt-1 text-xs text-gray-400 ml-2">Zojuist</div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%]">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                              </svg>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">Splitty AI is aan het typen...</span>
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
                    <div className="flex items-center space-x-1">
                      <button type="button" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                      <button type="button" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </button>
                      <button
                        type="submit"
                        disabled={!inputMessage.trim()}
                        className={`p-2 rounded-lg transition-colors ${
                          inputMessage.trim() 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {!showChat && activeTab === 'home' && (
              <div className="p-5 space-y-3">
                {/* Search bar */}
                <button
                  onClick={() => {}}
                  className="w-full bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">Vind je antwoord</span>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 16 16">
                      <circle cx="7.5" cy="7.5" r="4.625" stroke="currentColor" strokeWidth="1.75" />
                      <path d="M13.3813 14.6187C13.723 14.9604 14.277 14.9604 14.6187 14.6187C14.9604 14.277 14.9604 13.723 14.6187 13.3813L13.3813 14.6187ZM10.3813 11.6187L13.3813 14.6187L14.6187 13.3813L11.6187 10.3813L10.3813 11.6187Z" fill="currentColor" />
                    </svg>
                  </div>
                </button>

                {/* Start Conversation */}
                <button
                  onClick={() => {
                    // Always open a fresh chat
                    setShowChat(true)
                    setHasActiveChat(true)
                  }}
                  className="w-full bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">Stel een vraag</p>
                      <p className="text-xs text-gray-500">Onze bot en ons team kunnen je helpen</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 13 15">
                          <path d="M6.29 0a6.29 6.29 0 0 1 6.29 6.29c0 6.29-6.284 8.71-6.284 8.71v-2.42H6.29A6.29 6.29 0 1 1 6.29 0m.58 9.103a.578.578 0 1 0 0 .001zm-.578-5.71c-1.01 0-1.84.78-1.925 1.77l.957.135a.97.97 0 0 1 1.938.028c0 .964-1.355.964-1.355 2.312v.108h.77v-.108c0-.77 1.547-.963 1.547-2.312a1.934 1.934 0 0 0-1.932-1.932z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>

                {/* FAQ */}
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="w-full bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">Veelgestelde vragen 💡</h3>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M5.42773 4.70898C5.46387 4.85254 5.53809 4.98828 5.65039 5.10059L8.54932 8L5.64893 10.9004C5.31689 11.2324 5.31689 11.7705 5.64893 12.1025C5.98096 12.4336 6.51904 12.4336 6.85107 12.1025L10.3516 8.60059C10.5591 8.39355 10.6367 8.10449 10.585 7.83691C10.5537 7.67578 10.4761 7.52246 10.3516 7.39844L6.85254 3.89941C6.52051 3.56738 5.98242 3.56738 5.65039 3.89941C5.43066 4.11816 5.35645 4.42871 5.42773 4.70898Z" />
                    </svg>
                  </div>
                  
                  {/* FAQ info */}
                  <div className="mb-3">
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                      <span>6 vragen</span>
                      <span>•</span>
                      <span>Direct antwoord</span>
                    </div>
                  </div>
                  
                  {/* Popular question preview */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Populair:</span>
                    <span className="text-xs text-gray-700">Hoe koppel ik mijn POS-systeem?</span>
                  </div>
                </button>
              </div>
            )}

            {!showChat && activeTab === 'messages' && (
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                  <nav className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1"></div>
                      <h1 className="text-base font-semibold text-gray-900">Berichten</h1>
                      <div className="flex-1 flex justify-end">
                        <button
                          onClick={() => setActiveTab('home')}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 16 16">
                            <path d="M13.25 3.95L12.05 2.75L8 6.8L3.95 2.75L2.75 3.95L6.8 8L2.75 12.05L3.95 13.25L8 9.2L12.05 13.25L13.25 12.05L9.2 8L13.25 3.95Z" fill="currentColor" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </nav>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto bg-white">
                  {loadingHistory ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm text-gray-500">Gesprekken laden...</p>
                      </div>
                    </div>
                  ) : chatHistory.length > 0 ? (
                    <ul className="divide-y divide-gray-100">
                      {chatHistory.map((conversation) => (
                        <li key={conversation.id}>
                          <div 
                            className="px-4 py-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-start space-x-3"
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              setShowChat(true)
                              // Load the conversation messages
                              const formattedMessages = conversation.messages.map(msg => ({
                                id: msg.messageId,
                                type: msg.sender.userId.startsWith('support_') ? 'bot' : 'user',
                                text: msg.message,
                                timestamp: msg.createdAt
                              }))
                              setMessages(formattedMessages)
                            }}
                          >
                            <div className="flex-shrink-0">
                              <div className="w-9 h-9 rounded-full overflow-hidden">
                                <img 
                                  src={conversation.senderAvatar}
                                  alt={`Profile image for ${conversation.senderName}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-gray-700 line-clamp-2">
                                <span>{conversation.lastMessage}</span>
                              </div>
                              <div className="mt-1 flex items-center text-xs text-gray-500">
                                <span className="font-medium">{conversation.senderName}</span>
                                <span className="mx-1">•</span>
                                <span>{conversation.timeAgo}</span>
                                {conversation.isClosed && (
                                  <>
                                    <span className="mx-1">•</span>
                                    <span className="text-red-500">Gesloten</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              <svg className="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
                                <path d="M5.42773 4.70898C5.46387 4.85254 5.53809 4.98828 5.65039 5.10059L8.54932 8L5.64893 10.9004C5.31689 11.2324 5.31689 11.7705 5.64893 12.1025C5.98096 12.4336 6.51904 12.4336 6.85107 12.1025L10.3516 8.60059C10.5591 8.39355 10.6367 8.10449 10.585 7.83691C10.5537 7.67578 10.4761 7.52246 10.3516 7.39844L6.85254 3.89941C6.52051 3.56738 5.98242 3.56738 5.65039 3.89941C5.43066 4.11816 5.35645 4.42871 5.42773 4.70898Z" fill="currentColor" />
                              </svg>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p className="text-gray-500 text-center">
                        <span className="block font-medium">Nog geen gesprekken</span>
                        <span className="block text-sm mt-1">Start een nieuw gesprek hieronder</span>
                      </p>
                    </div>
                  )}
                </div>
                
                {/* "Stel een vraag" Button at bottom */}
                <div className="border-t border-gray-200 p-4 bg-white">
                  <button
                    onClick={() => {
                      // Always open a fresh chat
                      setShowChat(true)
                      setHasActiveChat(true)
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Stel een vraag</span>
                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="13" height="15" fill="none" viewBox="0 0 13 15">
                      <path fill="currentColor" d="M6.29 0a6.29 6.29 0 0 1 6.29 6.29c0 6.29-6.284 8.71-6.284 8.71v-2.42H6.29A6.29 6.29 0 1 1 6.29 0m.58 9.103a.578.578 0 1 0 0 .001zm-.578-5.71c-1.01 0-1.84.78-1.925 1.77l.957.135a.97.97 0 0 1 1.938.028c0 .964-1.355.964-1.355 2.312v.108h.77v-.108c0-.77 1.547-.963 1.547-2.312a1.934 1.934 0 0 0-1.932-1.932z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {!showChat && activeTab === 'tasks' && (
              <div className="flex flex-col h-full bg-white">
                {/* Header */}
                <div className="border-b border-gray-200">
                  <nav className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1"></div>
                      <h1 className="text-base font-semibold text-gray-900">FAQ</h1>
                      <div className="flex-1 flex justify-end">
                        <button
                          onClick={() => setActiveTab('home')}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 16 16">
                            <path d="M13.25 3.95L12.05 2.75L8 6.8L3.95 2.75L2.75 3.95L6.8 8L2.75 12.05L3.95 13.25L8 9.2L12.05 13.25L13.25 12.05L9.2 8L13.25 3.95Z" fill="currentColor" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </nav>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-5">
                    {/* FAQ Header - Centered */}
                    <div className="mb-6 text-center">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">Veelgestelde vragen 💡</h2>
                      <p className="text-sm text-gray-600 mb-4">Vind snel antwoorden op de meest gestelde vragen</p>
                      
                      {/* Author info - Centered */}
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <img src="https://static.intercomassets.com/avatars/5693990/square_128/Rinkel_Martijn_Knol-1662988381.png" alt="Martijn" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-sm text-gray-600 font-medium">Splitty Support Team</span>
                      </div>
                    </div>
                    
                    {/* FAQ list - Collapsible cards */}
                    <div className="space-y-0">
                      {[
                        { 
                          question: 'Hoe koppel ik mijn POS-systeem aan Splitty?',
                          answer: 'Je kunt je POS-systeem koppelen via Instellingen > Integraties. We ondersteunen alle grote POS-systemen zoals Lightspeed, Untill, en meer.',
                          expanded: false
                        },
                        { 
                          question: 'Wat zijn de kosten van Splitty?',
                          answer: 'Splitty rekent een kleine commissie per transactie. Er zijn geen opstartkosten of maandelijkse kosten. Je betaalt alleen voor wat je gebruikt.',
                          expanded: false
                        },
                        { 
                          question: 'Hoe snel ontvang ik uitbetalingen?',
                          answer: 'Uitbetalingen worden dagelijks verwerkt. Het geld staat meestal binnen 1-2 werkdagen op je rekening.',
                          expanded: false
                        },
                        { 
                          question: 'Kan ik meerdere vestigingen beheren?',
                          answer: 'Ja, met Splitty kun je meerdere vestigingen beheren vanuit één account. Je kunt per vestiging rapportages bekijken en instellingen aanpassen.',
                          expanded: false
                        },
                        { 
                          question: 'Hoe werkt de QR-code betaling?',
                          answer: 'Gasten scannen de QR-code op tafel, zien direct hun rekening, en kunnen betalen met iDEAL, creditcard of andere betaalmethoden.',
                          expanded: false
                        },
                        { 
                          question: 'Is er een klantenservice beschikbaar?',
                          answer: 'Ja, ons support team is bereikbaar van maandag tot vrijdag van 9:00 tot 17:30 via chat, e-mail en telefoon.',
                          expanded: false
                        }
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="border-b border-gray-100 last:border-b-0"
                        >
                          <button
                            onClick={() => setExpandedFAQ(expandedFAQ === i ? null : i)}
                            className="w-full flex items-center py-4 px-1 hover:bg-gray-50 transition-colors text-left group"
                          >
                            <div className="flex items-center flex-1">
                              <h3 className="text-sm font-medium text-gray-900 flex-1 pr-4">
                                {item.question}
                              </h3>
                            </div>
                            <div className="ml-4">
                              <svg 
                                className={`w-4 h-4 text-gray-500 transition-transform ${
                                  expandedFAQ === i ? 'rotate-180' : ''
                                }`} 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 16 16"
                              >
                                <path 
                                  fill="currentColor" 
                                  fillRule="evenodd" 
                                  d="M3.934 5.935a.8.8 0 0 1 1.13 0L8 8.869l2.935-2.934a.8.8 0 0 1 1.13 1.13l-3.5 3.5a.8.8 0 0 1-1.13 0l-3.5-3.5a.8.8 0 0 1 0-1.13" 
                                  clipRule="evenodd" 
                                />
                              </svg>
                            </div>
                          </button>
                          {expandedFAQ === i && (
                            <div className="px-1 pb-4">
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {item.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Bottom Navigation - Intercom Style */}
          <div className="bg-white border-t border-gray-200">
            <div className="flex" role="tablist">
              {/* Home Tab */}
              <button
                onClick={() => setActiveTab('home')}
                className={`flex-1 flex flex-col items-center py-2 px-3 transition-colors relative ${
                  activeTab === 'home' 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                role="tab"
                aria-selected={activeTab === 'home'}
                aria-label="Home"
              >
                {activeTab === 'home' && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
                <svg className="w-6 h-6 mb-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M10.5 2.335 3 7.51c-.625.437-1 1.116-1 1.84V19.7C2 20.965 3.125 22 4.5 22h15c1.375 0 2.5-1.035 2.5-2.3V9.35c0-.724-.375-1.403-1-1.84l-7.5-5.175a2.69 2.69 0 0 0-3 0M7.316 14.366a.85.85 0 1 0-1.132 1.268A8.7 8.7 0 0 0 12 17.852a8.7 8.7 0 0 0 5.816-2.218.85.85 0 1 0-1.132-1.268A7 7 0 0 1 12 16.152c-1.8 0-3.44-.675-4.684-1.786" clipRule="evenodd" />
                </svg>
                <span className="text-[10px] font-medium">Home</span>
              </button>
              
              {/* FAQ Tab */}
              <button
                onClick={() => setActiveTab('tasks')}
                className={`flex-1 flex flex-col items-center py-2 px-3 transition-colors relative ${
                  activeTab === 'tasks' 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                role="tab"
                aria-selected={activeTab === 'tasks'}
                aria-label="FAQ"
              >
                {!showChat && activeTab === 'tasks' && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
                <svg className="w-6 h-6 mb-0.5" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeWidth="1.7" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
                </svg>
                <span className="text-[10px] font-medium">FAQ</span>
              </button>
              
              {/* Messages Tab */}
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex-1 flex flex-col items-center py-2 px-3 transition-colors relative ${
                  activeTab === 'messages' 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                role="tab"
                aria-selected={activeTab === 'messages'}
                aria-label="Berichten"
              >
                {!showChat && activeTab === 'messages' && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
                <svg className="w-6 h-6 mb-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M19 2a3 3 0 0 1 3 3v15.806c0 1.335-1.613 2.005-2.559 1.062L15.56 18H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M17 7a.85.85 0 0 1 0 1.7H7A.85.85 0 1 1 7 7zm-5 4a.85.85 0 0 1 0 1.7H7A.85.85 0 0 1 7 11z" clipRule="evenodd" />
                </svg>
                <span className="text-[10px] font-medium">Berichten</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}