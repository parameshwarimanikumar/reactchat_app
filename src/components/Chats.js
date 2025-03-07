import React from "react";
import "../pages/dashboard.css";

const Chats = ({ 
  users = [], 
  groups = [], 
  onSelectUser = () => {}, 
  onSelectGroup = () => {}, 
  currentUser 
}) => {

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    const messageDate = new Date(timestamp);
    if (isNaN(messageDate.getTime())) return "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const messageDay = new Date(messageDate);
    messageDay.setHours(0, 0, 0, 0);

    if (messageDay.getTime() === today.getTime()) {
      return messageDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } else if (messageDay.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString("en-GB");
    }
  };

  return (
    <div className="chats">
      {/* Display Groups First */}
      {groups.length > 0 && (
        <div className="group-chats">
          <h4 className="section-title">Groups</h4>
          {groups.map((group) => (
            <div
              key={group.id}
              className="groupChat"
              onClick={() => {
                console.log("Clicked Group:", group);
                onSelectGroup(group);
              }}
              role="button"
              aria-label={`Open chat with group ${group.name}`}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onSelectGroup(group)}
            >
              {/* Group Avatar */}
              <img
                src={group.avatar || "/images/default-group.png"}
                alt={`${group.name} group`}
                className="group-avatar"
              />

              {/* Chat Content */}
              <div className="chatContent">
                <span className="chatName">{group.name}</span>
                <p className="lastMessage">
                  {group.last_message ? `${group.last_message.sender.username}: ${group.last_message.text}` : "No messages yet"}
                </p>
              </div>

              {/* Show Last Message Time */}
              <span className="messageTime">{formatTimestamp(group.last_message?.timestamp)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Display Individual Users */}
      {users.length > 0 && (
        <div className="user-chats">
          <h4 className="section-title">Users</h4>
          {users.map((user) => {
            const lastMessage = user.last_message?.text || "No messages yet";
            const isSentByUser = user.last_message?.sender?.id === currentUser?.id;

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
                <div className="chatContent">
                  <span className="chatName">{user.username}</span>
                  <p className={`lastMessage ${isSentByUser ? "sentMessage" : "receivedMessage"}`}>
                    {isSentByUser ? `You: ${lastMessage}` : lastMessage}
                  </p>
                </div>

                {/* Show Last Message Time */}
                <span className="messageTime">{formatTimestamp(user.last_message?.timestamp)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Chats;
