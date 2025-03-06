import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./login.css";

const API_URL = "http://localhost:8000/api/login/"; // Change this if needed

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    if (!formData.email || !formData.password) {
      setErrorMessage("Email and Password are required.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(API_URL, {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.access) {
        localStorage.setItem("access_token", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);
        localStorage.setItem("username", response.data.username);
        navigate("/dashboard");
      } else {
        setErrorMessage("Invalid credentials. Please try again.");
      }
    } catch (error) {
      if (error.response && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="title">Login</span>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {errorMessage && <p className="error">{errorMessage}</p>}
        <p>Don't have an account?</p>
        <button onClick={() => navigate("/register")}>Register</button>
      </div>
    </div>
  );
};

export default Login;
