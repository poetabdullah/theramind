import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => (
  <div className="w-64 h-screen bg-white shadow-lg p-4">
    <h2 className="text-xl font-bold text-purple-600 mb-4">Admin Panel</h2>
    <ul className="space-y-4">
      <li>
        <Link to="/admin/dashboard" className="text-purple-700 hover:underline">
          Dashboard
        </Link>
      </li>
      <li>
        <Link to="/admin/users" className="text-purple-700 hover:underline">
          Manage Users
        </Link>
      </li>
    </ul>
  </div>
);

export default Sidebar;