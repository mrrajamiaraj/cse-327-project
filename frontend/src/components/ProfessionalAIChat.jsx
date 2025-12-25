import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function ProfessionalAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      loadChatSessions();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatSessions = async () => {
    try {
      const response = await api.get('/customer/ai-chat/sessions/');
      setChatSessions(response.data);
      
      // Load the most recent session if exists
      if (response.data.length > 0 && !currentSession) {
        loadSession(response.data[0].id);
      }
    } catch (error) {
      console.error("Error loading chat sessions:", error);
    }
  };

  const loadSession = async (sessionId) => {
    try {
      const response = await api.get(`/customer/ai-chat/${sessionId}/messages/`);
      setCurrentSession({ id: sessionId, title: response.data.title });
      
      // Convert messages to chat format
      const chatMessages = [];
      response.data.messages.forEach(msg => {
        chatMessages.push({ type: 'user', content: msg.message, timestamp: msg.created_at });
        chatMessages.push({ type: 'bot', content: msg.response, timestamp: msg.created_at });
      });
      setMessages(chatMessages);
    } catch (error) {
      console.error("Error loading session:", error);
    }
  };

  const createNewChat = () => {
    setCurrentSession(null);
    setMessages([]);
  };

  const deleteSession = async (sessionId) => {
    try {
      await api.delete(`/customer/ai-chat/${sessionId}/delete_session/`);
      setChatSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (currentSession?.id === sessionId) {
        createNewChat();
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const loadMessages = async (sessionId) => {
    try {
      const response = await api.get(`/customer/ai-chat/${sessionId}/messages/`);
      setMessages(response.data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage = newMessage.trim();
    setNewMessage("");
    
    // Add user message immediately
    const userMsg = { 
      type: 'user', 
      content: userMessage, 
      timestamp: new Date().toISOString() 
    };
    setMessages(prev => [...prev, userMsg]);
    
    setIsLoading(true);
    setIsTyping(true);

    try {
      const location = sessionStorage.getItem('currentSessionLocation');
      const locationData = location ? JSON.parse(location) : null;

      const response = await api.post('/customer/ai-chat/', {
        message: userMessage,
        location: locationData?.address || null,
        session_id: currentSession?.id || null
      });

      setIsTyping(false);

      // Update current session if new
      if (!currentSession) {
        setCurrentSession({ id: response.data.session_id, title: userMessage });
        loadChatSessions(); // Refresh sessions list
      }

      // Add bot response
      const botMsg = {
        type: 'bot',
        content: response.data.response,
        timestamp: response.data.created_at,
        recommendations: response.data.recommendations || []
      };
      
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      setIsTyping(false);
      console.error("Error sending message:", error);
      
      const errorMsg = {
        type: 'bot',
        content: "Sorry, I'm having trouble right now. Please try again in a moment!",
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFoodClick = (food) => {
    // Navigate to restaurant page with the specific food highlighted
    navigate('/restaurant-view', { 
      state: { 
        restaurant: { 
          id: food.restaurant_id || food.id, 
          name: food.restaurant 
        },
        highlightFoodId: food.id // Pass the food ID to highlight it
      } 
    });
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="floating-chat-button"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '50%',
          transform: 'translateX(50%)',
          marginRight: '-190px', // Position within the 420px max container width
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${ORANGE} 0%, #ff9533 100%)`,
          border: 'none',
          boxShadow: '0 4px 20px rgba(255, 122, 0, 0.4)',
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.3rem',
          color: 'white',
          transition: 'all 0.3s ease'
        }}
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Professional Chat Interface */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '95vw',
            maxWidth: '400px',
            height: '70vh',
            maxHeight: '500px',
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
          }}
        >
          {/* Mobile-First Chat Interface - No Sidebar */}
          
          {/* Chat Header */}
          <div
            style={{
              padding: '16px',
              borderBottom: '1px solid #e5e7eb',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#6b7280'
                }}
              >
                ☰
              </button>
              
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${ORANGE} 0%, #ff9533 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem'
                }}
              >
                🤖
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1f2937' }}>
                  FoodieBot AI
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                  Powered by Google Gemma 2B-IT
                </div>
              </div>
            </div>

            {/* New Chat Button */}
            <button
              onClick={createNewChat}
              style={{
                background: 'none',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              + New
            </button>
          </div>

          {/* Mobile Sidebar Overlay */}
          {showMobileSidebar && (
            <>
              {/* Backdrop */}
              <div
                onClick={() => setShowMobileSidebar(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.5)',
                  zIndex: 1001
                }}
              />
              
              {/* Sidebar */}
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '85vw',
                  maxWidth: '320px',
                  height: '100vh',
                  background: '#fff',
                  zIndex: 1002,
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
                  transform: showMobileSidebar ? 'translateX(0)' : 'translateX(-100%)',
                  transition: 'transform 0.3s ease'
                }}
              >
                {/* Sidebar Header */}
                <div style={{
                  padding: '20px',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Chat History</h3>
                  <button
                    onClick={() => setShowMobileSidebar(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      color: '#6b7280'
                    }}
                  >
                    ✕
                  </button>
                </div>
                
                {/* Chat Sessions List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                  {chatSessions.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px 20px',
                      color: '#6b7280'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '12px' }}>💬</div>
                      <div style={{ fontSize: '0.9rem' }}>No chat history yet</div>
                      <div style={{ fontSize: '0.8rem', marginTop: '8px' }}>
                        Start a conversation to see your chats here
                      </div>
                    </div>
                  ) : (
                    chatSessions.map((session) => (
                      <div
                      key={session.id}
                      onClick={() => {
                        loadSession(session.id);
                        setShowMobileSidebar(false);
                      }}
                      style={{
                        padding: '12px',
                        margin: '4px 0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: currentSession?.id === session.id ? '#f3f4f6' : 'transparent',
                        border: '1px solid #e5e7eb',
                        position: 'relative'
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: '4px' }}>
                        {session.title || `Chat ${session.id}`}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                        {new Date(session.created_at).toLocaleDateString()}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          color: '#ef4444'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  )))}
                </div>
              </div>
            </>
          )}

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              background: '#f9fafb'
            }}
          >
              {messages.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    color: '#6b7280',
                    marginTop: '60px'
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👋</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>
                    Welcome to FoodieBot!
                  </div>
                  <div style={{ fontSize: '0.9rem', marginBottom: '24px' }}>
                    Tell me about your mood and I'll suggest perfect food for you!
                  </div>
                  
                  {/* Quick Starters */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                    {[
                      "I'm feeling happy! 😊",
                      "Need comfort food 😔",
                      "Something healthy? 🥗",
                      "Spicy mood! 🌶️"
                    ].map((starter, index) => (
                      <button
                        key={index}
                        onClick={() => setNewMessage(starter)}
                        style={{
                          padding: '8px 16px',
                          background: '#fff',
                          border: `1px solid ${ORANGE}`,
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          color: ORANGE,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = ORANGE;
                          e.target.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#fff';
                          e.target.style.color = ORANGE;
                        }}
                      >
                        {starter}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div key={index} style={{ marginBottom: '20px' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                          alignItems: 'flex-start',
                          gap: '12px'
                        }}
                      >
                        {message.type === 'bot' && (
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: `linear-gradient(135deg, ${ORANGE} 0%, #ff9533 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.9rem',
                              flexShrink: 0
                            }}
                          >
                            🤖
                          </div>
                        )}
                        
                        <div
                          style={{
                            maxWidth: '70%',
                            padding: '12px 16px',
                            borderRadius: message.type === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            background: message.type === 'user' ? ORANGE : '#fff',
                            color: message.type === 'user' ? '#fff' : '#1f2937',
                            fontSize: '0.9rem',
                            lineHeight: '1.5',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            border: message.type === 'bot' ? '1px solid #e5e7eb' : 'none'
                          }}
                        >
                          {message.content}
                          
                          {/* Food Recommendations */}
                          {message.recommendations && message.recommendations.length > 0 && (
                            <div style={{ marginTop: '16px' }}>
                              <div style={{ 
                                fontSize: '0.8rem', 
                                fontWeight: 600, 
                                marginBottom: '12px',
                                color: '#6b7280'
                              }}>
                                🍽️ Recommended for you:
                              </div>
                              {message.recommendations.map((food, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleFoodClick(food)}
                                  style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '12px',
                                    margin: '6px 0',
                                    background: '#f8f9fa',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem',
                                    color: '#1f2937',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.background = ORANGE;
                                    e.target.style.color = '#fff';
                                    e.target.style.borderColor = ORANGE;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.background = '#f8f9fa';
                                    e.target.style.color = '#1f2937';
                                    e.target.style.borderColor = '#e5e7eb';
                                  }}
                                >
                                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                                    {food.name}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                                    {food.restaurant} • ৳{food.price}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {message.type === 'user' && (
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: '#e5e7eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.9rem',
                              flexShrink: 0
                            }}
                          >
                            👤
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '20px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${ORANGE} 0%, #ff9533 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.9rem'
                        }}
                      >
                        🤖
                      </div>
                      <div
                        style={{
                          padding: '12px 16px',
                          borderRadius: '16px 16px 16px 4px',
                          background: '#fff',
                          border: '1px solid #e5e7eb',
                          fontSize: '0.9rem',
                          color: '#6b7280'
                        }}
                      >
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <span>FoodieBot is thinking</span>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {[0, 1, 2].map(i => (
                              <div
                                key={i}
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  background: '#ccc',
                                  animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

          {/* Input Area */}
          <div
            style={{
              padding: '16px',
              borderTop: '1px solid #e5e7eb',
              background: '#fff'
            }}
          >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tell me about your mood or what you're craving..."
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '0.9rem',
                    resize: 'none',
                    outline: 'none',
                    fontFamily: 'inherit',
                    maxHeight: '100px',
                    minHeight: '48px',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = ORANGE}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  rows={1}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isLoading}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    border: 'none',
                    background: (!newMessage.trim() || isLoading) ? '#d1d5db' : ORANGE,
                    color: 'white',
                    cursor: (!newMessage.trim() || isLoading) ? 'not-allowed' : 'pointer',
                    fontSize: '1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    if (newMessage.trim() && !isLoading) {
                      e.target.style.background = '#e66a00';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (newMessage.trim() && !isLoading) {
                      e.target.style.background = ORANGE;
                    }
                  }}
                >
                  {isLoading ? '⏳' : '➤'}
                </button>
              </div>
            </div>
        </div>
      )}

      {/* CSS Animation for typing indicator and mobile responsiveness */}
      <style jsx>{`
        @keyframes pulse {
          0%, 60%, 100% {
            opacity: 0.3;
          }
          30% {
            opacity: 1;
          }
        }
        
        @media (max-width: 767px) {
          .chat-sidebar {
            width: 80px !important;
          }
        }
        
        /* Ensure floating button stays within mobile container */
        @media (max-width: 420px) {
          .floating-chat-button {
            right: 10px !important;
            margin-right: 0 !important;
            transform: none !important;
          }
        }
      `}</style>
    </>
  );
}