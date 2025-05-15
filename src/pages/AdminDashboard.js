import React from "react";
import Sidebar from "../components/Sidebar";
import AdminStats from "../components/AdminStats";
import AdminGraph from "../components/AdminGraph";

// Define the logic of authentication, if logged in, then access this page, else go to "/login"
const AdminDashboard = () => (
  <div className="flex">
    <Sidebar />
    <main className="flex-1 p-6 bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 min-h-screen">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">Admin Dashboard</h1>
      <AdminStats />
      <AdminGraph />
    </main>
  </div>
);

export default AdminDashboard;