import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebaseConfig";
import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import AdminAnalytics from "../components/AdminAnalytics";
import AdminLogs from "../components/AdminLogs";
import Footer from "../components/Footer";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [adminData, setAdminData] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    pendingDoctors: 0,
    approvedDoctors: 0,
    rejectedDoctors: 0
  });
  const [pendingDoctorsList, setPendingDoctorsList] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState(null);
  
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        verifyAdminAccess(user.email);
      } else {
        // If no user is logged in, redirect to main login page
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate, auth]);

  const verifyAdminAccess = async (email) => {
    try {
      setLoading(true);
      // Check if user has admin access
      const adminDoc = await getDoc(doc(db, "admin", email));
      
      if (!adminDoc.exists()) {
        setError("You don't have administrator access");
        setLoading(false);
        // Don't sign out - let them navigate elsewhere via normal UI
        return;
      }

      // User is confirmed admin, fetch dashboard data
      await fetchDashboardData();
      setLoading(false);
    } catch (err) {
      console.error("Error checking admin status:", err);
      setError("Failed to verify administrator access");
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Get patients count
      const patientsSnapshot = await getDocs(collection(db, "patients"));
      const patientsCount = patientsSnapshot.size;

      // Get doctors count and categorize by status
      const doctorsSnapshot = await getDocs(collection(db, "doctors"));
      const doctorsCount = doctorsSnapshot.size;
      
      const pendingDocs = doctorsSnapshot.docs.filter(
        doc => doc.data().status === "pending"
      );
      const pendingCount = pendingDocs.length;
      
      const approvedCount = doctorsSnapshot.docs.filter(
        doc => doc.data().status === "approved"
      ).length;
      
      const rejectedCount = doctorsSnapshot.docs.filter(
        doc => doc.data().status === "rejected"
      ).length;

      // Format pending doctors data for display
      const pendingDoctors = pendingDocs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: doc.id,
          name: data.name || "No name provided",
          specialty: data.specialty || "Not specified",
          appliedAt: data.appliedAt ? new Date(data.appliedAt.toDate()).toLocaleDateString() : "Unknown"
        };
      });

      setAdminData({
        totalPatients: patientsCount,
        totalDoctors: doctorsCount,
        pendingDoctors: pendingCount,
        approvedDoctors: approvedCount,
        rejectedDoctors: rejectedCount
      });
      
      setPendingDoctorsList(pendingDoctors);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please refresh the page.");
    }
  };

  const handleDoctorApproval = async (email, action) => {
    try {
      setLoading(true);
      
      // Update doctor status in Firestore
      const doctorRef = doc(db, "doctors", email);
      await updateDoc(doctorRef, { 
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewedAt: new Date(),
        reviewedBy: auth.currentUser.email
      });
      
      // Refresh data
      await fetchDashboardData();
      
      setSuccess(`Doctor ${email} has been ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(`Error ${action}ing doctor:`, err);
      setError(`Failed to ${action} doctor. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Redirect to main login page
    } catch (err) {
      console.error("Error signing out:", err);
      setError("Failed to log out. Please try again.");
    }
  };

  // Function to dismiss notifications
  const dismissNotification = (type) => {
    if (type === 'error') setError(null);
    if (type === 'success') setSuccess(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 via-indigo-600 to-orange-600">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin h-12 w-12 mx-auto mb-4 border-4 border-purple-600 border-t-transparent rounded-full"></div>
          <p className="text-gray-600">Loading administrator dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <nav className="bg-gradient-to-r from-purple-700 via-indigo-600 to-orange-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">TheraMind Admin Portal</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-white">{currentUser?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-white text-indigo-600 hover:bg-gray-100 font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

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
                aria-label="Dismiss"
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
                aria-label="Dismiss"
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
          <div className="flex">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`flex-1 py-3 px-5 rounded-lg text-center transition duration-200 ${
                activeTab === 'dashboard' 
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500 text-white font-medium' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('doctors')} 
              className={`flex-1 py-3 px-5 rounded-lg text-center transition duration-200 ${
                activeTab === 'doctors' 
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500 text-white font-medium' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Manage Doctors
            </button>
            <button 
              onClick={() => setActiveTab('patients')} 
              className={`flex-1 py-3 px-5 rounded-lg text-center transition duration-200 ${
                activeTab === 'patients' 
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500 text-white font-medium' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Manage Patients
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <>
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Total Patients</h2>
                <p className="text-3xl font-bold text-purple-600">{adminData.totalPatients}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Total Doctors</h2>
                <p className="text-3xl font-bold text-indigo-600">{adminData.totalDoctors}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 relative">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Pending Approvals</h2>
                <p className="text-3xl font-bold text-orange-500">{adminData.pendingDoctors}</p>
                {adminData.pendingDoctors > 0 && (
                  <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Action Needed
                  </span>
                )}
              </div>
            </div>

            {/* Main Dashboard Panel */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-purple-700 mb-6">Admin Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-700">Doctor Status</h3>
                  <div className="flex items-center mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${adminData.approvedDoctors / adminData.totalDoctors * 100}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{adminData.approvedDoctors} Approved</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${adminData.pendingDoctors / adminData.totalDoctors * 100}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{adminData.pendingDoctors} Pending</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${adminData.rejectedDoctors / adminData.totalDoctors * 100}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{adminData.rejectedDoctors} Rejected</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-lg">
                  <h3 className="font-medium">Quick Navigation</h3>
                  <div className="mt-2">
                    <button 
                      onClick={() => setActiveTab('doctors')}
                      className="bg-white text-indigo-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-100 transition duration-200 mt-2 w-full text-center"
                    >
                      Review Doctor Applications
                    </button>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-indigo-600 to-orange-500 text-white p-4 rounded-lg">
                  <h3 className="font-medium">System Status</h3>
                  <p className="mt-2 text-sm">All systems operational</p>
                  <p className="text-sm">Last updated: {new Date().toLocaleString()}</p>
                </div>
              </div>

              {/* Dashboard Welcome */}
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome to TheraMind Admin Dashboard</h3>
                <p className="text-gray-600">
                  You have successfully logged in as an administrator. From here you can manage doctors, 
                  patients, and oversee the entire TheraMind platform. Use the tabs above to navigate 
                  between different administrative functions.
                </p>
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
            
            {/* Pending Doctors Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Pending Approvals ({adminData.pendingDoctors})</h3>
              
              {adminData.pendingDoctors === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-600">No pending doctor applications</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingDoctorsList.map((doctor) => (
                        <tr key={doctor.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.specialty}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.appliedAt}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleDoctorApproval(doctor.email, 'approve')}
                                className="bg-green-600 text-white py-1 px-3 rounded-lg hover:bg-green-700 transition duration-200"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleDoctorApproval(doctor.email, 'reject')}
                                className="bg-red-600 text-white py-1 px-3 rounded-lg hover:bg-red-700 transition duration-200"
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
            
            {/* Doctor Management Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-medium text-green-700">Approved Doctors</h3>
                  <p className="text-2xl font-bold text-green-600 mt-2">{adminData.approvedDoctors}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-medium text-purple-700">Pending Doctors</h3>
                  <p className="text-2xl font-bold text-purple-600 mt-2">{adminData.pendingDoctors}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h3 className="font-medium text-red-700">Rejected Doctors</h3>
                  <p className="text-2xl font-bold text-red-600 mt-2">{adminData.rejectedDoctors}</p>
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
                <span className="font-medium">Total:</span> {adminData.totalPatients}
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Patient Management Features</h3>
              <p className="text-gray-700">
                This section would allow you to view and manage patient accounts, review patient data,
                and handle patient-related administrative tasks.
              </p>
              <div className="mt-4">
                <button className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-200">
                  View Patient Directory
                </button>
              </div>
            </div>
            
            <div className="mt-6 text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="mt-2 text-gray-600">More patient management features coming soon</p>
            </div>
          </div>
        )}
      </div>
      <AdminAnalytics />
      <AdminLogs />
      
     
      <Footer />
    </div>
  );
};

export default AdminDashboard;