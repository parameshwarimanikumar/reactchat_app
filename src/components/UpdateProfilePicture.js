import React, { useState } from "react";
import axios from "axios";
import imageCompression from "browser-image-compression";

const UpdateProfilePicture = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [message, setMessage] = useState("");
    const [uploading, setUploading] = useState(false);

    const handleProfilePictureChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Image compression settings
        const options = {
            maxSizeMB: 0.5, // Compress to ~0.5MB
            maxWidthOrHeight: 800, // Resize max dimension to 800px
            useWebWorker: true,
        };

        try {
            const compressedFile = await imageCompression(file, options);
            setSelectedFile(compressedFile);

            // Generate a preview of the image
            const reader = new FileReader();
            reader.readAsDataURL(compressedFile);
            reader.onloadend = () => setPreview(reader.result);
        } catch (error) {
            console.error("Error compressing image:", error);
            setMessage("Failed to compress image.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) return setMessage("Please select an image.");

        const formData = new FormData();
        formData.append("profile_picture", selectedFile);

        setUploading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.patch("http://localhost:8000/api/profile-picture/", formData, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 200) {
                setMessage("Profile picture updated successfully!");
            }
        } catch (error) {
            setMessage("Error updating profile picture.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="file" accept="image/*" onChange={handleProfilePictureChange} required />
                {preview && <img src={preview} alt="Preview" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "50%" }} />}
                <button type="submit" disabled={uploading}>{uploading ? "Uploading..." : "Update Picture"}</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default UpdateProfilePicture;
