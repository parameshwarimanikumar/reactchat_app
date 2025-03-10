import React, { useState, useEffect } from "react";
import axios from "axios";

const CreateGroup = () => {
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState([]); // List of available users
  const [selectedMembers, setSelectedMembers] = useState([]); // Selected members

  // Fetch Users for Group Creation
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const response = await axios.get("http://localhost:8000/api/users/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembers(response.data); // Assume API returns a list of users
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
        ? prevSelected.filter((id) => id !== userId) // Remove if already selected
        : [...prevSelected, userId] // Add if not selected
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
          members: selectedMembers, // Sending correct field
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
    <div>
      <h2>Create Group</h2>
      <input
        type="text"
        placeholder="Enter group name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      
      <h3>Select Members:</h3>
      {members.length === 0 ? (
        <p>Loading users...</p>
      ) : (
        members.map((user) => (
          <div key={user.id}>
            <input
              type="checkbox"
              checked={selectedMembers.includes(user.id)}
              onChange={() => handleMemberSelect(user.id)}
            />
            {user.username}
          </div>
        ))
      )}

      <button onClick={handleCreateGroup}>Create</button>
    </div>
  );
};

export default CreateGroup;
