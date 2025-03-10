import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateGroup from "./pages/CreateGroup"; 
import UpdateGroupIcon from "./pages/UpdateGroupIcon";
import RemoveUser from "./pages/RemoveUser";  
import DeleteGroup from "./pages/DeleteGroup";  // ✅ Import missing page

// Protected route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('access_token');
  return isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* ✅ Add missing routes */}
        <Route
          path="/create-group"
          element={
            <ProtectedRoute>
              <CreateGroup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/update-group-icon"
          element={
            <ProtectedRoute>
              <UpdateGroupIcon />
            </ProtectedRoute>
          }
        />
        <Route
          path="/remove-user"
          element={
            <ProtectedRoute>
              <RemoveUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/delete-group"
          element={
            <ProtectedRoute>
              <DeleteGroup />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
