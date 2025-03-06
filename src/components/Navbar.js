import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiService'; // Ensure you have an API service setup
import '../pages/dashboard.css'; // Corrected CSS import

const Navbar = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log("🔴 No access token found. Redirecting to login...");
        setLoading(false);
        navigate('/');
        return;
      }

      try {
        const response = await apiClient.get('/current_user/');
        console.log("✅ Fetched User:", response.data);
        setCurrentUser(response.data); // Store full user object
      } catch (error) {
        console.error('🔴 Error fetching current user:', error);
        if (error.response?.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.clear();
          navigate('/');
        } else {
          setError('Failed to load user data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear(); // Clears all stored data
    navigate('/'); // Redirects to login
  };

  return (
    <div className="navbar">
      <span className="logo">Chat</span>
      <div className="user">
        {loading ? (
          <span>Loading...</span>
        ) : error ? (
          <span className="error">{error}</span>
        ) : currentUser ? (
          <>
            {currentUser.profile_picture && (
              <img
                src={currentUser.profile_picture}
                alt="Profile"
                className="avatar"
              />
            )}
            <span>{currentUser.username}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <span>Guest</span>
        )}
      </div>
    </div>
  );
};

export default Navbar;