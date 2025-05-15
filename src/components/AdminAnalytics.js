import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar, ChevronDown, Users, Activity } from "lucide-react";

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    patientCount: 457,
    appointmentsToday: 23,
    activePatients: 348,
    recentActivity: 78
  });
  
  const [chartData, setChartData] = useState([]);
  const [timeframe, setTimeframe] = useState("Week");
  
  useEffect(() => {
    // Simulate fetching data based on timeframe
    const generateData = () => {
      if (timeframe === "Week") {
        return [
          { name: "Mon", patients: 45, appointments: 32 },
          { name: "Tue", patients: 52, appointments: 38 },
          { name: "Wed", patients: 49, appointments: 30 },
          { name: "Thu", patients: 63, appointments: 46 },
          { name: "Fri", patients: 58, appointments: 41 },
          { name: "Sat", patients: 37, appointments: 25 },
          { name: "Sun", patients: 25, appointments: 18 }
        ];
      } else if (timeframe === "Month") {
        return [
          { name: "Week 1", patients: 245, appointments: 187 },
          { name: "Week 2", patients: 263, appointments: 210 },
          { name: "Week 3", patients: 271, appointments: 223 },
          { name: "Week 4", patients: 284, appointments: 235 }
        ];
      } else {
        return [
          { name: "Jan", patients: 780, appointments: 643 },
          { name: "Feb", patients: 820, appointments: 701 },
          { name: "Mar", patients: 901, appointments: 754 },
          { name: "Apr", patients: 935, appointments: 812 },
          { name: "May", patients: 1020, appointments: 893 },
          { name: "Jun", patients: 1089, appointments: 945 }
        ];
      }
    };
    
    setChartData(generateData());
  }, [timeframe]);
  
  const statistics = [
    {
      title: "Total Patients",
      value: analyticsData.patientCount,
      icon: <Users className="h-6 w-6 text-blue-500" />,
      change: "+12%",
      trend: "up"
    },
    {
      title: "Today's Appointments",
      value: analyticsData.appointmentsToday,
      icon: <Calendar className="h-6 w-6 text-green-500" />,
      change: "+3%",
      trend: "up"
    },
    {
      title: "Active Patients",
      value: analyticsData.activePatients,
      icon: <Activity className="h-6 w-6 text-purple-500" />,
      change: "+8%",
      trend: "up"
    },
    {
      title: "Recent Activity",
      value: analyticsData.recentActivity,
      icon: <Activity className="h-6 w-6 text-orange-500" />,
      change: "-5%",
      trend: "down"
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
        <p className="text-gray-500">Overview of patient and appointment statistics</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statistics.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
                <p className={`text-sm mt-2 ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                  {stat.change} from last month
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-full">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Patient & Appointment Trends</h3>
          <div className="relative">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="appearance-none bg-gray-50 py-2 px-4 pr-8 rounded border border-gray-200 text-gray-700 focus:outline-none focus:border-blue-500"
            >
              <option>Week</option>
              <option>Month</option>
              <option>Year</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="patients" name="Patients" fill="#4F46E5" />
            <Bar dataKey="appointments" name="Appointments" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminAnalytics;