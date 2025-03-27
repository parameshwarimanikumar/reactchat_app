import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/apiService";
import "../pages/AddUserToGroup.css";

const AddUserToGroup = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Fetch groups
    const fetchGroups = async () => {
      try {
        const response = await apiClient.get("/groups/");
        setGroups(response.data);
      } catch (error) {
        console.error("Failed to fetch groups", error);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    // ✅ Fetch all users
    const fetchAllUsers = async () => {
      try {
        const response = await apiClient.get("/users/");
        setAllUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };
    fetchAllUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!selectedGroup || !selectedUser) {
      setMessage("Please select a group and a user.");
      return;
    }

    // ✅ Find the selected group name from the list
    const groupObject = groups.find((group) => group.id === parseInt(selectedGroup));
    if (!groupObject) {
      setMessage("Invalid group selection.");
      return;
    }

    // ✅ Find the selected username from the list
    const userObject = allUsers.find((user) => user.id === parseInt(selectedUser));
    if (!userObject) {
      setMessage("Invalid user selection.");
      return;
    }

    console.log("Sending to API:", {
      group_name: groupObject.name, // ✅ Ensure we send the group name
      username: userObject.username, // ✅ Ensure we send the username
    });

    try {
      const response = await apiClient.post("/groups/add_user/", {
        group_name: groupObject.name, // ✅ Backend expects `group_name`
        username: userObject.username, // ✅ Backend expects `username`
      });

      if (response.status === 200) {
        setMessage("User added successfully!");
      } else {
        setMessage("Failed to add user.");
      }
    } catch (error) {
      console.error("Error Response:", error.response);
      setMessage(error.response?.data?.error || "Error adding user.");
    }
  };

  return (
    <div className="add-user-container">
      <h2>Add User to Group</h2>
      {message && <p className="message">{message}</p>}

      <form onSubmit={handleAddUser}>
        <label>Select Group:</label>
        <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
          <option value="">-- Select Group --</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>

        <label>Select User:</label>
        <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
          <option value="">-- Select a User --</option>
          {allUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>

        <button type="submit">Add User</button>
      </form>

      <button className="back-button" onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );
};

export default AddUserToGroup;
