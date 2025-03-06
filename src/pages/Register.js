import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Handle profile picture selection
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreview(URL.createObjectURL(file)); // Preview image
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous errors

    if (!email || !password) {
      setErrorMessage("Email and password are required.");
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    if (profilePicture) {
      formData.append("profile_picture", profilePicture);
    }

    try {
      const response = await fetch("http://localhost:8000/api/create_user/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => ({})); // Handle empty response

      if (response.status === 201) {
        console.log("User registered successfully:", data);
        navigate("/"); // Redirect after successful registration
      } else {
        setErrorMessage(data.error || "Registration failed.");
      }
    } catch (error) {
      setErrorMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="title">Register</span>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username (Optional)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleProfilePictureChange}
          />
          {/* Show image preview */}
          {preview && <img src={preview} alt="Preview" className="profile-preview" />}
          <button type="submit">Sign up</button>
        </form>
        {errorMessage && <p className="error">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default Register;
