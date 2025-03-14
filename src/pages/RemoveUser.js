import React, { useState } from "react";
import axios from "axios";

const RemoveUser = () => {
  const [groupName, setGroupName] = useState("");
  const [username, setUsername] = useState("");

  const handleRemoveUser = async () => {
    const token = localStorage.getItem("access_token");

    try {
      await axios.post(
        "http://localhost:8000/api/groups/remove_user/", // ✅ No group ID in URL
        { group_name: groupName, username }, // ✅ Use group name
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`User '${username}' removed from group '${groupName}'!`);
      setGroupName(""); // Clear input
      setUsername("");
    } catch (error) {
      console.error("Error removing user:", error);
      alert(error.response?.data?.error || "Failed to remove user.");
    }
  };

  return (
    <div>
      <h2>Remove User from Group</h2>
      <input 
        type="text" 
        placeholder="Enter Group Name" 
        value={groupName} 
        onChange={(e) => setGroupName(e.target.value)} 
      />
      <input 
        type="text" 
        placeholder="Enter Username" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
      />
      <button onClick={handleRemoveUser}>Remove User</button>
    </div>
  );
};

export default RemoveUser;
