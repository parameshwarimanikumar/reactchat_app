import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Chat from "../components/Chat";
import { useNavigate } from "react-router-dom";
import api from "../services/apiService";
import "./dashboard.css";

const Dashboard = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/");
      return;
    }

    const fetchCurrentUser = async () => {
      try {
        const response = await api.get("/current_user/");
        setCurrentUserId(response.data.id);
        
      } catch (error) {
        console.error("❌ Failed to fetch current user:", error.response?.data || error.message);
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  const handleSelectUser = (user) => {
    console.log("🟢 Selected User:", user);
    setSelectedUser(user);
  };

  const handleSelectGroup = (group) => {
    console.log("🟢 Selected Group:", group);
    setSelectedUser(group);
  };

  return (
    <div className="home">
      <div className="container">
        <Sidebar onSelectUser={handleSelectUser} onSelectGroup={handleSelectGroup} />

        <div className="chat-container">
          {selectedUser && currentUserId !== null ? (
            <Chat selectedUser={selectedUser} currentUserId={currentUserId} />
          ) : (
            <div className="select-user-message">
              {currentUserId === null ? "Loading user..." : "Please select a user or group to start chatting"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
