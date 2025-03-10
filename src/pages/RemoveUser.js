import React, { useState } from "react";
import axios from "axios";

const RemoveUser = () => {
  const [groupId, setGroupId] = useState("");
  const [userId, setUserId] = useState("");

  const handleRemoveUser = async () => {
    const token = localStorage.getItem("access_token");
    try {
      await axios.delete(
        `http://localhost:8000/api/groups/${groupId}/remove_user/`,
        {
          data: { user_id: userId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("User Removed!");
    } catch (error) {
      alert("Failed to remove user.");
    }
  };

  return (
    <div>
      <h2>Remove User from Group</h2>
      <input 
        type="text" 
        placeholder="Enter Group ID" 
        value={groupId} 
        onChange={(e) => setGroupId(e.target.value)} 
      />
      <input 
        type="text" 
        placeholder="Enter User ID" 
        value={userId} 
        onChange={(e) => setUserId(e.target.value)} 
      />
      <button onClick={handleRemoveUser}>Remove User</button>
    </div>
  );
};

export default RemoveUser;
