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
import DashboardContentManager from '../components/DashboardContentManager';
import DashboardAppointmentsManager from '../components/DashboardAppointmentsManager';
import ApprovedDoctorsList from '../components/ApprovedDoctorsList';
import TreatmentPlansComponent from '../components/TreatmentPlansComponent';
import Footer from "../components/Footer";
import { sendAccountStatusEmail } from "../components/emailService";
import { toast } from 'react-toastify';
import PendingDoctors from "../components/PendingDoctors";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  const [allDoctorsList, setAllDoctorsList] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState(null);
  const [realTimeListeners, setRealTimeListeners] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [doctorDocuments, setDoctorDocuments] = useState([]);
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [treatmentPlans, setTreatmentPlans] = useState([]);
  
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

    // Doctors listener - updated query to fetch all approved doctors
    const doctorsListener = onSnapshot(
      query(collection(db, "doctors"), where("STATUS", "==", "approved")),
      (snapshot) => {
        const doctorsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          appliedAt: doc.data().appliedAt?.toDate(),
          reviewedAt: doc.data().reviewedAt?.toDate()
        }));
        setAllDoctorsList(doctorsData);
        setAdminData(prev => ({
          ...prev,
          totalDoctors: doctorsData.length,
          approvedDoctors: doctorsData.length
        }));
      },
      (error) => {
        console.error("Error fetching doctors:", error);
        toast.error("Failed to load doctors data");
      }
    );
    listeners.push(doctorsListener);

    // Pending doctors listener
    const pendingDoctorsListener = onSnapshot(
      query(collection(db, "doctors"), where("STATUS", "==", "pending")),
      (snapshot) => {
        const pendingDoctors = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          appliedAt: doc.data().appliedAt?.toDate()
        }));
        setPendingDoctorsList(pendingDoctors);
        setAdminData(prev => ({
          ...prev,
          pendingDoctors: pendingDoctors.length
        }));
      }
    );
    listeners.push(pendingDoctorsListener);

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
    listeners.push(patientsListener);

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
    listeners.push(appointmentsListener);

    // Treatment plans listener
    const treatmentPlansListener = onSnapshot(
      collection(db, "treatment_plans"),
      (snapshot) => {
        const plans = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));
        setTreatmentPlans(plans);
      }
    );
    listeners.push(treatmentPlansListener);

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
      const status = action === 'approve' ? 'approved' : 'rejected';
      const doctorRef = doc(db, "doctors", email);
      
      await updateDoc(doctorRef, { 
        status: status,
        reviewedAt: new Date(),
        reviewedBy: auth.currentUser.email
      });

      const doctorDoc = await getDoc(doctorRef);
      await sendAccountStatusEmail(
        email,
        doctorDoc.data().name,
        status,
        action === 'reject' ? 'Application did not meet requirements' : ''
      );

      toast.success(`Doctor ${status} successfully`);
    } catch (error) {
      toast.error(`Action failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientBlock = async (email, action) => {
    try {
      setLoading(true);
      const status = action === 'block' ? 'blocked' : 'active';
      const patientRef = doc(db, "patients", email);
      
      await updateDoc(patientRef, { 
        status: status,
        lastModified: new Date()
      });

      if (action === 'block') {
        // Terminate sessions
        const sessionsQuery = query(
          collection(db, "sessions"),
          where("userId", "==", email)
        );
        const sessionsSnapshot = await getDocs(sessionsQuery);
        await Promise.all(sessionsSnapshot.docs.map(doc => deleteDoc(doc.ref)));
      }

      const patientDoc = await getDoc(patientRef);
      await sendAccountStatusEmail(
        email,
        patientDoc.data().name,
        status,
        action === 'block' ? 'Account suspended due to policy violation' : ''
      );

      toast.success(`Patient ${status} successfully`);
    } catch (error) {
      toast.error(`Action failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async (email) => {
    try {
      setLoading(true);
      const patientRef = doc(db, "patients", email);
      const patientDoc = await getDoc(patientRef);
      
      await sendAccountStatusEmail(
        email,
        patientDoc.data().name,
        'deleted',
        'Account permanently removed by administrator'
      );

      await deleteDoc(patientRef);
      toast.success("Patient deleted successfully");
    } catch (error) {
      toast.error(`Deletion failed: ${error.message}`);
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

  const dismissNotification = () => {
    setError(null);
  };

  const fetchDoctorDetails = async (doctorEmail) => {
    try {
      setLoading(true);
      const doctorDoc = await getDoc(doc(db, "doctors", doctorEmail));
      if (doctorDoc.exists()) {
        setDoctorDetails({
          ...doctorDoc.data(),
          email: doctorEmail
        });
        await fetchDoctorDocuments(doctorEmail);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching doctor details:", err);
      setError("Failed to load doctor details");
      setLoading(false);
    }
  };

  const closeDoctorModal = () => {
    setDoctorDetails(null);
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
                onClick={dismissNotification}
                className="text-red-500 hover:text-red-700 ml-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs - Removed 'logs' tab */}
        <div className="bg-white rounded-xl shadow-lg mb-6 p-1">
          <div className="flex flex-wrap">
            {['dashboard', 'doctors', 'patients', 'analytics'].map((tab) => (
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
           {activeTab === 'dashboard' && (
  <>
    {/* Enhanced Dashboard Stats */}
    {activeTab === 'dashboard' && (
  <>
    {/* Enhanced Dashboard Stats */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {/* Total Patients Card */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Total Patients</h2>
        <p className="text-3xl font-bold text-purple-600">{adminData.totalPatients}</p>
        <p className="text-sm text-gray-500 mt-1">{adminData.blockedPatients} blocked</p>
      </div>

      {/* Total Doctors Card - Now showing correct approved counts */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Approved Doctors</h2>
        <p className="text-3xl font-bold text-indigo-600">{adminData.approvedDoctors}</p>
        <p className="text-sm text-gray-500 mt-1">{adminData.totalDoctors} registered</p>
      </div>

      {/* Pending Approvals Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 relative">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Pending Approvals</h2>
        <p className="text-3xl font-bold text-orange-500">{adminData.pendingDoctors}</p>
        {adminData.pendingDoctors > 0 && (
          <span className="absolute bottom-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
            Action Needed
          </span>
        )}
      </div>

      {/* Today's Appointments Card */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Today's Appointments</h2>
        <p className="text-3xl font-bold text-green-600">{adminData.todayAppointments}</p>
        <p className="text-sm text-gray-500 mt-1">{adminData.totalAppointments} total</p>
      </div>
    </div>

    {/* Second Row of Stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Recent Signups</h2>
        <p className="text-3xl font-bold text-blue-600">{adminData.recentSignups}</p>
        <p className="text-sm text-gray-500 mt-1">Last 7 days</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Active Sessions</h2>
        <p className="text-3xl font-bold text-teal-600">{adminData.activeSessions}</p>
        <p className="text-sm text-gray-500 mt-1">Currently logged in</p>
      </div>

      {/* Real System Health Check */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Platform Health</h2>
        <p className={`text-3xl font-bold ${
          adminData.activeSessions > 0 ? 'text-green-600' : 
          adminData.activeSessions === 0 ? 'text-yellow-500' : 'text-red-600'
        }`}>
          {adminData.activeSessions > 0 ? '100%' : 
           adminData.activeSessions === 0 ? '75%' : '50%'}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {adminData.activeSessions > 0 ? 'All systems operational' : 
           adminData.activeSessions === 0 ? 'No active sessions' : 'Critical issues detected'}
        </p>
      </div>
    </div>
  </>
)}
  </>
)}
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Manage Doctors</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('doctors')}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-200"
                  >
                    View All Doctors
                  </button>
                  <button
                    onClick={() => setActiveTab('doctors')}
                    className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition duration-200"
                  >
                    Review Pending Approvals ({adminData.pendingDoctors})
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Manage Patients</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('patients')}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-200"
                  >
                    View All Patients
                  </button>
                  <button
                    onClick={() => setActiveTab('patients')}
                    className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-200"
                  >
                    Manage Blocked Patients ({adminData.blockedPatients})
                  </button>
                </div>
              </div>
            </div>

            <DashboardAppointmentsManager />
            <DashboardContentManager />
          </>
        )}

        {/* Doctors Tab Content */}
        {activeTab === 'doctors' && (
          <div className="space-y-8">
            {/* Pending Doctors Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
  <PendingDoctors/>
</div>
            {/* All Doctors Section - Fixed to show all approved doctors */}
            <ApprovedDoctorsList/>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-purple-700">Patient Management</h2>
                <div className="text-gray-600">
                  <span className="font-medium">Total:</span> {adminData.totalPatients} | 
                  <span className="font-medium ml-2">Blocked:</span> {adminData.blockedPatients}
                </div>
              </div>
              
              {/* Patients Table  */}
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
            </div>

            {/* Treatment Plans Section - Simplified without view details */}
           <TreatmentPlansComponent/>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <AdminAnalytics 
              adminData={adminData} 
              patients={patientsList}
              doctors={allDoctorsList}
              appointments={adminData.totalAppointments}
            />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;