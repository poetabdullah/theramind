import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db, storage } from "../firebaseConfig";

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
import { ref, listAll, getDownloadURL } from "firebase/storage";
import AdminAnalytics from "../components/AdminAnalytics";
import Footer from "../components/Footer";
import { sendAccountStatusEmail } from "../components/emailService";
import { toast } from 'react-toastify';
import emailjs from '@emailjs/browser';

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
    recentSignups: 0,
    activeSessions: 0,
    todayAppointments: 0
  });
  const [pendingDoctorsList, setPendingDoctorsList] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState(null);
  const [realTimeListeners, setRealTimeListeners] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [doctorDocuments, setDoctorDocuments] = useState([]);
  
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        verifyAdminAccess(user.email);
      } else {
        setIsAuthorized(false);
        navigate('/login');
      }
    });

    return () => {
      unsubscribe();
      realTimeListeners.forEach(unsubscribe => unsubscribe());
    };
  }, [navigate, auth]);

  const verifyAdminAccess = async (email) => {
    try {
      setLoading(true);
      const adminDoc = await getDoc(doc(db, "admin", email));
      
      if (!adminDoc.exists() || adminDoc.data().status !== 'active') {
        setError("Access Denied: You don't have administrator privileges");
        setIsAuthorized(false);
        setLoading(false);
        setTimeout(() => navigate('/'), 3000);
        return;
      }

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

    // Doctors listener
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

    // Patients listener
    const patientsListener = onSnapshot(collection(db, "patients"), (snapshot) => {
      const patientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        email: doc.id,
        ...doc.data()
      }));
      
      const blockedCount = patientsData.filter(patient => patient.status === 'blocked').length;
      
      setPatientsList(patientsData);
      setAdminData(prev => ({
        ...prev,
        totalPatients: patientsData.length,
        blockedPatients: blockedCount
      }));
    });

    // Appointments listener
    const appointmentsListener = onSnapshot(collection(db, "appointments"), (snapshot) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayAppointments = snapshot.docs.filter(doc => {
        const appointmentDate = doc.data().date?.toDate();
        return appointmentDate >= today;
      }).length;

      setAdminData(prev => ({
        ...prev,
        totalAppointments: snapshot.size,
        todayAppointments
      }));
    });

    // System logs listener (all users)
    const logsListener = onSnapshot(
      query(collection(db, "admin_logs"), orderBy("timestamp", "desc"), limit(50)), 
      (snapshot) => {
        const activities = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        }));
        setRecentActivities(activities);
      }
    );

    listeners.push(doctorsListener, patientsListener, appointmentsListener, logsListener);
    setRealTimeListeners(listeners);
  };

  const fetchDashboardData = async () => {
    try {
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

      // Get active sessions (approximate)
      const activeSessionsQuery = query(
        collection(db, "sessions"),
        where("expiresAt", ">", new Date())
      );
      const activeSessionsSnapshot = await getDocs(activeSessionsQuery);

      setAdminData(prev => ({
        ...prev,
        recentSignups: recentPatientsSnapshot.size + recentDoctorsSnapshot.size,
        activeSessions: activeSessionsSnapshot.size
      }));
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
        ipAddress: "N/A",
        userAgent: navigator.userAgent
      });
    } catch (err) {
      console.error("Error logging admin activity:", err);
    }
  };

  const fetchDoctorDocuments = async (doctorEmail) => {
    try {
      setLoading(true);
      const storageRef = ref(storage, `doctors/${doctorEmail}/documents`);
      const documents = await listAll(storageRef);
      
      const docsWithUrls = await Promise.all(
        documents.items.map(async (item) => {
          const url = await getDownloadURL(item);
          return {
            name: item.name,
            url
          };
        })
      );
      
      setDoctorDocuments(docsWithUrls);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching doctor documents:", err);
      setError("Failed to load doctor documents");
      setLoading(false);
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
      
      // Send email notification
      const doctorDoc = await getDoc(doctorRef);
      const doctorData = doctorDoc.data();
      
      await sendAccountStatusEmail({
        to: email,
        subject: `Doctor Application ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        text: `Dear ${doctorData.name || 'Doctor'},\n\nYour application has been ${action === 'approve' ? 'approved' : 'rejected'} by the administrator.\n\n${action === 'approve' ? 'You can now log in to your account and start receiving patients.' : 'Please contact support if you have any questions.'}\n\nRegards,\nThe Admin Team`
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
    // 1. Initialize toast and loading state
    toast.info('Processing request...', { autoClose: 1500 });
    
    // 2. Update patient status in Firebase
    const patientRef = doc(db, "patients", email);
    const newStatus = action === 'block' ? 'blocked' : 'active';
    
    await updateDoc(patientRef, { 
      status: newStatus,
      lastModified: new Date(),
      modifiedBy: auth.currentUser.email
    });

    // 3. Terminate active sessions if blocking
    if (action === 'block') {
      // Delete from logged_in_users
      const loggedInUserRef = doc(db, "logged_in_users", email);
      await deleteDoc(loggedInUserRef).catch(() => {});
      
      // Delete all sessions
      const sessionsQuery = query(
        collection(db, "sessions"),
        where("userId", "==", email)
      );
      const sessionsSnapshot = await getDocs(sessionsQuery);
      await Promise.all(sessionsSnapshot.docs.map(doc => deleteDoc(doc.ref)));
    }

    // 4. Get patient data for email
    const patientDoc = await getDoc(patientRef);
    const patientData = patientDoc.data();

   await emailjs.send(
  process.env.REACT_APP_EMAILJS_SERVICE_ID,
  process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
  {
    to_email: email,  
    recipient_name: patientData?.name || 'User',  
    status: newStatus  
  },
  process.env.REACT_APP_EMAILJS_USER_ID
);
    // 6. Show success notification
    toast.success(`Patient ${action === 'block' ? 'blocked' : 'activated'} successfully!`, {
      autoClose: 3000
    });

  } catch (error) {
    console.error('Error:', error);
    toast.error(`Failed to ${action} patient: ${error.message}`, {
      autoClose: 5000
    });
  }
};
const handleDeletePatient = async (email) => {
    try {
        setLoading(true);
        
        // 1. Get patient data before deletion
        const patientRef = doc(db, "patients", email);
        const patientDoc = await getDoc(patientRef);
        const patientData = patientDoc.data();
        
        // 2. Log the action
        await logAdminActivity(
            auth.currentUser.email, 
            'PATIENT_DELETION',
            `Patient ${email} permanently deleted`,
            { patientEmail: email }
        );
        
        // 3. Send account deletion notification
        await emailjs.send(
            process.env.REACT_APP_EMAILJS_SERVICE_ID_STATUS,
            process.env.REACT_APP_EMAILJS_TEMPLATE_STATUS,
            {
                recipient_name: patientData?.name || 'User',
                user_type: 'patient',
                status: 'deleted',
                reason: 'Account permanently deleted by administrator',
                action_date: new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                to_email: email
            }
        );
        
        // 4. Perform actual deletion
        await deleteDoc(patientRef);
        
        // 5. Update UI
        setSuccess({
            title: 'Patient Deleted',
            message: `Patient ${email} has been permanently deleted.`,
            timestamp: new Date().toISOString()
        });
        
        setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
        setLoading(false);
        console.error("Error deleting patient:", err);
        
        setError({
            title: 'Deletion Failed',
            message: err.message || "Failed to delete patient. Please try again.",
            details: `Failed to delete patient ${email}`,
            timestamp: new Date().toISOString()
        });

        await logAdminActivity(
            auth.currentUser.email,
            'DELETE_FAILED',
            `Failed to delete patient ${email}`,
            { 
                error: err.message,
                patientEmail: email 
            }
        );
    } finally {
        setLoading(false);
    }
};
  const handleLogout = async () => {
    try {
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

  const viewDoctorDetails = async (doctorEmail) => {
    try {
      setLoading(true);
      const doctorDoc = await getDoc(doc(db, "doctors", doctorEmail));
      setSelectedDoctor(doctorDoc.data());
      await fetchDoctorDocuments(doctorEmail);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching doctor details:", err);
      setError("Failed to load doctor details");
      setLoading(false);
    }
  };

  const viewPatientDetails = async (patientEmail) => {
    try {
      setLoading(true);
      const patientDoc = await getDoc(doc(db, "patients", patientEmail));
      setSelectedPatient(patientDoc.data());
      setLoading(false);
    } catch (err) {
      console.error("Error fetching patient details:", err);
      setError("Failed to load patient details");
      setLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedDoctor(null);
    setSelectedPatient(null);
    setDoctorDocuments([]);
  };

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
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Today's Appointments</h2>
                <p className="text-3xl font-bold text-green-600">{adminData.todayAppointments}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {adminData.totalAppointments} total
                </p>
              </div>
            </div>

            {/* Second Row of Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Recent Signups</h2>
                <p className="text-3xl font-bold text-blue-600">{adminData.recentSignups}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Last 7 days
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Active Sessions</h2>
                <p className="text-3xl font-bold text-teal-600">{adminData.activeSessions}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Currently logged in
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Platform Health</h2>
                <p className="text-3xl font-bold text-green-600">100%</p>
                <p className="text-sm text-gray-500 mt-1">
                  All systems operational
                </p>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent System Activities</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {activity.adminEmail} • {activity.timestamp?.toLocaleString()}
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
                                onClick={() => viewDoctorDetails(doctor.email)}
                                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
                              >
                                View
                              </button>
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
                          <button
                            onClick={() => viewPatientDetails(patient.email)}
                            className="bg-blue-600 text-white py-1 px-3 rounded-lg hover:bg-blue-700 transition duration-200"
                          >
                            View
                          </button>
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
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <AdminAnalytics adminData={adminData} />
          </div>
        )}

        {activeTab === 'logs' && (
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
        )}
      </div>

        <Footer />
    </div>
  );
};

export default AdminDashboard;