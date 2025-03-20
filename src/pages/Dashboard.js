import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Chat from "../components/Chat";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

const Dashboard = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/"); // Redirect to login if no token is found
    }
  }, [navigate]);

  // Handle User Selection
  const handleSelectUser = (user) => {
    console.log("🟢 Selected User:", user);
    setSelectedUser(user);
  };

  // Handle Group Selection
  const handleSelectGroup = (group) => {
    console.log("🟢 Selected Group:", group);
    setSelectedUser(group); // Treat group as a user for Chat.js
  };

  return (
    <div className="home">
      <div className="container">
        {/* ✅ Sidebar supports both user & group selection */}
        <Sidebar onSelectUser={handleSelectUser} onSelectGroup={handleSelectGroup} />

        {/* ✅ Always Pass `selectedUser`, Even for Groups */}
        <div className="chat-container">
          {selectedUser ? (
            <Chat selectedUser={selectedUser} />
          ) : (
            <div className="select-user-message">Please select a user or group to start chatting</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
