import React, { useState } from "react";
import axios from "axios";

const UpdateGroupIcon = () => {
  const [groupName, setGroupName] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchGroupId = async (name) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("You must be logged in to update the group icon.");
        return null;
      }

      const response = await axios.get(
        `http://localhost:8000/api/groups/?name=${name}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("API Response:", response.data); // Debugging

      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data[0].id; // Assuming the API returns an array
      } else if (response.data.id) {
        return response.data.id; // If API returns a single object
      } else {
        alert("Group not found.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching group ID:", error.response?.data || error.message);
      alert("Failed to retrieve group ID.");
      return null;
    }
  };

  const handleUpload = async () => {
    if (!groupName.trim()) {
      alert("Please enter a valid Group Name.");
      return;
    }

    if (!image) {
      alert("Please select an image file.");
      return;
    }

    setLoading(true);

    const groupId = await fetchGroupId(groupName);
    if (!groupId) {
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("icon", image);

    const token = localStorage.getItem("access_token");

    try {
      const response = await axios.post(
        `http://localhost:8000/api/groups/${groupId}/update_icon/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Group Icon Updated Successfully!");
      console.log("Success:", response.data);
    } catch (error) {
      console.error("Upload failed:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Failed to update icon.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Update Group Icon</h2>
      <input
        type="text"
        placeholder="Enter Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default UpdateGroupIcon;
