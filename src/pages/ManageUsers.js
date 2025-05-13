import React from "react";
import Sidebar from "../components/Sidebar";
import UserManagement from "../components/UserManagement";

const ManageUsers = () => (
  <div className="flex">
    <Sidebar />
    <main className="flex-1 p-6 bg-gradient-to-br from-pink-50 via-orange-100 to-purple-100 min-h-screen">
      <h1 className="text-3xl font-bold text-orange-700 mb-6">Manage Users</h1>
      <UserManagement />
    </main>
  </div>
);

export default ManageUsers;