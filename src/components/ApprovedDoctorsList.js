import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const ApprovedDoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const q = query(
          collection(db, 'doctors'),
          where('STATUS', '==', 'approved') 
        );
        const snapshot = await getDocs(q);
        
        const doctorsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          name: doc.data().fullName || doc.data().name || 'N/A',
          email: doc.data().email || 'N/A',
          phone: doc.data().contact || doc.data().phone || 'N/A',
          expertise: doc.data().expertise || 'Not specified',
          location: doc.data().location || 'N/A'
        }));

        setDoctors(doctorsData);
      } catch (error) {
        console.error("Failed to load doctors:", error);
        toast.error("Failed to load doctors data");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleBlockDoctor = async (doctorId) => {
    if (window.confirm("Are you sure you want to block this doctor?")) {
      try {
        setProcessing(true);
        await updateDoc(doc(db, 'doctors', doctorId), {
          STATUS: 'blocked'
        });
        toast.success("Doctor blocked successfully");
        setDoctors(doctors.filter(doctor => doctor.id !== doctorId));
      } catch (error) {
        console.error("Error blocking doctor:", error);
        toast.error("Failed to block doctor");
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (window.confirm("Are you sure you want to permanently delete this doctor?")) {
      try {
        setProcessing(true);
        await deleteDoc(doc(db, 'doctors', doctorId));
        toast.success("Doctor deleted successfully");
        setDoctors(doctors.filter(doctor => doctor.id !== doctorId));
      } catch (error) {
        console.error("Error deleting doctor:", error);
        toast.error("Failed to delete doctor");
      } finally {
        setProcessing(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-purple-700 mb-6">Approved Doctors</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-purple-700 mb-6">Approved Doctors ({doctors.length})</h2>
      
      {doctors.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 mt-2">No approved doctors found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expertise</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {doctors.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                    <div className="text-sm text-gray-500">{doctor.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doctor.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {doctor.expertise}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {doctor.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleBlockDoctor(doctor.id)}
                        className="text-yellow-600 hover:text-yellow-900"
                        disabled={processing}
                      >
                        Block
                      </button>
                      <button
                        onClick={() => handleDeleteDoctor(doctor.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={processing}
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
      )}
    </div>
  );
};

export default ApprovedDoctorsList;