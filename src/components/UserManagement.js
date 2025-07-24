// Not being used

import React, { useState } from "react";

const UserManagement = () => {
  const [users, setUsers] = useState([
    { name: "Ali Khan", role: "Patient", email: "ali@gmail.com", blocked: false },
    { name: "Dr. Sana", role: "Doctor", email: "sana@doc.com", blocked: false },
  ]);

  const toggleBlock = (index) => {
    const updatedUsers = [...users];
    updatedUsers[index].blocked = !updatedUsers[index].blocked;
    setUsers(updatedUsers);
    alert(`${updatedUsers[index].email} has been ${updatedUsers[index].blocked ? "blocked" : "unblocked"} (email sent)`);
  };

  return (
    <table className="w-full bg-white shadow-md rounded-xl">
      <thead>
        <tr className="bg-purple-100 text-left">
          <th className="p-4">Name</th>
          <th className="p-4">Role</th>
          <th className="p-4">Email</th>
          <th className="p-4">Status</th>
          <th className="p-4">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user, index) => (
          <tr key={index} className="border-b hover:bg-purple-50">
            <td className="p-4">{user.name}</td>
            <td className="p-4">{user.role}</td>
            <td className="p-4">{user.email}</td>
            <td className="p-4">{user.blocked ? "Blocked" : "Active"}</td>
            <td className="p-4">
              <button
                onClick={() => toggleBlock(index)}
                className={`px-4 py-1 rounded text-white ${user.blocked ? "bg-green-500" : "bg-red-500"}`}
              >
                {user.blocked ? "Unblock" : "Block"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UserManagement;
