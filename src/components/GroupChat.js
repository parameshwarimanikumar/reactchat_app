import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const GroupChat = ({ currentUser }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  // ✅ Fetch groups
  useEffect(() => {
    axios.get("http://localhost:8000/api/groups/")
      .then(response => {
        setGroups(response.data);
        setError(null);
      })
      .catch(error => {
        console.error("Error fetching groups:", error);
        setError("Failed to load groups. Please try again.");
      });
  }, []);

  // ✅ Fetch past messages when switching groups
  useEffect(() => {
    if (!selectedGroup) return;
    
    axios.get(`http://localhost:8000/api/groups/${selectedGroup.id}/messages/`)
      .then(response => setMessages(response.data))
      .catch(error => console.error("Error fetching messages:", error));

    // Close previous WebSocket before opening a new one
    if (socketRef.current) {
      socketRef.current.close();
    }

    const socketUrl = `ws://localhost:8000/ws/group_chat/${selectedGroup.id}/`;  // ✅ FIXED URL
    socketRef.current = new WebSocket(socketUrl);

    socketRef.current.onopen = () => console.log("✅ Group WebSocket Connected");
    socketRef.current.onmessage = (event) => {
      console.log("📩 Received Group WebSocket Message:", event.data);
      const messageData = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, messageData]);
    };

    socketRef.current.onerror = (error) => console.error("❌ Group WebSocket Error:", error);
    socketRef.current.onclose = () => console.log("⚠️ Group WebSocket Disconnected");

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [selectedGroup]);

  // ✅ Send a new message via WebSocket
  const handleSendMessage = () => {
    if (!newMessage.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

    const messageData = {
      group_id: selectedGroup.id,  // ✅ FIXED KEY
      sender_id: currentUser.username,
      message: newMessage,
    };

    console.log("🚀 Sending Group WebSocket Message:", messageData);
    socketRef.current.send(JSON.stringify(messageData));
    setNewMessage("");
  };

  return (
    <div className="group-chat">
      <div className="group-list">
        <h3>Groups</h3>
        {error && <p className="error-message">{error}</p>}
        {groups.map((group) => (
          <div 
            key={group.id} 
            onClick={() => setSelectedGroup(group)} 
            className={`group ${selectedGroup?.id === group.id ? "active" : ""}`}
          >
            {group.name}
          </div>
        ))}
      </div>

      {selectedGroup && (
        <div className="chat-section">
          <h3>{selectedGroup.name}</h3>
          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className={msg.sender_id === currentUser.username ? "message sent" : "message received"}>
                <strong>{msg.sender_id}</strong>: {msg.message}
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
