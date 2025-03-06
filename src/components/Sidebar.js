import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Search from "./Search";
import Chats from "./Chats";
import "../pages/dashboard.css";

const Sidebar = ({ onSelectUser, currentUser }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sidebarRef = useRef(null); // Reference for scrolling

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("No token found. Please log in.");

        const response = await axios.get("http://localhost:8000/api/users/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!Array.isArray(response.data)) {
          throw new Error("Invalid data format from server.");
        }

        const filtered = currentUser
          ? response.data.filter((user) => user.username !== currentUser)
          : response.data;

        setUsers(filtered);
        setFilteredUsers(filtered);
      } catch (err) {
        console.error("🔴 Failed to fetch users:", err.response?.data || err.message);
        setError("Failed to load users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  // Debounced Search Handler (Prevents excessive re-renders)
  const handleSearch = useCallback(
    (searchTerm) => {
      const trimmedTerm = searchTerm.trim().toLowerCase();
      setFilteredUsers(
        trimmedTerm
          ? users.filter((user) => user.username.toLowerCase().includes(trimmedTerm))
          : users
      );
    },
    [users]
  );

  return (
    <div className="sidebar">
      <Navbar />
      <Search onSearch={handleSearch} />

      <div className="sidebar-users" ref={sidebarRef}>
        {loading ? (
          <p className="loading-text">Loading users...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : filteredUsers.length === 0 ? (
          <p className="no-users">No users found.</p>
        ) : (
          <Chats users={filteredUsers} onSelectUser={onSelectUser} />
        )}
      </div>
    </div>
  );
};

export default Sidebar;
