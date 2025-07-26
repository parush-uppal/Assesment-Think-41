
import React from 'react';
import MessageList from './MessageList';
import UserInput from './UserInput';

const ChatWindow = () => {
  return (
    <div className="chat-window">
      <MessageList />
      <UserInput />
    </div>
  );
};

export default ChatWindow;
