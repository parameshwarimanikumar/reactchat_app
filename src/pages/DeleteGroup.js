import React, { useState } from "react";
import axios from "axios";

const DeleteGroup = () => {
  const [groupName, setGroupName] = useState("");

  const handleDeleteGroup = async () => {
    const token = localStorage.getItem("access_token");

    try {
      await axios.delete("http://localhost:8000/api/groups/delete/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: { name: groupName }, // ✅ Send group name in request body
      });

      alert("Group and all members deleted successfully!");
      setGroupName(""); // Clear input after successful deletion
    } catch (error) {
      console.error("Delete Group Error:", error.response);
      alert("Failed to delete group: " + (error.response?.data?.error || "Unknown error"));
    }
  };

  return (
    <div>
      <h2>Delete Group</h2>
      <input 
        type="text" 
        placeholder="Enter Group Name" 
        value={groupName} 
        onChange={(e) => setGroupName(e.target.value)} 
      />
      <button onClick={handleDeleteGroup}>Delete</button>
    </div>
  );
};

export default DeleteGroup;
