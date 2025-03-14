import React from "react";
import "../pages/dashboard.css";

const Chats = ({ 
  users = [], 
  groups = [], 
  onSelectUser = () => {}, 
  onSelectGroup = () => {}, 
  currentUser 
}) => {

  // ✅ Format timestamps for better readability
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return " ";

    const messageDate = new Date(timestamp);
    if (isNaN(messageDate.getTime())) return " ";

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
      {/* ✅ Display Groups First */}
      {groups.length > 0 && (
        <div className="group-chats">
          {groups.map((group) => {
            const lastMessage = group.last_message || {};
            const senderName = lastMessage.sender?.username || "Unknown";

            return (
              <div
                key={group.id}
                className="groupChat"
                onClick={() => {
                  console.log("Group Clicked:", group);
                  onSelectGroup(group);
                }}
                role="button"
                aria-label={`Open chat with group ${group.name}`}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onSelectGroup(group)}
              >
                {/* ✅ Group Avatar */}
                <img
                  src={group.avatar || "/assets/default-group.png"}
                  alt={`${group.name} group`}
                  className="group-avatar"
                />

                {/* ✅ Chat Content */}
                <div className="chatContent">
                  <span className="chatName">{group.name}</span>
                  <p className="lastMessage">
                    {lastMessage.text 
                      ? `${senderName}: ${lastMessage.text.slice(0, 30)}...`
                      : "No messages yet"}
                  </p>
                </div>

                {/* ✅ Show Last Message Time */}
                <span className="messageTime">{formatTimestamp(lastMessage.timestamp)}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ Display Individual Users */}
      {users.length > 0 && (
        <div className="user-chats">
          <h4 className="section-title">Users</h4>
          {users.map((user) => {
            const lastMessage = user.last_message || {};
            const isSentByUser = currentUser && lastMessage.sender?.id === currentUser.id;
            
            return (
              <div
                key={user.id}
                className="userChat"
                onClick={() => {
                  console.log("User Clicked:", user);
                  onSelectUser(user);
                }}
                role="button"
                aria-label={`Open chat with ${user.username}`}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onSelectUser(user)}
              >
                {/* ✅ Profile Picture */}
                <img
                  src={user.profile_picture || "/assets/default-avatar.png"}
                  alt={`${user.username}'s profile`}
                  className="user-avatar"
                />

                {/* ✅ Chat Content */}
                <div className="chatContent">
                  <span className="chatName">{user.username}</span>
                  <p className={`lastMessage ${isSentByUser ? "sentMessage" : "receivedMessage"}`}>
                    {lastMessage.text 
                      ? isSentByUser 
                        ? `You: ${lastMessage.text.slice(0, 30)}...`
                        : lastMessage.text.slice(0, 30)
                      : "No messages yet"}
                  </p>
                </div>

                {/* ✅ Show Last Message Time */}
                <span className="messageTime">{formatTimestamp(lastMessage.timestamp)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Chats;
