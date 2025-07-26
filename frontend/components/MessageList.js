
import React, { useContext } from 'react';
import Message from './Message';
import { ChatContext } from '../context/ChatContext';

const MessageList = () => {
  const { messages } = useContext(ChatContext);

  return (
    <div className="message-list">
      {messages.map((msg, index) => (
        <Message key={index} message={msg} />
      ))}
    </div>
  );
};

export default MessageList;
