
import React, { createContext, useState } from 'react';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);

  const sendMessage = (content) => {
    const userMsg = { sender: 'user', content };
    const aiMsg = { sender: 'ai', content: 'AI response placeholder' };
    setMessages([...messages, userMsg, aiMsg]);
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
};
