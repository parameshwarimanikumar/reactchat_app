import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CreateGroup.css";

const CreateGroup = () => {
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Fetch Users for Group Creation
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const response = await axios.get("http://localhost:8000/api/users/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Handle Checkbox Selection
  const handleMemberSelect = (userId) => {
    setSelectedMembers((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  // Create Group Function
  const handleCreateGroup = async () => {
    const token = localStorage.getItem("access_token");

    if (!groupName.trim()) {
      alert("Group name cannot be empty!");
      return;
    }
    if (selectedMembers.length === 0) {
      alert("Please select at least one member!");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/groups/create/",
        {
          name: groupName,
          members: selectedMembers,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Group Created Successfully!");
      console.log("Group Created:", response.data);
      setGroupName("");
      setSelectedMembers([]);
    } catch (error) {
      console.error("Error creating group:", error.response?.data || error);
      alert("Failed to create group. Check console for details.");
    }
  };

  return (
    <div className="create-group-container">
      <h2>Create Group</h2>
      <input
        type="text"
        placeholder="Enter group name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        className="group-name-input"
      />
      
      <h3>Select Members:</h3>
      <div className="member-list">
        {members.length === 0 ? (
          <p>Loading users...</p>
        ) : (
          members.map((user) => (
            <label key={user.id} className="member-item">
              <input
                type="checkbox"
                checked={selectedMembers.includes(user.id)}
                onChange={() => handleMemberSelect(user.id)}
              />
              <span>{user.username}</span>
            </label>
          ))
        )}
      </div>

      <button className="create-group-button" onClick={handleCreateGroup}>
        Create Group
      </button>
    </div>
  );
};

export default CreateGroup;
