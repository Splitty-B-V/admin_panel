import { useState, useEffect, useContext, useRef } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import LayoutContext from '../contexts/LayoutContext'
import {
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline'

function SupportContent() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const context = useContext(LayoutContext)
  const setSidebarCollapsed = context?.setSidebarCollapsed || (() => {})
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [showInput, setShowInput] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  const [currentStep, setCurrentStep] = useState('initial')
  const [tickets, setTickets] = useState([])
  const [currentTicketId, setCurrentTicketId] = useState(null)
  const [viewingTicket, setViewingTicket] = useState(null)
  const [inactivityWarning, setInactivityWarning] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const messagesEndRef = useRef(null)
  const inactivityTimerRef = useRef(null)
  
  // Function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Generate unique ticket ID
  const generateTicketId = () => {
    return Math.floor(1000 + Math.random() * 9000)
  }

  // Start a new chat session
  const startNewChat = () => {
    const ticketId = generateTicketId()
    setCurrentTicketId(ticketId)
    setViewingTicket(null)
    setMessages([
      {
        id: 1,
        text: `${t('support.welcome')} (Ticket #${ticketId})\n${t('support.howCanWeHelp')}`,
        sender: 'support',
        timestamp: new Date().toISOString(),
        senderName: 'Splitty Support'
      }
    ])
    setShowQuickReplies(true)
    setShowInput(false)
    setCurrentStep('initial')
  }

  // Load tickets and start new session on mount
  useEffect(() => {
    // Load saved tickets
    const savedTickets = localStorage.getItem(`support_tickets_${user?.restaurantName}`)
    if (savedTickets) {
      setTickets(JSON.parse(savedTickets))
    }
    // Start new chat session
    startNewChat()
  }, [user])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-close ticket after 30 minutes of inactivity
  useEffect(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
    }
    setInactivityWarning(false)
    
    if (messages.length <= 1 || viewingTicket) return
    
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.sender !== 'support') return
    
    // Show warning after 25 minutes
    const warningTimer = setTimeout(() => {
      setInactivityWarning(true)
    }, 25 * 60 * 1000)
    
    // Auto-close after 30 minutes
    inactivityTimerRef.current = setTimeout(() => {
      saveTicket('resolved')
      setInactivityWarning(false)
      
      const closeMessage = {
        id: Date.now(),
        text: t('support.messages.autoClosed'),
        sender: 'support',
        timestamp: new Date().toISOString(),
        senderName: 'Splitty Support'
      }
      
      setMessages(prev => [...prev, closeMessage])
      setTimeout(() => {
        startNewChat()
      }, 3000)
    }, 30 * 60 * 1000)
    
    return () => {
      clearTimeout(warningTimer)
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
    }
  }, [messages, viewingTicket])

  // Save current chat as ticket
  const saveTicket = (status = 'open') => {
    if (!currentTicketId || messages.length <= 1) return
    
    const firstUserMessage = messages.find(m => m.sender === 'restaurant')
    const summary = firstUserMessage?.text || messages[1]?.text || t('support.quickResponses.haveQuestion')
    
    const newTicket = {
      id: currentTicketId,
      date: messages[0]?.timestamp || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      summary: summary.substring(0, 100),
      status: status,
      messages: [...messages],
      restaurantName: user?.restaurantName || 'Restaurant',
      messageCount: messages.length
    }
    
    const existingIndex = tickets.findIndex(t => t.id === currentTicketId)
    let updatedTickets
    
    if (existingIndex !== -1) {
      updatedTickets = [...tickets]
      updatedTickets[existingIndex] = newTicket
    } else {
      updatedTickets = [newTicket, ...tickets]
    }
    
    updatedTickets = updatedTickets
      .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
      .slice(0, 10)
    
    setTickets(updatedTickets)
    localStorage.setItem(`support_tickets_${user?.restaurantName}`, JSON.stringify(updatedTickets))
  }

  // View a past ticket
  const viewTicket = (ticket) => {
    setViewingTicket(ticket)
    setMessages(ticket.messages || [])
    setShowQuickReplies(false)
    setShowInput(false)
    setCurrentStep('initial')
    setTimeout(() => {
      const messagesContainer = document.querySelector('.overflow-y-auto')
      if (messagesContainer) {
        messagesContainer.scrollTop = 0
      }
    }, 100)
  }

  // Close current ticket and start new chat
  const closeAndStartNew = () => {
    saveTicket('resolved')
    startNewChat()
  }

  const handleQuickReply = (option) => {
    // Collapse sidebar when sending a message
    setSidebarCollapsed(true)
    localStorage.setItem('restaurant-sidebar-collapsed', 'true')
    
    const userMessage = {
      id: Date.now(),
      text: option,
      sender: 'restaurant',
      timestamp: new Date().toISOString(),
      senderName: user?.restaurantName || 'Restaurant',
      userName: user?.name || 'Manager'
    }
    
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    saveTicket('in_progress')
    
    // Handle different options
    if (option === t('support.quickResponses.haveQuestion')) {
      setShowInput(true)
      setShowQuickReplies(false)
      
      setTimeout(() => {
        const supportResponse = {
          id: Date.now() + 1,
          text: t('support.messages.askQuestion'),
          sender: 'support',
          timestamp: new Date().toISOString(),
          senderName: 'Splitty Support'
        }
        setMessages(prev => [...prev, supportResponse])
      }, 1000)
      
    } else if (option === t('support.quickResponses.haveProblem')) {
      setCurrentStep('problem_details')
      
      setTimeout(() => {
        const supportResponse = {
          id: Date.now() + 1,
          text: t('support.messages.problemResponse'),
          sender: 'support',
          timestamp: new Date().toISOString(),
          senderName: 'Splitty Support'
        }
        setMessages(prev => [...prev, supportResponse])
      }, 1000)
      
    } else if (option === t('support.quickResponses.somethingElse') || option === t('support.problemOptions.somethingElse')) {
      setShowInput(true)
      setShowQuickReplies(false)
      
      setTimeout(() => {
        const supportResponse = {
          id: Date.now() + 1,
          text: t('support.messages.tellUsMore'),
          sender: 'support',
          timestamp: new Date().toISOString(),
          senderName: 'Splitty Support'
        }
        setMessages(prev => [...prev, supportResponse])
      }, 1000)
      
    } else {
      // Handle specific problem selections
      setShowInput(true)
      setShowQuickReplies(false)
      
      let responseText = t('support.messages.thankYouInfo')
      
      switch(option) {
        case t('support.problemOptions.softwareFrozen'):
          responseText += t('support.messages.softwareFrozen')
          break
        case t('support.problemOptions.paymentFailed'):
          responseText += t('support.messages.paymentIssue')
          break
        case t('support.problemOptions.tableNotShowing'):
          responseText += t('support.messages.tableIssue')
          break
        case t('support.problemOptions.tipsIncorrect'):
          responseText += t('support.messages.tipIssue')
          break
        case t('support.problemOptions.qrCodeIssue'):
          responseText += t('support.messages.qrCodeIssue')
          break
        case t('support.problemOptions.loginIssue'):
          responseText += t('support.messages.loginIssue')
          break
      }
      
      setTimeout(() => {
        const supportResponse = {
          id: Date.now() + 1,
          text: responseText,
          sender: 'support',
          timestamp: new Date().toISOString(),
          senderName: 'Splitty Support'
        }
        setMessages(prev => [...prev, supportResponse])
      }, 1000)
    }
  }

  const sendMessage = () => {
    if (!message.trim()) return

    setSidebarCollapsed(true)
    localStorage.setItem('restaurant-sidebar-collapsed', 'true')

    const newMessage = {
      id: Date.now(),
      text: message,
      sender: 'restaurant',
      timestamp: new Date().toISOString(),
      senderName: user?.restaurantName || 'Restaurant',
      userName: user?.name || 'Manager'
    }

    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    saveTicket('in_progress')
    
    setMessage('')
    
    setTimeout(() => {
      const autoResponse = {
        id: Date.now() + 1,
        text: t('support.messages.thankYouMessage'),
        sender: 'support',
        timestamp: new Date().toISOString(),
        senderName: 'Splitty Support'
      }
      
      const messagesWithResponse = [...updatedMessages, autoResponse]
      setMessages(messagesWithResponse)
      
      setTimeout(() => {
        saveTicket('open')
      }, 100)
    }, 2000)
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    if (date.toDateString() === today.toDateString()) {
      return t('support.today')
    }
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
  }

  // Helper function to translate stored ticket summaries
  const getTranslatedSummary = (summary) => {
    // Map of Dutch to translation keys
    const summaryMap = {
      'Ik heb een vraag': t('support.quickResponses.haveQuestion'),
      'Ik heb een probleem': t('support.quickResponses.haveProblem'),
      'Iets anders': t('support.quickResponses.somethingElse'),
      'Algemene vraag': t('support.quickResponses.haveQuestion')
    }
    
    // Return translated version if found, otherwise return original
    return summaryMap[summary] || summary
  }

  return (
    <div className="flex h-full min-h-[calc(100vh-72px)] lg:min-h-screen relative">
      {/* Mobile FAB Button for FAQ */}
      <button
        onClick={() => setShowMobileSidebar(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all"
      >
        <QuestionMarkCircleIcon className="h-6 w-6" />
      </button>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col bg-white h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {viewingTicket ? `Ticket #${viewingTicket.id}` : currentTicketId ? `${t('support.ticketTitle')} #${currentTicketId}` : t('support.title')}
                </h1>
                <p className="text-sm text-gray-500">
                  {viewingTicket ? t('support.messages.viewHistory') : t('support.directContact')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {viewingTicket ? (
                <button
                  onClick={closeAndStartNew}
                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {t('support.messages.newChat')}
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                    <span className="text-sm text-gray-600">{t('support.online')}</span>
                  </div>
                  {messages.length > 1 && (
                    <button
                      onClick={closeAndStartNew}
                      className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      {t('support.messages.endChat')}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3 bg-gradient-to-b from-white via-green-50/10 to-white">
          {/* Inactivity Warning */}
          {inactivityWarning && !viewingTicket && (
            <div className="mx-auto max-w-lg mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  {t('support.messages.autoCloseWarning')}
                </p>
              </div>
            </div>
          )}
          
          {/* Messages */}
          {messages.map((msg, index) => {
            const showDate = index === 0 || 
              formatDate(msg.timestamp) !== formatDate(messages[index - 1].timestamp)
            
            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex justify-center my-6">
                    <span className="text-xs text-gray-400 font-medium">
                      {formatDate(msg.timestamp)}
                    </span>
                  </div>
                )}
                <div className={`flex ${msg.sender === 'restaurant' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-lg ${msg.sender === 'restaurant' ? 'order-2' : ''}`}>
                    <div className="flex items-end space-x-2">
                      {msg.sender === 'support' && (
                        <div className="flex-shrink-0">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-sm">
                            <span className="text-xs font-bold text-white">SS</span>
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="flex items-baseline space-x-2 mb-1.5">
                          <span className="text-xs font-semibold text-gray-700">
                            {msg.sender === 'restaurant' ? msg.userName : msg.senderName}
                          </span>
                          <span className="text-xs text-gray-400">{formatTime(msg.timestamp)}</span>
                        </div>
                        <div className={`rounded-2xl px-4 py-2.5 ${
                          msg.sender === 'restaurant' 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm' 
                            : 'bg-white shadow-sm border border-gray-100 text-gray-800'
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                        </div>
                      </div>
                      {msg.sender === 'restaurant' && (
                        <div className="flex-shrink-0 order-first">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm">
                            <UserCircleIcon className="h-5 w-5 text-gray-700" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
          
          {/* Quick Reply Buttons */}
          {showQuickReplies && (
            <div className="mt-6 px-6">
              {currentStep === 'initial' && (
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => handleQuickReply(t('support.quickResponses.haveQuestion'))}
                    className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-full hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200 font-medium text-sm shadow-sm"
                  >
                    💬 {t('support.quickResponses.haveQuestion')}
                  </button>
                  <button
                    onClick={() => handleQuickReply(t('support.quickResponses.haveProblem'))}
                    className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-full hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200 font-medium text-sm shadow-sm"
                  >
                    ⚠️ {t('support.quickResponses.haveProblem')}
                  </button>
                  <button
                    onClick={() => handleQuickReply(t('support.quickResponses.somethingElse'))}
                    className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-full hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200 font-medium text-sm shadow-sm"
                  >
                    ✨ {t('support.quickResponses.somethingElse')}
                  </button>
                </div>
              )}
              
              {currentStep === 'problem_details' && (
                <div className="grid gap-2 max-w-md mx-auto">
                  <button
                    onClick={() => handleQuickReply(t('support.problemOptions.softwareFrozen'))}
                    className="text-left px-4 py-3 bg-white border border-gray-100 rounded-xl hover:border-green-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 text-sm shadow-sm group"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-lg">🔄</span>
                      <span className="text-gray-700 group-hover:text-gray-900">{t('support.problemOptions.softwareFrozen')}</span>
                    </span>
                  </button>
                  <button
                    onClick={() => handleQuickReply(t('support.problemOptions.paymentFailed'))}
                    className="text-left px-4 py-3 bg-white border border-gray-100 rounded-xl hover:border-green-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 text-sm shadow-sm group"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-lg">💳</span>
                      <span className="text-gray-700 group-hover:text-gray-900">{t('support.problemOptions.paymentFailed')}</span>
                    </span>
                  </button>
                  <button
                    onClick={() => handleQuickReply(t('support.problemOptions.tableNotShowing'))}
                    className="text-left px-4 py-3 bg-white border border-gray-100 rounded-xl hover:border-green-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 text-sm shadow-sm group"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-lg">🪑</span>
                      <span className="text-gray-700 group-hover:text-gray-900">{t('support.problemOptions.tableNotShowing')}</span>
                    </span>
                  </button>
                  <button
                    onClick={() => handleQuickReply(t('support.problemOptions.somethingElse'))}
                    className="text-left px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl hover:border-green-300 hover:from-green-50 hover:to-emerald-50 transition-all duration-200 text-sm shadow-sm group font-medium"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-lg">💭</span>
                      <span className="text-gray-700 group-hover:text-gray-900">{t('support.problemOptions.somethingElse')}</span>
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message Input or Ticket Status */}
        {viewingTicket ? (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">{t('support.messages.archivedTicket')}</p>
                  <p className="text-xs text-gray-500">{t('support.messages.ticketStatus')}: {viewingTicket.status === 'resolved' ? t('support.recentTickets.status.resolved') : viewingTicket.status === 'in_progress' ? t('support.recentTickets.status.inProgress') : t('support.recentTickets.status.open')}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  const updatedTicket = { ...viewingTicket, status: 'open' }
                  const updatedTickets = tickets.map(t => t.id === viewingTicket.id ? updatedTicket : t)
                  setTickets(updatedTickets)
                  localStorage.setItem(`support_tickets_${user?.restaurantName}`, JSON.stringify(updatedTickets))
                  startNewChat()
                }}
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {t('support.messages.reopen')}
              </button>
            </div>
          </div>
        ) : (
          <div className={`px-6 py-4 border-t border-gray-200 bg-white ${!showInput && showQuickReplies ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={t('support.typeMessage')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  message.trim() 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <PaperAirplaneIcon className="h-5 w-5" />
                <span>{t('support.send')}</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {t('support.supportHours')}
            </p>
          </div>
        )}
      </div>

      {/* Right Sidebar - Tickets & FAQ - Desktop */}
      <div className="hidden lg:flex w-80 border-l border-gray-200 bg-white flex-col h-full">
        <div className="p-6 flex flex-col h-full">
          {/* Recent Tickets */}
          {tickets.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">{t('support.recentTickets.title')}</h2>
                {tickets.length > 2 && (
                  <span className="text-xs text-gray-500">{tickets.length} {t('support.recentTickets.total')}</span>
                )}
              </div>
              <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-2">
                  {tickets.slice(0, 10).map((ticket) => {
                    const isViewing = viewingTicket?.id === ticket.id
                    const statusColors = {
                      'open': 'bg-yellow-100 text-yellow-800',
                      'in_progress': 'bg-blue-100 text-blue-800',
                      'resolved': 'bg-green-100 text-green-800'
                    }
                    const statusLabels = {
                      'open': t('support.recentTickets.status.open'),
                      'in_progress': t('support.recentTickets.status.inProgress'),
                      'resolved': t('support.recentTickets.status.resolved')
                    }
                    
                    return (
                      <button
                        key={ticket.id}
                        onClick={() => viewTicket(ticket)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          isViewing 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className="font-medium text-sm text-gray-900">Ticket #{ticket.id}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[ticket.status]}`}>
                            {statusLabels[ticket.status]}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-1 line-clamp-2">{getTranslatedSummary(ticket.summary)}</p>
                        <p className="text-xs text-gray-400">
                          {formatDate(ticket.date)} - {formatTime(ticket.date)}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
          
          {/* FAQ Section */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex-shrink-0">{t('support.faq.title')}</h2>
            
            <div className="flex-1 overflow-y-auto pr-2 mb-4 custom-scrollbar">
              <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                  width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: #f3f4f6;
                  border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: #d1d5db;
                  border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: #9ca3af;
                }
                .custom-scrollbar {
                  scrollbar-width: thin;
                  scrollbar-color: #d1d5db #f3f4f6;
                }
              `}</style>
              <div className="space-y-2">
                {[
                  t('support.faq.questions.addEmployee'),
                  t('support.faq.questions.splitPayment'),
                  t('support.faq.questions.findInvoices'),
                  t('support.faq.questions.changeRestaurantInfo'),
                  t('support.faq.questions.resetTable'),
                  t('support.faq.questions.supportHours'),
                  t('support.faq.questions.exportData'),
                  t('support.faq.questions.changePassword'),
                  t('support.faq.questions.findReports'),
                  t('support.faq.questions.activateDiscounts'),
                  t('support.faq.questions.multipleLocations'),
                  t('support.faq.questions.changeMenu'),
                  t('support.faq.questions.setOpeningHours'),
                  t('support.faq.questions.seeReviews'),
                  t('support.faq.questions.configurePayments')
                ].map((question, index) => (
                  <button 
                    key={index}
                    className="w-full text-left flex items-start gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors group"
                  >
                    <span className="text-green-600 mt-0.5 flex-shrink-0">•</span>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">{question}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 mb-4 flex-shrink-0"></div>

          {/* Contact Info */}
          <div className="space-y-3 flex-shrink-0">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('support.contact.title')}</h3>
            
            <a href="mailto:support@splitty.nl" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">support@splitty.nl</p>
                <p className="text-xs text-gray-500">{t('support.contact.emailSupport')}</p>
              </div>
            </a>
            
            <a href="tel:+31201234567" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <PhoneIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">+31 20 123 4567</p>
                <p className="text-xs text-gray-500">{t('support.contact.hours')}</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowMobileSidebar(false)}
          />
          
          {/* Sidebar Panel */}
          <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{t('support.faq.title')}</h2>
              <button
                onClick={() => setShowMobileSidebar(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Recent Tickets */}
              {tickets.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-900">{t('support.recentTickets.title')}</h3>
                    {tickets.length > 2 && (
                      <span className="text-xs text-gray-500">{tickets.length} {t('support.recentTickets.total')}</span>
                    )}
                  </div>
                  <div className="max-h-[200px] overflow-y-auto pr-2">
                    <div className="space-y-2">
                      {tickets.slice(0, 10).map((ticket) => {
                        const isViewing = viewingTicket?.id === ticket.id
                        const statusColors = {
                          'open': 'bg-yellow-100 text-yellow-800',
                          'in_progress': 'bg-blue-100 text-blue-800',
                          'resolved': 'bg-green-100 text-green-800'
                        }
                        const statusLabels = {
                          'open': t('support.ticket.status.open'),
                          'in_progress': t('support.ticket.status.inProgress'),
                          'resolved': t('support.ticket.status.resolved')
                        }
                        return (
                          <button
                            key={ticket.id}
                            onClick={() => {
                              loadTicket(ticket)
                              setShowMobileSidebar(false)
                            }}
                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                              isViewing 
                                ? 'bg-green-50 border-green-300 shadow-sm' 
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                #{ticket.id}
                              </span>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[ticket.status]}`}>
                                {statusLabels[ticket.status]}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {getTranslatedTicketSummary(ticket.summary)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTicketDate(ticket.date)}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
              
              {/* FAQ Section */}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-900 mb-3">{t('support.faq.title')}</h3>
                <div className="space-y-2">
                  {[
                    t('support.faq.questions.addEmployee'),
                    t('support.faq.questions.splitPayment'),
                    t('support.faq.questions.findInvoices'),
                    t('support.faq.questions.changeRestaurantInfo'),
                    t('support.faq.questions.resetTable'),
                    t('support.faq.questions.supportHours'),
                    t('support.faq.questions.exportData'),
                    t('support.faq.questions.changePassword'),
                    t('support.faq.questions.findReports'),
                    t('support.faq.questions.activateDiscounts'),
                    t('support.faq.questions.multipleLocations'),
                    t('support.faq.questions.changeMenu'),
                    t('support.faq.questions.setOpeningHours'),
                    t('support.faq.questions.seeReviews'),
                    t('support.faq.questions.configurePayments')
                  ].map((question, index) => (
                    <button 
                      key={index}
                      onClick={() => {
                        handleQuickReply(question)
                        setShowMobileSidebar(false)
                      }}
                      className="w-full text-left flex items-start gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors group"
                    >
                      <span className="text-green-600 mt-0.5 flex-shrink-0">•</span>
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">{question}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Contact Info */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('support.contact.title')}</h3>
                
                <a href="mailto:support@splitty.nl" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">support@splitty.nl</p>
                    <p className="text-xs text-gray-500">{t('support.contact.emailSupport')}</p>
                  </div>
                </a>
                
                <a href="tel:+31201234567" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">+31 20 123 4567</p>
                    <p className="text-xs text-gray-500">{t('support.contact.hours')}</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Support() {
  return (
    <Layout>
      <SupportContent />
    </Layout>
  )
}