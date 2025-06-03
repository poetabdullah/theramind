import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebaseConfig";
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  getDoc,
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  deleteDoc,
  onSnapshot
} from "firebase/firestore";
import AdminAnalytics from "../components/AdminAnalytics";
import AdminLogs from "../components/AdminLogs";
import Footer from "../components/Footer";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminData, setAdminData] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    pendingDoctors: 0,
    approvedDoctors: 0,
    rejectedDoctors: 0,
    blockedPatients: 0,
    totalAppointments: 0,
    recentSignups: 0
  });
  const [pendingDoctorsList, setPendingDoctorsList] = useState([]);
  const [patientsList, setPatientssList] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState(null);
  const [realTimeListeners, setRealTimeListeners] = useState([]);
  
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        verifyAdminAccess(user.email);
      } else {
        // Redirect to login if no user
        setIsAuthorized(false);
        navigate('/login');
      }
    });

    return () => {
      unsubscribe();
      // Clean up real-time listeners
      realTimeListeners.forEach(unsubscribe => unsubscribe());
    };
  }, [navigate, auth]);

  const verifyAdminAccess = async (email) => {
    try {
      setLoading(true);
      
      // Check if user exists in admin collection
      const adminDoc = await getDoc(doc(db, "admin", email));
      
      if (!adminDoc.exists()) {
        setError("Access Denied: You don't have administrator privileges");
        setIsAuthorized(false);
        setLoading(false);
        // Redirect to home page after 3 seconds
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      const adminInfo = adminDoc.data();
      
      // Check if admin account is active
      if (adminInfo.status !== 'active') {
        setError("Access Denied: Your administrator account is not active");
        setIsAuthorized(false);
        setLoading(false);
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      // Log admin access
      await logAdminActivity(email, 'LOGIN', 'Admin dashboard accessed');
      
      setIsAuthorized(true);
      await setupRealTimeListeners();
      await fetchDashboardData();
      setLoading(false);
    } catch (err) {
      console.error("Error verifying admin access:", err);
      setError("Failed to verify administrator access");
      setIsAuthorized(false);
      setLoading(false);
    }
  };

  const setupRealTimeListeners = () => {
    const listeners = [];

    // Real-time listener for doctors
    const doctorsListener = onSnapshot(collection(db, "doctors"), (snapshot) => {
      const doctorsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const pending = doctorsData.filter(doc => doc.status === "pending");
      const approved = doctorsData.filter(doc => doc.status === "approved");
      const rejected = doctorsData.filter(doc => doc.status === "rejected");
      
      setPendingDoctorsList(pending.map(doc => ({
        id: doc.id,
        email: doc.id,
        name: doc.name || "No name provided",
        specialty: doc.specialty || "Not specified",
        appliedAt: doc.appliedAt ? new Date(doc.appliedAt.toDate()).toLocaleDateString() : "Unknown",
        phone: doc.phone || "Not provided",
        experience: doc.experience || "Not specified"
      })));

      setAdminData(prev => ({
        ...prev,
        totalDoctors: doctorsData.length,
        pendingDoctors: pending.length,
        approvedDoctors: approved.length,
        rejectedDoctors: rejected.length
      }));
    });

    // Real-time listener for patients
    const patientsListener = onSnapshot(collection(db, "patients"), (snapshot) => {
      const patientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        email: doc.id,
        ...doc.data()
      }));
      
      const blockedCount = patientsData.filter(patient => patient.status === 'blocked').length;
      
      setPatientssList(patientsData);
      setAdminData(prev => ({
        ...prev,
        totalPatients: patientsData.length,
        blockedPatients: blockedCount
      }));
    });

    listeners.push(doctorsListener, patientsListener);
    setRealTimeListeners(listeners);
  };

  const fetchDashboardData = async () => {
    try {
      // Get appointments count
      const appointmentsSnapshot = await getDocs(collection(db, "appointments"));
      const appointmentsCount = appointmentsSnapshot.size;

      // Get recent signups (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentPatientsQuery = query(
        collection(db, "patients"),
        where("createdAt", ">=", sevenDaysAgo),
        orderBy("createdAt", "desc")
      );
      const recentPatientsSnapshot = await getDocs(recentPatientsQuery);
      
      const recentDoctorsQuery = query(
        collection(db, "doctors"),
        where("appliedAt", ">=", sevenDaysAgo),
        orderBy("appliedAt", "desc")
      );
      const recentDoctorsSnapshot = await getDocs(recentDoctorsQuery);

      // Get recent activities
      const activitiesQuery = query(
        collection(db, "admin_logs"),
        orderBy("timestamp", "desc"),
        limit(10)
      );
      const activitiesSnapshot = await getDocs(activitiesQuery);
      const activities = activitiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));

      setAdminData(prev => ({
        ...prev,
        totalAppointments: appointmentsCount,
        recentSignups: recentPatientsSnapshot.size + recentDoctorsSnapshot.size
      }));
      
      setRecentActivities(activities);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load some dashboard data. Please refresh the page.");
    }
  };

  const logAdminActivity = async (adminEmail, action, description) => {
    try {
      await addDoc(collection(db, "admin_logs"), {
        adminEmail,
        action,
        description,
        timestamp: new Date(),
        ipAddress: "N/A", // You can implement IP tracking if needed
        userAgent: navigator.userAgent
      });
    } catch (err) {
      console.error("Error logging admin activity:", err);
    }
  };

  const handleDoctorApproval = async (email, action) => {
    try {
      setLoading(true);
      
      const doctorRef = doc(db, "doctors", email);
      await updateDoc(doctorRef, { 
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewedAt: new Date(),
        reviewedBy: auth.currentUser.email
      });
      
      // Log the action
      await logAdminActivity(
        auth.currentUser.email, 
        action.toUpperCase(), 
        `Doctor ${email} ${action}d`
      );
      
      setSuccess(`Doctor ${email} has been ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(`Error ${action}ing doctor:`, err);
      setError(`Failed to ${action} doctor. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientBlock = async (email, action) => {
    try {
      setLoading(true);
      
      const patientRef = doc(db, "patients", email);
      const newStatus = action === 'block' ? 'blocked' : 'active';
      
      await updateDoc(patientRef, { 
        status: newStatus,
        lastModified: new Date(),
        modifiedBy: auth.currentUser.email
      });
      
      // Log the action
      await logAdminActivity(
        auth.currentUser.email, 
        action.toUpperCase(), 
        `Patient ${email} ${action}ed`
      );
      
      setSuccess(`Patient ${email} has been ${action}ed successfully.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(`Error ${action}ing patient:`, err);
      setError(`Failed to ${action} patient. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async (email) => {
    if (!window.confirm(`Are you sure you want to permanently delete patient ${email}? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      
      await deleteDoc(doc(db, "patients", email));
      
      // Log the action
      await logAdminActivity(
        auth.currentUser.email, 
        'DELETE', 
        `Patient ${email} permanently deleted`
      );
      
      setSuccess(`Patient ${email} has been permanently deleted.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting patient:", err);
      setError("Failed to delete patient. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logAdminActivity(auth.currentUser.email, 'LOGOUT', 'Admin logged out');
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error("Error signing out:", err);
      setError("Failed to log out. Please try again.");
    }
  };

  const dismissNotification = (type) => {
    if (type === 'error') setError(null);
    if (type === 'success') setSuccess(null);
  };

  // Show loading screen while checking authorization
  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 via-indigo-600 to-orange-600">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin h-12 w-12 mx-auto mb-4 border-4 border-purple-600 border-t-transparent rounded-full"></div>
          <p className="text-gray-600">
            {loading ? "Verifying administrator access..." : "Access denied"}
          </p>
          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {currentUser?.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Notifications */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
            <div className="flex items-start">
              <div className="flex-grow">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={() => dismissNotification('error')}
                className="text-red-500 hover:text-red-700 ml-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg relative" role="alert">
            <div className="flex items-start">
              <div className="flex-grow">
                <p className="font-medium">Success</p>
                <p className="text-sm">{success}</p>
              </div>
              <button
                onClick={() => dismissNotification('success')}
                className="text-green-500 hover:text-green-700 ml-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6 p-1">
          <div className="flex flex-wrap">
            {['dashboard', 'doctors', 'patients', 'analytics', 'logs'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)} 
                className={`flex-1 min-w-fit py-3 px-5 rounded-lg text-center transition duration-200 ${
                  activeTab === tab 
                    ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500 text-white font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <>
            {/* Enhanced Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Total Patients</h2>
                <p className="text-3xl font-bold text-purple-600">{adminData.totalPatients}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {adminData.blockedPatients} blocked
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Total Doctors</h2>
                <p className="text-3xl font-bold text-indigo-600">{adminData.totalDoctors}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {adminData.approvedDoctors} approved
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 relative">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Pending Approvals</h2>
                <p className="text-3xl font-bold text-orange-500">{adminData.pendingDoctors}</p>
                {adminData.pendingDoctors > 0 && (
                  <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                    Action Needed
                  </span>
                )}
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Total Appointments</h2>
                <p className="text-3xl font-bold text-green-600">{adminData.totalAppointments}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {adminData.recentSignups} recent signups
                </p>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {activity.adminEmail} • {activity.timestamp?.toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        activity.action === 'APPROVE' ? 'bg-green-100 text-green-800' :
                        activity.action === 'REJECT' ? 'bg-red-100 text-red-800' :
                        activity.action === 'BLOCK' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {activity.action}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setActiveTab('doctors')}
                    className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition duration-200"
                  >
                    Review Doctor Applications ({adminData.pendingDoctors})
                  </button>
                  <button 
                    onClick={() => setActiveTab('patients')}
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-200"
                  >
                    Manage Patients ({adminData.totalPatients})
                  </button>
                  <button 
                    onClick={() => setActiveTab('analytics')}
                    className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition duration-200"
                  >
                    View Analytics
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'doctors' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-purple-700">Doctor Management</h2>
              <div className="text-gray-600">
                <span className="font-medium">Total:</span> {adminData.totalDoctors}
              </div>
            </div>
            
            {/* Enhanced Pending Doctors Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Pending Approvals ({adminData.pendingDoctors})
              </h3>
              
              {adminData.pendingDoctors === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-600 mt-2">No pending doctor applications</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor Info</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingDoctorsList.map((doctor) => (
                        <tr key={doctor.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{doctor.name}</p>
                              <p className="text-sm text-gray-500">{doctor.email}</p>
                              <p className="text-sm text-gray-500">{doctor.phone}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.specialty}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.experience}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.appliedAt}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleDoctorApproval(doctor.email, 'approve')}
                                className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200"
                                disabled={loading}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleDoctorApproval(doctor.email, 'reject')}
                                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-200"
                                disabled={loading}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* Doctor Statistics */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h3 className="font-medium text-green-700">Approved Doctors</h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">{adminData.approvedDoctors}</p>
                  <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${(adminData.approvedDoctors / adminData.totalDoctors) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <h3 className="font-medium text-purple-700">Pending Review</h3>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{adminData.pendingDoctors}</p>
                  <div className="mt-2 w-full bg-purple-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${(adminData.pendingDoctors / adminData.totalDoctors) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                  <h3 className="font-medium text-red-700">Rejected Applications</h3>
                  <p className="text-3xl font-bold text-red-600 mt-2">{adminData.rejectedDoctors}</p>
                  <div className="mt-2 w-full bg-red-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${(adminData.rejectedDoctors / adminData.totalDoctors) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-purple-700">Patient Management</h2>
              <div className="text-gray-600">
                <span className="font-medium">Total:</span> {adminData.totalPatients} | 
                <span className="font-medium ml-2">Blocked:</span> {adminData.blockedPatients}
              </div>
            </div>
            
            {/* Patients Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patientsList.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{patient.name || 'No name'}</p>
                          <p className="text-sm text-gray-500">{patient.email}</p>
                          <p className="text-sm text-gray-500">{patient.phone || 'No phone'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          patient.status === 'blocked' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {patient.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.createdAt ? new Date(patient.createdAt.toDate()).toLocaleDateString() : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {patient.status !== 'blocked' ? (
                            <button
                              onClick={() => handlePatientBlock(patient.email, 'block')}
                              className="bg-yellow-600 text-white py-1 px-3 rounded-lg hover:bg-yellow-700 transition duration-200"
                              disabled={loading}
                            >
                              Block
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePatientBlock(patient.email, 'unblock')}
                              className="bg-green-600 text-white py-1 px-3 rounded-lg hover:bg-green-700 transition duration-200"
                              disabled={loading}
                            >
                              Unblock
                            </button>
                          )}
                          <button
                            onClick={() => handleDeletePatient(patient.email)}
                            className="bg-red-600 text-white py-1 px-3 rounded-lg hover:bg-red-700 transition duration-200"
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Patient Statistics */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-700">Active Patients</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {adminData.totalPatients - adminData.blockedPatients}
                </p>
              </div>
              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                <h3 className="font-medium text-yellow-700">Blocked Patients</h3>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{adminData.blockedPatients}</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="font-medium text-green-700">Recent Signups</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{adminData.recentSignups}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <AdminAnalytics adminData={adminData} />
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-purple-700 mb-6">Platform Analytics</h2>
              
              {/* Analytics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                  <h3 className="text-lg font-semibold">User Growth</h3>
                  <p className="text-3xl font-bold mt-2">{adminData.recentSignups}</p>
                  <p className="text-sm opacity-90">Last 7 days</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                  <h3 className="text-lg font-semibold">Active Doctors</h3>
                  <p className="text-3xl font-bold mt-2">{adminData.approvedDoctors}</p>
                  <p className="text-sm opacity-90">Currently approved</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
                  <h3 className="text-lg font-semibold">Total Appointments</h3>
                  <p className="text-3xl font-bold mt-2">{adminData.totalAppointments}</p>
                  <p className="text-sm opacity-90">All time</p>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
                  <h3 className="text-lg font-semibold">Platform Health</h3>
                  <p className="text-3xl font-bold mt-2">98%</p>
                  <p className="text-sm opacity-90">Uptime</p>
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-600 mt-4">Advanced Analytics Coming Soon</h3>
                <p className="text-gray-500 mt-2">Interactive charts and detailed reports will be available here</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6">
            <AdminLogs />
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-purple-700 mb-6">System Logs</h2>
              
              {/* Enhanced Logs Display */}
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                            activity.action === 'APPROVE' ? 'bg-green-100 text-green-800' :
                            activity.action === 'REJECT' ? 'bg-red-100 text-red-800' :
                            activity.action === 'BLOCK' ? 'bg-yellow-100 text-yellow-800' :
                            activity.action === 'LOGIN' ? 'bg-blue-100 text-blue-800' :
                            activity.action === 'LOGOUT' ? 'bg-gray-100 text-gray-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {activity.action}
                          </span>
                          <h3 className="font-medium text-gray-900">{activity.description}</h3>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <p>Admin: {activity.adminEmail}</p>
                          <p>Time: {activity.timestamp?.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>{activity.timestamp?.toLocaleDateString()}</p>
                        <p>{activity.timestamp?.toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {recentActivities.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600 mt-2">No recent activities found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;