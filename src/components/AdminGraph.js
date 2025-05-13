import React from "react";

const AdminGraph = () => {
  const data = [
    { name: "Doctors", value: 42, color: "bg-purple-500" },
    { name: "Patients", value: 126, color: "bg-pink-500" },
    { name: "Treatments", value: 58, color: "bg-orange-400" },
    { name: "Appointments", value: 78, color: "bg-violet-600" },
  ];

  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h2 className="text-lg font-bold text-gray-700 mb-4">System Stats</h2>
      <div className="flex items-end gap-4 h-64">
        {data.map((item) => (
          <div key={item.name} className="flex flex-col items-center w-20">
            <div
              className={`${item.color} w-full rounded-t-md transition-all duration-300`}
              style={{
                height: `${(item.value / maxValue) * 100}%`,
              }}
              title={`${item.value}`}
            ></div>
            <span className="mt-2 text-sm text-center">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminGraph;
