import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Search from "./Search";
import Chats from "./Chats";
import "../pages/dashboard.css";

const Sidebar = ({ onSelectUser, currentUser }) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Store search term
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sidebarRef = useRef(null); // Reference for scrolling

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setError("Authentication required. Redirecting to login...");
          setTimeout(() => (window.location.href = "/login"), 2000);
          return;
        }

        const response = await axios.get("http://localhost:8000/api/users/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!Array.isArray(response.data)) {
          throw new Error("Unexpected server response.");
        }

        setUsers(response.data.filter((user) => user.username !== currentUser));
      } catch (err) {
        console.error("🔴 Failed to fetch users:", err);
        setError(err.response?.status === 401 
          ? "Unauthorized. Please log in again." 
          : "Failed to load users. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term.trim().toLowerCase());
  }, []);

  const filteredUsers = useMemo(() => {
    return searchTerm
      ? users.filter((user) => user.username.toLowerCase().includes(searchTerm))
      : users;
  }, [users, searchTerm]);

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
