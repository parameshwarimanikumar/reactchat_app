import React, { useState } from "react";
import axios from "axios";

const UpdateGroupIcon = () => {
  const [groupName, setGroupName] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

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

    const formData = new FormData();
    formData.append("icon", image);

    const token = localStorage.getItem("access_token");

    try {
      const response = await axios.post(
        `http://localhost:8000/api/groups/${groupName}/update_icon/`,
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
