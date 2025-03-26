import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("No authentication token found.");

        const response = await axios.get("http://localhost:8000/api/current_user/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCurrentUser(response.data);
        localStorage.setItem("userId", response.data.id); // ✅ Store user ID for quick access
      } catch (error) {
        setError(error.response?.data?.detail || error.message);
        logout(); // ✅ Auto-logout if token is invalid
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("userId");
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, error, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
