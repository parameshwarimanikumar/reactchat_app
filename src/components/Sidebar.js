import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import Navbar from "./Navbar";  // ✅ Navbar at the top
import Search from "./Search";
import Chats from "./Chats";
import "../pages/dashboard.css";

const Sidebar = ({ onSelectUser, onSelectGroup, currentUser }) => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasRedirected = useRef(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController(); // ✅ Local variable for aborting fetch

    const fetchUsersAndGroups = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          if (!hasRedirected.current) {
            hasRedirected.current = true;
            setError("Authentication required. Redirecting to login...");
            setTimeout(() => (window.location.href = "/login"), 2000);
          }
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // ✅ Fetch Users & Groups in Parallel with AbortController
        const [userResponse, groupResponse] = await Promise.all([
          axios.get("http://localhost:8000/api/users/", { headers, signal: controller.signal }),
          axios.get("http://localhost:8000/api/groups/", { headers, signal: controller.signal }),
        ]);

        if (!Array.isArray(userResponse.data) || !Array.isArray(groupResponse.data)) {
          throw new Error("Unexpected server response.");
        }

        setUsers(userResponse.data.filter((user) => user.id !== currentUser?.id));
        setGroups(groupResponse.data);
      } catch (err) {
        if (axios.isCancel(err)) return; // ✅ Prevent error if request was canceled
        console.error("🔴 Failed to fetch data:", err);
        setError(err.response?.status === 401 
          ? "Unauthorized. Please log in again." 
          : err.message || "Failed to load users and groups. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsersAndGroups();

    return () => controller.abort(); // ✅ Cleanup: Cancel request on unmount
  }, [currentUser]);

  // 🔹 Handle Search
  const handleSearch = useCallback((term) => {
    setSearchTerm(term.trim().toLowerCase());
  }, []);

  // 🔹 Filter Users and Groups
  const filteredUsers = useMemo(() => {
    return searchTerm
      ? users.filter((user) => user.username.toLowerCase().includes(searchTerm))
      : users;
  }, [users, searchTerm]);

  const filteredGroups = useMemo(() => {
    return searchTerm
      ? groups.filter((group) => group.name.toLowerCase().includes(searchTerm))
      : groups;
  }, [groups, searchTerm]);

  return (
    <div className="sidebar">
      {/* ✅ Navbar included inside Sidebar */}
      <Navbar /> 

      <Search onSearch={handleSearch} />

      <div className="sidebar-users" ref={sidebarRef}>
        {loading ? (
          <p className="loading-text">Loading users and groups...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : filteredUsers.length === 0 && filteredGroups.length === 0 ? (
          <p className="no-users">No users or groups found.</p>
        ) : (
          <Chats 
            users={filteredUsers} 
            groups={filteredGroups} 
            onSelectUser={onSelectUser} 
            onSelectGroup={onSelectGroup}
            currentUser={currentUser} 
          />
        )}
      </div>
    </div>
  );
};

export default Sidebar;
