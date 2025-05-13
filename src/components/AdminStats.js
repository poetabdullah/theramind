import React from "react";

const AdminStats = () => (
  <div className="grid grid-cols-3 gap-4 mb-6">
    {[
      { title: "Doctors", value: 42 },
      { title: "Patients", value: 126 },
      { title: "Appointments", value: 78 },
    ].map((item) => (
      <div
        key={item.title}
        className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-purple-400"
      >
        <h3 className="text-lg text-gray-700 font-semibold">{item.title}</h3>
        <p className="text-3xl text-purple-700 font-bold">{item.value}</p>
      </div>
    ))}
  </div>
);

export default AdminStats;
