import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ChatPage.css';

const ChatPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setMessages([{
        id: 0,
        type: 'bot',
        text: `Good Morning, ${parsedUser.firstName}!`,
        subtext: 'I am ready to help you'
      }]);
    } else {
      navigate('/login');
    }
  }, [navigate]);
  const [inputValue, setInputValue] = useState('');
  const [activeNav, setActiveNav] = useState('new-chat');
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessages = [...messages, {
        id: messages.length + 1,
        type: 'user',
        text: inputValue
      }];
      setMessages(newMessages);
      setInputValue('');

      // If this is a new chat (not loaded from history), add it to history
      if (currentChatId === null && messages.length <= 1) {
        const newChatId = Math.max(...chatHistory.map(c => c.id), 0) + 1;
        const newChat = {
          id: newChatId,
          title: inputValue.substring(0, 40),
          messages: newMessages,
          timestamp: new Date().toLocaleString()
        };

        let updatedHistory = [newChat, ...chatHistory];

        // Keep only the last 10 chats
        if (updatedHistory.length > 10) {
          updatedHistory = updatedHistory.slice(0, 10);
        }

        setChatHistory(updatedHistory);
      }
    }
  };

  const handleNewChat = () => {
    setActiveNav('new-chat');
    setCurrentChatId(null);
    if (user) {
      setMessages([
        {
          id: 0,
          type: 'bot',
          text: `Good Morning, ${user.firstName}!`,
          subtext: 'I am ready to help you'
        }
      ]);
    }
  };

  const handleLoadChat = (chatId) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
      setOpenMenuId(null);
    }
  };

  const handleDeleteChat = (chatId, e) => {
    e.stopPropagation();
    setChatHistory(chatHistory.filter(c => c.id !== chatId));
    setOpenMenuId(null);
    if (currentChatId === chatId) {
      handleNewChat();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last;
  };

  const getAvatarColor = (name) => {
    const colors = ['#10a37f', '#7c3aed', '#2563eb', '#dc2626', '#ea580c', '#ca8a04'];
    const charCode = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
    return colors[charCode % colors.length];
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="sidebar-content">
          <div className="sidebar-nav">
            <div
              className={`nav-item ${activeNav === 'new-chat' ? 'active' : ''}`}
              onClick={handleNewChat}
            >
              <span className="nav-icon">💬</span>
              <span className="nav-text">New Chat</span>
            </div>
          </div>

          {/* Recent Section */}
          <div className="recent-section">
            <h4 className="recent-title">Recent</h4>
            <div className="recent-items">
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className="recent-item-wrapper"
                  onMouseEnter={() => setHoveredItemId(chat.id)}
                  onMouseLeave={() => setHoveredItemId(null)}
                >
                  <div
                    className="recent-item"
                    onClick={() => handleLoadChat(chat.id)}
                  >
                    {chat.title}
                  </div>
                  {hoveredItemId === chat.id && (
                    <div className="item-menu-container">
                      <button
                        className="item-menu-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === chat.id ? null : chat.id);
                        }}
                      >
                        ⋯
                      </button>
                      {openMenuId === chat.id && (
                        <div className="item-menu-dropdown">
                          <button
                            className="menu-option"
                            onClick={(e) => handleDeleteChat(chat.id, e)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="sidebar-profile">
          <div className="profile-info">
            {user && (
              <>
                <div 
                  className="profile-avatar"
                  style={{ 
                    backgroundColor: getAvatarColor(user.firstName),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    fontSize: '16px',
                    color: 'white'
                  }}
                >
                  {getInitials(user.firstName, user.lastName)}
                </div>
                <div className="profile-details">
                  <p className="profile-name">{user.firstName} {user.lastName}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {/* Chat Header */}
        <div className="chat-header">
          <h1 className="chat-title">Unixora Assistant</h1>
          <div className="header-buttons">
            <button className="home-btn" onClick={() => navigate('/')}>Home</button>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="chat-messages">
          {messages.length === 1 && (
            <div className="welcome-section">
              <div className="welcome-greeting">
                <p className="greeting-main">{messages[0].text}</p>
                <p className="greeting-sub">{messages[0].subtext}</p>
              </div>
              
              <div className="quick-actions">
                <div className="quick-action-item">
                  <p className="quick-action-title">Find universities by location</p>
                  <span className="quick-action-time">Right now</span>
                </div>
                <div className="quick-action-item">
                  <p className="quick-action-title">Compare scholarship programs</p>
                  <span className="quick-action-time">2 min</span>
                </div>
                <div className="quick-action-item">
                  <p className="quick-action-title">Best universities for Engineering</p>
                  <span className="quick-action-time">5 min</span>
                </div>
                <div className="quick-action-item">
                  <p className="quick-action-title">Top-ranked universities worldwide</p>
                  <span className="quick-action-time">12 min</span>
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => {
            if (msg.id === 0 && messages.length === 1) return null;
            return (
              <div key={idx} className={`message ${msg.type}`}>
                <div className={`message-content ${msg.type}`}>
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat Input */}
        <div className="chat-input-section">
          <div className="input-box">
            <input
              type="text"
              placeholder="Ask a question or make a request..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="chat-input"
            />
            <button className="send-btn" onClick={handleSendMessage}>➤</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
