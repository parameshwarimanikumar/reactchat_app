import React, { useState } from "react";
import axios from "axios";
import "./RemoveUser.css"; // Import CSS file

const RemoveUser = () => {
  const [groupName, setGroupName] = useState("");
  const [username, setUsername] = useState("");

  const handleRemoveUser = async () => {
    const token = localStorage.getItem("access_token");

    try {
      await axios.post(
        "http://localhost:8000/api/groups/remove_user/",
        { group_name: groupName, username },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`User '${username}' removed from group '${groupName}'!`);
      setGroupName("");
      setUsername("");
    } catch (error) {
      console.error("Error removing user:", error);
      alert(error.response?.data?.error || "Failed to remove user.");
    }
  };

  return (
    <div className="remove-user-container">
      <h2>Remove User from Group</h2>
      <input 
        type="text" 
        placeholder="Enter Group Name" 
        value={groupName} 
        onChange={(e) => setGroupName(e.target.value)} 
        className="input-field"
      />
      <input 
        type="text" 
        placeholder="Enter Username" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
        className="input-field"
      />
      <button className="remove-user-button" onClick={handleRemoveUser}>
        Remove User
      </button>
    </div>
  );
};

export default RemoveUser;
