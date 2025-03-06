import React from "react";
import "../pages/dashboard.css";

const Chats = ({ users = [], loading, error, onSelectUser, currentUser }) => {
  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="chats">
      {users.length === 0 ? (
        <p className="no-users">No users available</p>
      ) : (
        users.map((user) => {
          console.log("User:", user.username, "Last Message:", user.last_message);

          const lastMessage = user.last_message?.text || "No messages yet";
          const isSentByUser = user.last_message?.sender === currentUser?.id;
          const messageTime =
            user.last_message?.timestamp && !isNaN(new Date(user.last_message.timestamp))
              ? new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" })
                  .format(new Date(user.last_message.timestamp))
              : "";

          return (
            <div key={user.id || Math.random()} className="userChat" onClick={() => onSelectUser(user)}>
              <div className="userChatHeader">
                <div className="userInfo">
                  <img
                    src={user.profile_picture || "/default-avatar.png"}
                    alt={user.username}
                    className="user-avatar"
                  />
                  <span className="username">{user.username}</span>
                </div>

                {messageTime && <span className="messageTime">{messageTime}</span>}
              </div>

              <p className={`lastMessage ${isSentByUser ? "sentMessage" : "receivedMessage"}`}>
                {isSentByUser ? `You: ${lastMessage}` : lastMessage}
              </p>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Chats;
