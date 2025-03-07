import React from "react";
import "../pages/dashboard.css";

const Chats = ({ users = [], loading, error, onSelectUser, currentUser }) => {
  if (loading) return <p className="loading">Loading users...</p>;
  if (error) return <p className="error">Error: {error}</p>;

  // Function to format timestamps like WhatsApp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    const messageDate = new Date(timestamp);
    if (isNaN(messageDate.getTime())) return "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate >= today) {
      return messageDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // Use `true` for AM/PM format
      });
    } else if (messageDate >= yesterday) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString("en-GB"); // "03/03/2025"
    }
  };

  return (
    <div className="chats">
      {users.length === 0 ? (
        <p className="no-users">No users available</p>
      ) : (
        users.map((user) => {
          const lastMessage = user.last_message?.text || "No messages yet";
          const isSentByUser = user.last_message?.sender?.id === currentUser?.id;

          // Get formatted timestamp
          const messageTime = formatTimestamp(user.last_message?.timestamp);

          return (
            <div
              key={user.id}
              className="userChat"
              onClick={() => onSelectUser(user)}
              role="button"
              aria-label={`Open chat with ${user.username}`}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onSelectUser(user)}
            >
              {/* Profile Picture */}
              <img
                src={user.profile_picture || "/images/default-avatar.png"}
                alt={`${user.username}'s profile`}
                className="user-avatar"
              />

              {/* Chat Content */}
              <div className="userChatContent">
                <span className="username">{user.username}</span>
                <p className={`lastMessage ${isSentByUser ? "sentMessage" : "receivedMessage"}`}>
                  {isSentByUser ? `You: ${lastMessage}` : lastMessage}
                </p>
              </div>

              {/* Show Last Message Time */}
              <span className="messageTime">{messageTime}</span>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Chats;
