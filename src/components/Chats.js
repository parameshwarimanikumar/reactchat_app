import React from "react";
import "../pages/dashboard.css";

const Chats = ({ users = [], loading, error, onSelectUser, currentUser }) => {
  if (loading) return <p className="loading">Loading users...</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="chats">
      {users.length === 0 ? (
        <p className="no-users">No users available</p>
      ) : (
        users.map((user) => {
          console.log("User:", user.username, "Last Message:", user.last_message);

          const lastMessage = user.last_message?.text || "No messages yet";
          const isSentByUser = user.last_message?.sender?.id === currentUser?.id;
          const messageTime =
            user.last_message?.timestamp &&
            !isNaN(Date.parse(user.last_message.timestamp))
              ? new Intl.DateTimeFormat("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "UTC",
                }).format(new Date(user.last_message.timestamp))
              : "";

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
                  {messageTime && <span className="messageTime">{messageTime}</span>}
                </p>
              </div>

              {/* Timestamp */}
              
            </div>
          );
        })
      )}
    </div>
  );
};

export default Chats;
