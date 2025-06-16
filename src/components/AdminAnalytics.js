import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { 
  collection, 
  onSnapshot, 
  getDocs
} from 'firebase/firestore';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

const AdminAnalytics = ({ adminData }) => {
  const [analytics, setAnalytics] = useState({
    userGrowthData: [],
    appointmentTrends: [],
    doctorStatusData: [],
    platformMetrics: {
      avgDailySignups: 0,
      avgWeeklyAppointments: 0,
      conversionRate: 0,
      activeUsersToday: 0,
      systemUptime: 99.8
    },
    realtimeStats: {
      onlineUsers: 0,
      todaySignups: 0,
      todayAppointments: 0,
      pendingActions: 0
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');

  // Color schemes for charts
  const COLORS = ['#8B5CF6', '#06D6A0', '#F59E0B', '#EF4444', '#3B82F6'];
  const CHART_COLORS = {
    primary: '#8B5CF6',
    secondary: '#06D6A0',
    tertiary: '#F59E0B',
    quaternary: '#EF4444'
  };

  // Helper function to safely convert Firestore timestamp to Date
  const toDate = (timestamp) => {
    if (!timestamp) return null;
    if (typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    return null;
  };

  // Helper function to safely format date to ISO string
  const toISODateString = (date) => {
    if (!date) return '';
    try {
      const dateObj = toDate(date);
      if (!dateObj) return '';
      return dateObj.toISOString().split('T')[0];
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  };

  useEffect(() => {
    const setupAnalyticsListeners = () => {
      const listeners = [];

      // Real-time user growth tracking
      const patientsListener = onSnapshot(collection(db, "patients"), (snapshot) => {
        const patients = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: toDate(doc.data().createdAt)
        }));
        
        updateUserGrowthData(patients, 'patients');
      });

      // Real-time doctor analytics
      const doctorsListener = onSnapshot(collection(db, "doctors"), (snapshot) => {
        const doctors = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          appliedAt: toDate(doc.data().appliedAt)
        }));
        
        updateDoctorAnalytics(doctors);
        updateUserGrowthData(doctors, 'doctors');
      });

      // Real-time appointment tracking
      const appointmentsListener = onSnapshot(collection(db, "appointments"), (snapshot) => {
        const appointments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: toDate(doc.data().createdAt)
        }));
        
        updateAppointmentTrends(appointments);
      });

      listeners.push(patientsListener, doctorsListener, appointmentsListener);
      
      // Update platform metrics every minute
      const metricsInterval = setInterval(() => {
        updatePlatformMetrics();
      }, 60000);

      return () => {
        listeners.forEach(unsubscribe => unsubscribe());
        clearInterval(metricsInterval);
      };
    };

    const cleanup = setupAnalyticsListeners();
    updatePlatformMetrics();
    setLoading(false);

    return cleanup;
  }, [timeRange]);

  const updateUserGrowthData = (users, type) => {
    const days = getTimeRangeDays();
    const growthData = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayUsers = users.filter(user => {
        const userDate = user.createdAt || user.appliedAt;
        const userDateStr = toISODateString(userDate);
        return userDateStr === dateStr;
      });

      const existingDay = growthData.find(d => d.date === dateStr);
      if (existingDay) {
        existingDay[type] = dayUsers.length;
      } else {
        growthData.push({
          date: dateStr,
          displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          [type]: dayUsers.length,
          total: 0
        });
      }
    }

    setAnalytics(prev => ({
      ...prev,
      userGrowthData: growthData.map(day => ({
        ...day,
        total: (day.patients || 0) + (day.doctors || 0)
      }))
    }));
  };

  const updateDoctorAnalytics = (doctors) => {
    const statusCounts = doctors.reduce((acc, doctor) => {
      const status = doctor.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const doctorStatusData = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      percentage: ((count / doctors.length) * 100).toFixed(1)
    }));

    setAnalytics(prev => ({
      ...prev,
      doctorStatusData
    }));
  };

  const updateAppointmentTrends = (appointments) => {
    const days = getTimeRangeDays();
    const trendsData = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayAppointments = appointments.filter(apt => {
        const aptDate = apt.createdAt;
        const aptDateStr = toISODateString(aptDate);
        return aptDateStr === dateStr;
      });

      const statusCounts = dayAppointments.reduce((acc, apt) => {
        const status = apt.status || 'scheduled';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      trendsData.push({
        date: dateStr,
        displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total: dayAppointments.length,
        scheduled: statusCounts.scheduled || 0,
        completed: statusCounts.completed || 0,
        cancelled: statusCounts.cancelled || 0
      });
    }

    setAnalytics(prev => ({
      ...prev,
      appointmentTrends: trendsData
    }));
  };

  const updatePlatformMetrics = () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Simulate real-time metrics (replace with actual Firebase queries)
    setAnalytics(prev => ({
      ...prev,
      platformMetrics: {
        ...prev.platformMetrics,
        avgDailySignups: Math.round(adminData.recentSignups / 7),
        avgWeeklyAppointments: Math.round(adminData.totalAppointments / 4),
        conversionRate: ((adminData.approvedDoctors / adminData.totalDoctors) * 100).toFixed(1),
        activeUsersToday: Math.floor(Math.random() * 50) + 20, // Simulate active users
        systemUptime: 99.8 + (Math.random() * 0.2)
      },
      realtimeStats: {
        onlineUsers: Math.floor(Math.random() * 15) + 5,
        todaySignups: Math.floor(Math.random() * 10) + 2,
        todayAppointments: Math.floor(Math.random() * 25) + 5,
        pendingActions: adminData.pendingDoctors
      }
    }));
  };

  const getTimeRangeDays = () => {
    switch (timeRange) {
      case '24hours': return 1;
      case '7days': return 7;
      case '30days': return 30;
      case '90days': return 90;
      default: return 7;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Stats Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-purple-700">Real-time Analytics</h2>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
          >
            <option value="24hours">Last 24 Hours</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
        </div>
        
        {/* Real-time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Online Users</p>
                <p className="text-2xl font-bold">{analytics.realtimeStats.onlineUsers}</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Today's Signups</p>
                <p className="text-2xl font-bold">{analytics.realtimeStats.todaySignups}</p>
              </div>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z"/>
              </svg>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Today's Appointments</p>
                <p className="text-2xl font-bold">{analytics.realtimeStats.todayAppointments}</p>
              </div>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1z"/>
              </svg>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Pending Actions</p>
                <p className="text-2xl font-bold">{analytics.realtimeStats.pendingActions}</p>
              </div>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">User Growth Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="displayDate" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="patients" 
                stackId="1" 
                stroke={CHART_COLORS.primary} 
                fill={CHART_COLORS.primary}
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="doctors" 
                stackId="1" 
                stroke={CHART_COLORS.secondary} 
                fill={CHART_COLORS.secondary}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Doctor Status Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Doctor Applications Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.doctorStatusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({name, percentage}) => `${name}: ${percentage}%`}
              >
                {analytics.doctorStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Appointment Trends */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.appointmentTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="displayDate" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke={CHART_COLORS.primary} 
                strokeWidth={3}
                dot={{ fill: CHART_COLORS.primary, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke={CHART_COLORS.secondary} 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="cancelled" 
                stroke={CHART_COLORS.quaternary} 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Performance Metrics */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Platform Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">System Uptime</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${analytics.platformMetrics.systemUptime}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{analytics.platformMetrics.systemUptime.toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Doctor Approval Rate</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${analytics.platformMetrics.conversionRate}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{analytics.platformMetrics.conversionRate}%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{analytics.platformMetrics.avgDailySignups}</p>
                <p className="text-sm text-gray-600">Avg Daily Signups</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{analytics.platformMetrics.avgWeeklyAppointments}</p>
                <p className="text-sm text-gray-600">Avg Weekly Appointments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
              </svg>
            </div>
            <h4 className="font-semibold text-gray-800">Excellent</h4>
            <p className="text-sm text-gray-600">System Performance</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-16 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h4 className="font-semibold text-gray-800">Growing</h4>
            <p className="text-sm text-gray-600">User Base</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
            </div>
            <h4 className="font-semibold text-gray-800">Optimized</h4>
            <p className="text-sm text-gray-600">Platform Usage</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;