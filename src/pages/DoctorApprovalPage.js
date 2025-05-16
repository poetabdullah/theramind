// DoctorApprovalPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { db } from "../firebaseConfig";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import Footer from "../components/Footer";

const DoctorApprovalPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    // Check if user is logged in and is admin
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }

    const checkAdminAndLoadDoctors = async () => {
      try {
        // Check if the current user is in the admin collection
        const adminDoc = await getDocs(collection(db, "admin"));
        const isAdmin = adminDoc.docs.some(doc => doc.id === user.email);
        
        if (!isAdmin) {
          setError("You don't have administrator access");
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }

        // Fetch all doctors
        await fetchDoctors();
        setLoading(false);
      } catch (err) {
        console.error("Error checking admin status:", err);
        setError("Failed to verify administrator access");
      }
    };

    checkAdminAndLoadDoctors();
  }, [navigate]);

  const fetchDoctors = async () => {
    try {
      const doctorsSnapshot = await getDocs(collection(db, "doctors"));
      const doctorsList = doctorsSnapshot.docs.map(doc => ({
        id: doc.id,
        email: doc.id, // Since you're using email as the ID
        ...doc.data()
      }));
      setDoctors(doctorsList);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setError("Failed to load doctors data");
    }
  };

  const handleStatusChange = async (doctorEmail, newStatus) => {
    try {
      await updateDoc(doc(db, "doctors", doctorEmail), {
        status: newStatus,
        statusUpdatedAt: new Date()
      });
      
      // Update local state
      setDoctors(doctors.map(doctor => 
        doctor.email === doctorEmail 
          ? {...doctor, status: newStatus}
          : doctor
      ));
      
      setSelectedDoctor(null);
    } catch (err) {
      console.error("Error updating doctor status:", err);
      setError(`Failed to update status for ${doctorEmail}`);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/admin-dashboard');
  };

  const dismissError = () => {
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 via-indigo-500 to-orange-600">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin h-12 w-12 mx-auto mb-4 border-4 border-purple-600 border-t-transparent rounded-full"></div>
          <p className="text-gray-600">Loading doctors data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-indigo-500 to-orange-600">
      {/* Header */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-purple-700">TheraMind Admin</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleBackToDashboard}
                className="mr-4 text-purple-600 hover:text-purple-800 font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
            <div className="flex items-start">
              <div className="flex-grow">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={dismissError}
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

        {/* Doctor Management */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-purple-700 mb-4">Doctor Applications</h2>
          
          {/* Filter Tabs */}
          <div className="flex mb-6 border-b">
            <button 
              className={`py-2 px-4 font-medium ${!selectedDoctor ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setSelectedDoctor(null)}
            >
              All Doctors
            </button>
            <button 
              className={`py-2 px-4 font-medium ${selectedDoctor ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => {
                const pending = doctors.find(d => d.status === 'pending');
                if (pending) setSelectedDoctor(pending);
              }}
            >
              Pending Applications ({doctors.filter(d => d.status === 'pending').length})
            </button>
          </div>
          
          {/* Doctor List */}
          {!selectedDoctor ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left text-gray-600 font-medium">Name</th>
                    <th className="py-3 px-4 text-left text-gray-600 font-medium">Email</th>
                    <th className="py-3 px-4 text-left text-gray-600 font-medium">Specialty</th>
                    <th className="py-3 px-4 text-left text-gray-600 font-medium">Status</th>
                    <th className="py-3 px-4 text-left text-gray-600 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {doctors.length > 0 ? (
                    doctors.map((doctor) => (
                      <tr key={doctor.email} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-800">{doctor.firstName} {doctor.lastName}</td>
                        <td className="py-3 px-4 text-gray-800">{doctor.email}</td>
                        <td className="py-3 px-4 text-gray-800">{doctor.specialty || 'Not specified'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium
                            ${doctor.status === 'approved' ? 'bg-green-100 text-green-800' : 
                              doctor.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {doctor.status || 'pending'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button 
                            className="text-purple-600 hover:text-purple-800 font-medium"
                            onClick={() => setSelectedDoctor(doctor)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-4 px-4 text-center text-gray-500">No doctors found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            // Doctor Details View
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Doctor Details</h3>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setSelectedDoctor(null)}
                >
                  &times; Close
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-800">{selectedDoctor.firstName} {selectedDoctor.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-800">{selectedDoctor.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Specialty</p>
                  <p className="font-medium text-gray-800">{selectedDoctor.specialty || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${selectedDoctor.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        selectedDoctor.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {selectedDoctor.status || 'pending'}
                    </span>
                  </p>
                </div>
                {selectedDoctor.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-800">{selectedDoctor.phone}</p>
                  </div>
                )}
                {selectedDoctor.licenseNumber && (
                  <div>
                    <p className="text-sm text-gray-500">License Number</p>
                    <p className="font-medium text-gray-800">{selectedDoctor.licenseNumber}</p>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              {selectedDoctor.status === 'pending' && (
                <div className="flex space-x-4">
                  <button 
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                    onClick={() => handleStatusChange(selectedDoctor.email, 'approved')}
                  >
                    Approve Application
                  </button>
                  <button 
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                    onClick={() => handleStatusChange(selectedDoctor.email, 'rejected')}
                  >
                    Reject Application
                  </button>
                </div>
              )}
              
              {selectedDoctor.status === 'approved' && (
                <button 
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                  onClick={() => handleStatusChange(selectedDoctor.email, 'pending')}
                >
                  Set Back to Pending
                </button>
              )}
              
              {selectedDoctor.status === 'rejected' && (
                <button 
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                  onClick={() => handleStatusChange(selectedDoctor.email, 'approved')}
                >
                  Approve Application
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default DoctorApprovalPage;