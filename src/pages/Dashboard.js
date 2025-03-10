import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Chat from '../components/Chat';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';

const Dashboard = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/'); // Redirect to login if no token is found
    }
  }, [navigate]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  return (
    <div className='home'>
      <div className='container'>
        {/* ✅ Sidebar contains Navbar inside it now */}
        <Sidebar onSelectUser={handleSelectUser} />

        {/* Check if a user is selected before rendering the Chat component */}
        <div className='chat-container'>
          {selectedUser ? (
            <Chat selectedUser={selectedUser} />
          ) : (
            <div className='select-user-message'>Please select a user to start chatting</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
