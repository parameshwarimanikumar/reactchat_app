import React, { useState } from "react";
import axios from "axios";
import "./DeleteGroup.css"; // Import CSS file

const DeleteGroup = () => {
  const [groupName, setGroupName] = useState("");

  const handleDeleteGroup = async () => {
    if (!groupName.trim()) {
      alert("Please enter a group name.");
      return;
    }

    const token = localStorage.getItem("access_token");

    try {
      await axios.delete(`http://localhost:8000/api/groups/${groupName}/delete/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(`Group '${groupName}' deleted successfully!`);
      setGroupName(""); // Clear input after success
    } catch (error) {
      console.error("Delete Group Error:", error.response);
      alert("Failed to delete group: " + (error.response?.data?.error || "Unknown error"));
    }
  };

  return (
    <div className="delete-group-container">
      <h2>Delete Group</h2>
      <input 
        type="text" 
        placeholder="Enter Group Name" 
        value={groupName} 
        onChange={(e) => setGroupName(e.target.value)} 
        className="input-field"
      />
      <button className="delete-button" onClick={handleDeleteGroup}>
        Delete Group
      </button>
    </div>
  );
};

export default DeleteGroup;
