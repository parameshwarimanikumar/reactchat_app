import { useRef, useEffect } from "react";

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toDateString();
};

const Message = ({ message, currentUserId, isGroupChat, previousMessage }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const isSentByCurrentUser = message.sender_id === currentUserId;
  
  // ✅ Show date separator only if it's a new day
  const shouldShowDate =
    !previousMessage || formatDate(previousMessage.timestamp) !== formatDate(message.timestamp);

  return (
    <div className="message-wrapper" ref={messagesEndRef}>
      {shouldShowDate && <div className="date-separator">{formatDate(message.timestamp)}</div>}

      <div className={`message ${isSentByCurrentUser ? "sent" : "received"}`}>
        {isGroupChat && !isSentByCurrentUser && (
          <div className="sender-name">{message.sender?.username}</div>
        )}
        {message.text}
      </div>
    </div>
  );
};

export default Message;
