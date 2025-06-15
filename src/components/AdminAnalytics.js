import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

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

  const COLORS = ['#8B5CF6', '#06D6A0', '#F59E0B', '#EF4444', '#3B82F6'];
  const CHART_COLORS = {
    primary: '#8B5CF6',
    secondary: '#06D6A0',
    tertiary: '#F59E0B',
    quaternary: '#EF4444'
  };

  useEffect(() => {
    const setupAnalyticsListeners = () => {
      const listeners = [];

      const patientsListener = onSnapshot(collection(db, "patients"), (snapshot) => {
        const patients = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt || null
        }));
        updateUserGrowthData(patients, 'patients');
      });

      const doctorsListener = onSnapshot(collection(db, "doctors"), (snapshot) => {
        const doctors = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          appliedAt: doc.data().appliedAt?.toDate?.() || doc.data().appliedAt || null
        }));
        updateDoctorAnalytics(doctors);
        updateUserGrowthData(doctors, 'doctors');
      });

      const appointmentsListener = onSnapshot(collection(db, "appointments"), (snapshot) => {
        const appointments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt || null
        }));
        updateAppointmentTrends(appointments);
      });

      listeners.push(patientsListener, doctorsListener, appointmentsListener);

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
        const rawDate = user.createdAt || user.appliedAt;
        let userDateStr = "";

        if (rawDate?.toDate) {
          userDateStr = rawDate.toDate().toISOString().split("T")[0];
        } else if (rawDate instanceof Date) {
          userDateStr = rawDate.toISOString().split("T")[0];
        } else if (typeof rawDate === "string" && !isNaN(Date.parse(rawDate))) {
          userDateStr = new Date(rawDate).toISOString().split("T")[0];
        }

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
        return aptDate && aptDate.toISOString().split('T')[0] === dateStr;
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
    setAnalytics(prev => ({
      ...prev,
      platformMetrics: {
        ...prev.platformMetrics,
        avgDailySignups: Math.round(adminData.recentSignups / 7),
        avgWeeklyAppointments: Math.round(adminData.totalAppointments / 4),
        conversionRate: ((adminData.approvedDoctors / adminData.totalDoctors) * 100).toFixed(1),
        activeUsersToday: Math.floor(Math.random() * 50) + 20,
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

  return <div>/* Your JSX content for the analytics UI */</div>;
};

export default AdminAnalytics;