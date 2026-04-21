import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2 } from 'lucide-react';
import './AIBot.css';

const AIBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I am your Campus assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ message: input })
      });
      if (!response.ok) throw new Error('Failed to get response');
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "I'm sorry, I'm having trouble connecting to my AI core right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`ai-bot-wrapper ${isOpen ? 'open' : ''}`}>
      {!isOpen && (
        <button className="ai-bot-toggle heartbeat" onClick={() => setIsOpen(true)}>
          <Bot size={28} />
        </button>
      )}

      {isOpen && (
        <div className="ai-bot-window glass-panel">
          <div className="ai-bot-header">
            <div className="ai-bot-title">
              <Bot size={20} />
              <span>Campus Assistant</span>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}><X size={20} /></button>
          </div>

          <div className="ai-bot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message-bubble ${msg.role}`}>
                <div className="avatar">
                  {msg.role === 'bot' ? <Bot size={14} /> : <User size={14} />}
                </div>
                <div className="text">{msg.text}</div>
              </div>
            ))}
            {isLoading && (
              <div className="message-bubble bot">
                <div className="avatar"><Loader2 size={14} className="spin" /></div>
                <div className="text typing">Thinking...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="ai-bot-input" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}><Send size={18} /></button>
          </form>
        </div>
      )}
    </div>
  );
};
export default AIBot;
