import React, { useState, useEffect } from "react";
import axios from "axios";

const GroupChat = ({ currentUser }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    axios.get("/api/groups/")
      .then(response => setGroups(response.data))
      .catch(error => console.error("Error fetching groups:", error));
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      const ws = new WebSocket(`ws://localhost:8000/ws/chat/group/${selectedGroup.id}/`);
      setSocket(ws);

      ws.onmessage = (event) => {
        const messageData = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, messageData]);
      };

      return () => ws.close();
    }
  }, [selectedGroup]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      group: selectedGroup.id,
      sender: currentUser.username,
      text: newMessage,
    };

    socket.send(JSON.stringify(messageData));
    setNewMessage("");
  };

  return (
    <div className="group-chat">
      <div className="group-list">
        <h3>Groups</h3>
        {groups.map((group) => (
          <div key={group.id} onClick={() => setSelectedGroup(group)} className="group">
            {group.name}
          </div>
        ))}
      </div>

      {selectedGroup && (
        <div className="chat-section">
          <h3>{selectedGroup.name}</h3>
          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className={msg.sender === currentUser.username ? "message sent" : "message received"}>
                <strong>{msg.sender}</strong>: {msg.text}
              </div>
            ))}
          </div>
          <div className="input-area">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupChat;
