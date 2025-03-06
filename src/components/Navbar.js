import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiService';
import '../pages/dashboard.css';

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
        setCurrentUser(response.data);
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
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="navbar">
      {/* Left Side: User Info */}
      <div className="user-info">
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
          </>
        ) : (
          <span>Guest</span>
        )}
      </div>

      {/* Right Side: Logout Button */}
      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Navbar;
