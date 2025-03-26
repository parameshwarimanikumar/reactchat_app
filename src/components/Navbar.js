import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMoreVertical } from 'react-icons/fi';
import apiClient from '../services/apiService';
import '../pages/dashboard.css';

const Navbar = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        navigate('/');
        return;
      }

      try {
        const response = await apiClient.get('/current_user/');
        setCurrentUser(response.data);
      } catch (error) {
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="navbar">
      <div className="user-info">
        {loading ? (
          <span>Loading...</span>
        ) : error ? (
          <span className="error">{error}</span>
        ) : currentUser ? (
          <>
            {currentUser.profile_picture && (
              <img src={currentUser.profile_picture} alt="Profile" className="avatar" />
            )}
            <span>{currentUser.username}</span>
          </>
        ) : (
          <span>Guest</span>
        )}
      </div>

      <div className="menu-container" ref={menuRef}>
        <FiMoreVertical className="menu-icon" onClick={() => setMenuOpen(!menuOpen)} />
        {menuOpen && (
          <div className="dropdown-menu">
            <button onClick={() => navigate('/')}>Login</button>
            <button onClick={() => navigate('/create-group')}>Create Group</button>
            <button onClick={() => navigate('/update-group-icon')}>Update Group Icon</button>
            <button onClick={() => navigate('/remove-user')}>Remove User from Group</button>
            <button onClick={() => navigate('/delete-group')}>Remove Group</button>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
