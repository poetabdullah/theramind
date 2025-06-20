import React, { useState, useEffect } from 'react';
import { db, analytics, performance } from '../firebaseConfig'; 
import { 
  collection, 
  onSnapshot,
  query,
  where,
  getCountFromServer
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
  Cell
} from 'recharts';

const AdminAnalytics = () => {
  const [metrics, setMetrics] = useState({
    userGrowth: [],
    activeUsers: 0,
    sessionDuration: 0,
    pageViews: [],
    performanceMetrics: {},
    realtimeStats: {
      onlineUsers: 0,
      activeSessions: 0,
      todaySignups: 0
    }
  });
  const [loading, setLoading] = useState(true);

  // Initialize Firebase Analytics and Performance
  useEffect(() => {
    const initFirebaseAnalytics = async () => {
      try {
        // Log that analytics page was viewed
        Analytics.logEvent('admin_analytics_viewed');
        
        // Start performance trace
        const trace = perf.trace('admin_analytics_load');
        trace.start();
        
        // Fetch initial data
        await fetchRealtimeData();
        
        trace.stop();
        setLoading(false);
      } catch (error) {
        console.error("Error initializing analytics:", error);
        setLoading(false);
      }
    };

    initFirebaseAnalytics();
  }, []);

  // Set up real-time listeners
  useEffect(() => {
    const unsubscribeFunctions = [];

    // Real-time user count
    const usersQuery = query(collection(db, 'users'), where('lastActive', '>', new Date(Date.now() - 30 * 60 * 1000)));
    const usersUnsubscribe = onSnapshot(usersQuery, (snapshot) => {
      setMetrics(prev => ({
        ...prev,
        realtimeStats: {
          ...prev.realtimeStats,
          onlineUsers: snapshot.size
        }
      }));
    });
    unsubscribeFunctions.push(usersUnsubscribe);

    // Real-time sessions
    const sessionsQuery = query(collection(db, 'sessions'), where('expiresAt', '>', new Date()));
    const sessionsUnsubscribe = onSnapshot(sessionsQuery, (snapshot) => {
      setMetrics(prev => ({
        ...prev,
        realtimeStats: {
          ...prev.realtimeStats,
          activeSessions: snapshot.size
        }
      }));
    });
    unsubscribeFunctions.push(sessionsUnsubscribe);

    // Daily signups
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const signupsQuery = query(collection(db, 'users'), where('createdAt', '>=', today));
    const signupsUnsubscribe = onSnapshot(signupsQuery, (snapshot) => {
      setMetrics(prev => ({
        ...prev,
        realtimeStats: {
          ...prev.realtimeStats,
          todaySignups: snapshot.size
        }
      }));
    });
    unsubscribeFunctions.push(signupsUnsubscribe);

    // Performance metrics collection
    const loadPerformanceMetrics = async () => {
      try {
        // Get custom metrics from your implementation
        const customMetrics = {
          pageLoadTime: Math.random() * 1000 + 500, // Example value
          apiResponseTime: Math.random() * 300 + 100, // Example value
          renderTime: Math.random() * 200 + 50 // Example value
        };
        
        setMetrics(prev => ({
          ...prev,
          performanceMetrics: customMetrics
        }));
      } catch (error) {
        console.error("Error loading performance metrics:", error);
      }
    };

    const perfInterval = setInterval(loadPerformanceMetrics, 30000);
    loadPerformanceMetrics();

    return () => {
      unsubscribeFunctions.forEach(unsub => unsub());
      clearInterval(perfInterval);
    };
  }, []);

  const fetchRealtimeData = async () => {
    try {
      // Get user growth data (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const usersQuery = query(
        collection(db, 'users'),
        where('createdAt', '>=', sevenDaysAgo)
      );
      const usersSnapshot = await getCountFromServer(usersQuery);
      
      // Get active users in last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const activeUsersQuery = query(
        collection(db, 'users'),
        where('lastActive', '>=', twentyFourHoursAgo)
      );
      const activeUsersSnapshot = await getCountFromServer(activeUsersQuery);

      setMetrics(prev => ({
        ...prev,
        activeUsers: activeUsersSnapshot.data().count,
        sessionDuration: 5.2 // Example value
      }));
    } catch (error) {
      console.error("Error fetching realtime data:", error);
    }
  };

  // Sample data generation for demonstration
  const generateSampleData = () => {
    const days = 7;
    const userGrowth = [];
    const pageViews = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      userGrowth.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        users: Math.floor(Math.random() * 50) + 20,
        newUsers: Math.floor(Math.random() * 10) + 5
      });
      
      pageViews.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        views: Math.floor(Math.random() * 200) + 100,
        unique: Math.floor(Math.random() * 150) + 50
      });
    }
    
    return { userGrowth, pageViews };
  };

  const { userGrowth, pageViews } = generateSampleData();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Users</h3>
          <p className="text-3xl font-bold text-purple-600">{metrics.realtimeStats.onlineUsers}</p>
          <p className="text-sm text-gray-500">Currently online</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Sessions</h3>
          <p className="text-3xl font-bold text-blue-600">{metrics.realtimeStats.activeSessions}</p>
          <p className="text-sm text-gray-500">In progress</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Today's Signups</h3>
          <p className="text-3xl font-bold text-green-600">{metrics.realtimeStats.todaySignups}</p>
          <p className="text-sm text-gray-500">New users</p>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">User Growth (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={userGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="users" fill="#8884d8" name="Total Users" />
            <Bar dataKey="newUsers" fill="#82ca9d" name="New Users" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-2">Page Load Time</h4>
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-blue-500 rounded-full" 
                style={{ width: `${Math.min(100, metrics.performanceMetrics.pageLoadTime || 0)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {metrics.performanceMetrics.pageLoadTime?.toFixed(2) || '0'} ms
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-2">API Response Time</h4>
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-green-500 rounded-full" 
                style={{ width: `${Math.min(100, metrics.performanceMetrics.apiResponseTime || 0)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {metrics.performanceMetrics.apiResponseTime?.toFixed(2) || '0'} ms
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-2">Render Time</h4>
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-purple-500 rounded-full" 
                style={{ width: `${Math.min(100, metrics.performanceMetrics.renderTime || 0)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {metrics.performanceMetrics.renderTime?.toFixed(2) || '0'} ms
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;