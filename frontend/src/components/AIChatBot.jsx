import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      loadChatHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = async () => {
    try {
      const response = await api.get('/customer/ai-chat/history/');
      const history = response.data.map(msg => [
        { type: 'user', content: msg.message, timestamp: msg.created_at },
        { type: 'bot', content: msg.response, timestamp: msg.created_at }
      ]).flat();
      setMessages(history);
    } catch (error) {
      console.error("Error loading chat history:", error);
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
      // Get user location if available
      const location = sessionStorage.getItem('currentSessionLocation');
      const locationData = location ? JSON.parse(location) : null;

      const response = await api.post('/customer/ai-chat/', {
        message: userMessage,
        location: locationData?.address || null
      });

      setIsTyping(false);

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
    // Navigate to restaurant or food details
    navigate('/restaurant-view', { 
      state: { 
        restaurant: { id: food.restaurant_id, name: food.restaurant } 
      } 
    });
    setIsOpen(false);
  };

  const quickSuggestions = [
    "I'm feeling happy today! 😊",
    "I need some comfort food 😔",
    "What's good for a healthy meal? 🥗",
    "I want something spicy! 🌶️",
    "Suggest something for a date night 💕",
    "I'm stressed, what should I eat? 😰"
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${ORANGE} 0%, #ff9533 100%)`,
          border: 'none',
          boxShadow: '0 4px 20px rgba(255, 122, 0, 0.4)',
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          color: 'white',
          transition: 'all 0.3s ease',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = isOpen ? 'rotate(45deg) scale(1.1)' : 'rotate(0deg) scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = isOpen ? 'rotate(45deg) scale(1)' : 'rotate(0deg) scale(1)';
        }}
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '350px',
            height: '500px',
            background: '#fff',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
          }}
        >
          {/* Header */}
          <div
            style={{
              background: `linear-gradient(135deg, ${ORANGE} 0%, #ff9533 100%)`,
              color: 'white',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{ fontSize: '1.5rem' }}>🤖</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>FoodieBot</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>
                Your AI food companion (Powered by GPT-2)
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              background: '#f8f9fa'
            }}
          >
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>👋</div>
                <div style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                  Hi! I'm FoodieBot. Tell me about your mood and I'll suggest perfect food for you!
                </div>
                
                {/* Quick Suggestions */}
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '8px' }}>
                    Try asking:
                  </div>
                  {quickSuggestions.slice(0, 3).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setNewMessage(suggestion)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '8px 12px',
                        margin: '4px 0',
                        background: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        color: '#666',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#f0f0f0';
                        e.target.style.borderColor = ORANGE;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#fff';
                        e.target.style.borderColor = '#e0e0e0';
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div key={index} style={{ marginBottom: '12px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '80%',
                          padding: '10px 14px',
                          borderRadius: '16px',
                          background: message.type === 'user' ? ORANGE : '#fff',
                          color: message.type === 'user' ? '#fff' : '#333',
                          fontSize: '0.8rem',
                          lineHeight: '1.4',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          border: message.type === 'bot' ? '1px solid #e0e0e0' : 'none'
                        }}
                      >
                        {message.content}
                        
                        {/* Food Recommendations */}
                        {message.recommendations && message.recommendations.length > 0 && (
                          <div style={{ marginTop: '12px' }}>
                            <div style={{ 
                              fontSize: '0.7rem', 
                              fontWeight: 600, 
                              marginBottom: '8px',
                              color: '#666'
                            }}>
                              Recommended for you:
                            </div>
                            {message.recommendations.map((food, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleFoodClick(food)}
                                style={{
                                  display: 'block',
                                  width: '100%',
                                  padding: '8px 10px',
                                  margin: '4px 0',
                                  background: '#f8f9fa',
                                  border: '1px solid #e0e0e0',
                                  borderRadius: '8px',
                                  fontSize: '0.7rem',
                                  color: '#333',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.background = ORANGE;
                                  e.target.style.color = '#fff';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.background = '#f8f9fa';
                                  e.target.style.color = '#333';
                                }}
                              >
                                <div style={{ fontWeight: 600 }}>{food.name}</div>
                                <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>
                                  {food.restaurant} • ৳{food.price}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '16px',
                        background: '#fff',
                        border: '1px solid #e0e0e0',
                        fontSize: '0.8rem',
                        color: '#666'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <span>FoodieBot is thinking</span>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[0, 1, 2].map(i => (
                            <div
                              key={i}
                              style={{
                                width: '4px',
                                height: '4px',
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

          {/* Input */}
          <div
            style={{
              padding: '16px',
              borderTop: '1px solid #e0e0e0',
              background: '#fff'
            }}
          >
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tell me about your mood..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  border: '1px solid #e0e0e0',
                  borderRadius: '20px',
                  padding: '10px 15px',
                  fontSize: '0.8rem',
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'inherit',
                  maxHeight: '80px',
                  minHeight: '40px'
                }}
                rows={1}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || isLoading}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: 'none',
                  background: (!newMessage.trim() || isLoading) ? '#ccc' : ORANGE,
                  color: 'white',
                  cursor: (!newMessage.trim() || isLoading) ? 'not-allowed' : 'pointer',
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                {isLoading ? '⏳' : '→'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animation for typing indicator */}
      <style jsx>{`
        @keyframes pulse {
          0%, 60%, 100% {
            opacity: 0.3;
          }
          30% {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}