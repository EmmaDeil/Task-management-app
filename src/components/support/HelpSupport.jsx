import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";

const HelpSupport = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hello! 👋 Welcome to our support chat. How can I help you today?",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const quickReplies = [
    "How do I create a task?",
    "How to invite team members?",
    "What are project features?",
    "Account settings help",
    "Billing information",
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      sender: "user",
      text: inputMessage,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(inputMessage);
      const botMessage = {
        id: messages.length + 2,
        sender: "bot",
        text: botResponse,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickReply = (reply) => {
    setInputMessage(reply);
  };

  const getBotResponse = (message) => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("task") && lowerMessage.includes("create")) {
      return "To create a task:\n1. Go to the Task Board\n2. Click the '+ Add Task' button\n3. Fill in the task details\n4. Assign it to a team member\n5. Click 'Create Task'\n\nIs there anything else you'd like to know?";
    } else if (
      lowerMessage.includes("invite") ||
      lowerMessage.includes("member")
    ) {
      return "To invite team members:\n1. Go to Team section\n2. Click 'Invite New Member'\n3. Enter their email address\n4. Select their role\n5. Send the invitation\n\nThey'll receive an email with a link to join!";
    } else if (lowerMessage.includes("project")) {
      return "Our project features include:\n• Project creation and management\n• Task assignment within projects\n• Progress tracking\n• Team collaboration\n• Timeline visualization\n\nWould you like details about any specific feature?";
    } else if (
      lowerMessage.includes("setting") ||
      lowerMessage.includes("account")
    ) {
      return "You can access your account settings from:\n• Click your avatar in the top-right\n• Select 'Settings'\n• Or go to Profile > Settings\n\nThere you can update notifications, privacy, appearance, and more!";
    } else if (
      lowerMessage.includes("billing") ||
      lowerMessage.includes("payment")
    ) {
      return "For billing inquiries:\n• Go to Organization > Settings\n• View your current plan\n• Update payment methods\n• View invoices\n\nNeed help with a specific billing issue?";
    } else {
      return "Thank you for your message! I'm here to help with:\n• Task management\n• Team collaboration\n• Project features\n• Account settings\n• Billing questions\n\nCould you provide more details about what you need help with?";
    }
  };

  return (
    <div className="help-support-page">
      <div className="help-header">
        <div className="help-header-content">
          <h1>Help & Support</h1>
          <p>We're here to help you 24/7</p>
        </div>
      </div>

      <div className="help-container">
        {/* FAQ Section */}
        <div className="help-sidebar">
          <div className="faq-section">
            <h3>📚 Quick Help</h3>
            <div className="faq-list">
              <details className="faq-item">
                <summary>Getting Started</summary>
                <p>
                  Learn the basics of using our platform, from creating your
                  first task to inviting team members.
                </p>
              </details>
              <details className="faq-item">
                <summary>Task Management</summary>
                <p>
                  Everything you need to know about creating, assigning, and
                  tracking tasks efficiently.
                </p>
              </details>
              <details className="faq-item">
                <summary>Project Features</summary>
                <p>
                  Discover how to organize your work into projects and track
                  progress.
                </p>
              </details>
              <details className="faq-item">
                <summary>Team Collaboration</summary>
                <p>
                  Tips for working effectively with your team, sharing updates,
                  and communication.
                </p>
              </details>
              <details className="faq-item">
                <summary>Account & Billing</summary>
                <p>
                  Manage your account settings, subscription plans, and billing
                  information.
                </p>
              </details>
            </div>
          </div>

          <div className="contact-info">
            <h3>📞 Contact Us</h3>
            <div className="contact-item">
              <span className="contact-icon">📧</span>
              <div>
                <strong>Email</strong>
                <p>support@orgmanager.com</p>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">💬</span>
              <div>
                <strong>Live Chat</strong>
                <p>Available 24/7</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Box */}
        <div className="chat-container">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="agent-avatar">🤖</div>
              <div>
                <h4>Support Assistant</h4>
                <span className="status-indicator">
                  <span className="status-dot online"></span>
                  Online
                </span>
              </div>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${
                  message.sender === "user" ? "user-message" : "bot-message"
                }`}
              >
                {message.sender === "bot" && (
                  <div className="message-avatar">🤖</div>
                )}
                <div className="message-content">
                  <div className="message-bubble">
                    <p style={{ whiteSpace: "pre-line" }}>{message.text}</p>
                  </div>
                  <span className="message-time">{message.time}</span>
                </div>
                {message.sender === "user" && (
                  <div className="message-avatar user">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="message bot-message">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="message-bubble typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="quick-replies">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                className="quick-reply-btn"
                onClick={() => handleQuickReply(reply)}
              >
                {reply}
              </button>
            ))}
          </div>

          <form className="chat-input-container" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="chat-input"
            />
            <button
              type="submit"
              className="send-button"
              disabled={!inputMessage.trim()}
            >
              <span className="send-icon">📤</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;
