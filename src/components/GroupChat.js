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

    const socketUrl = `ws://localhost:8000/ws/chat/group/${selectedGroup.id}/`;
    socketRef.current = new WebSocket(socketUrl);

    socketRef.current.onmessage = (event) => {
      const messageData = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, messageData]);
    };

    socketRef.current.onclose = () => console.log("WebSocket disconnected");

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
      group: selectedGroup.id,
      sender: currentUser.username,
      text: newMessage,
    };

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
