import React from "react";

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toDateString();
};

const Message = ({ message, currentUserId, isGroupChat, previousMessage }) => {
  const isSentByCurrentUser = message.sender_id === currentUserId;

  // ✅ Show date separator only if it's a new day
  const shouldShowDate =
    !previousMessage || formatDate(previousMessage.timestamp) !== formatDate(message.timestamp);

  return (
    <div className="message-wrapper">
      {shouldShowDate && <div className="date-separator">{formatDate(message.timestamp)}</div>}

      <div className={`message ${isSentByCurrentUser ? "sent" : "received"}`}>
        {/* ✅ Display sender name in group chats */}
        {isGroupChat && !isSentByCurrentUser && (
          <div className="sender-name">{message.sender?.username || "Unknown"}</div>
        )}
        <p className="message-content">{message.text}</p>
        <span className="timestamp">{new Date(message.timestamp).toLocaleTimeString()}</span>
      </div>
    </div>
  );
};

export default Message;
