
import React from 'react';

const Message = ({ message }) => {
  const isUser = message.sender === 'user';
  return (
    <div className={isUser ? 'message user' : 'message ai'}>
      <p>{message.content}</p>
    </div>
  );
};

export default Message;
