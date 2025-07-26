
import React, { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';

const HistoryPanel = () => {
  const { history, loadSession } = useContext(ChatContext);

  return (
    <div className="history-panel">
      <h4>Previous Conversations</h4>
      <ul>
        {history.map((session, index) => (
          <li key={index} onClick={() => loadSession(session.id)}>
            {session.title || `Session ${index + 1}`}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryPanel;
