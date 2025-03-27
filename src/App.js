import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateGroup from "./pages/CreateGroup";
import UpdateGroupIcon from "./pages/UpdateGroupIcon";
import RemoveUser from "./pages/RemoveUser";
import DeleteGroup from "./pages/DeleteGroup";
import AddUserToGroup from "./pages/AddUserToGroup";  // ✅ Import new component

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
        <Route
          path="/add-user-to-group"  // ✅ Add missing route
          element={
            <ProtectedRoute>
              <AddUserToGroup />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
