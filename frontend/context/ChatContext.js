
import React, { createContext, useState } from 'react';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([
    { id: 1, title: 'Session 1', messages: [] },
    { id: 2, title: 'Session 2', messages: [] }
  ]);

  const sendMessage = (content) => {
    const userMsg = { sender: 'user', content };
    const aiMsg = { sender: 'ai', content: 'AI response placeholder' };
    setMessages([...messages, userMsg, aiMsg]);
  };

  const loadSession = (id) => {
    const session = history.find((s) => s.id === id);
    if (session) setMessages(session.messages);
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage, history, loadSession }}>
      {children}
    </ChatContext.Provider>
  );
};
