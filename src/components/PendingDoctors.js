import { db, storage } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const PendingDoctors = () => {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [degreeModalOpen, setDegreeModalOpen] = useState(false);
  const [currentDegreeUrl, setCurrentDegreeUrl] = useState('');
  const [currentDoctor, setCurrentDoctor] = useState(null);

  useEffect(() => {
    const fetchPendingDoctors = async () => {
      try {
        const q = query(
          collection(db, 'doctors'),
          where('STATUS', '==', 'pending')
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

        setPendingDoctors(doctorsData);
      } catch (error) {
        console.error("Failed to load pending doctors:", error);
        toast.error("Failed to load pending doctors data");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingDoctors();
  }, []);

  const handleViewDegree = async (doctor) => {
    try {
      setProcessing(true);
      setCurrentDoctor(doctor);
      
      // Try to get degree URL from Firestore education data first
      if (doctor.education && doctor.education.length > 0 && doctor.education[0].proof) {
        setCurrentDegreeUrl(doctor.education[0].proof);
        setDegreeModalOpen(true);
        return;
      }

      // If not found in Firestore, try to construct storage URL directly
      try {
        // Example path: /doctors/drruqiabajwa.theramind@gmail.com
        const basePath = `doctors/${doctor.email}`;
        const degreeRef = ref(storage, `${basePath}/degree.pdf`);
        const url = await getDownloadURL(degreeRef);
        setCurrentDegreeUrl(url);
        setDegreeModalOpen(true);
      } catch (storageError) {
        console.log("No degree file found in storage");
        toast.info("No degree document found for this doctor");
      }
    } catch (error) {
      console.error("Error fetching degree:", error);
      toast.error("Failed to load degree document");
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveDoctor = async (doctorId) => {
    if (window.confirm("Are you sure you want to approve this doctor?")) {
      try {
        setProcessing(true);
        await updateDoc(doc(db, 'doctors', doctorId), {
          STATUS: 'approved'
        });
        toast.success("Doctor approved successfully");
        setPendingDoctors(pendingDoctors.filter(doctor => doctor.id !== doctorId));
      } catch (error) {
        console.error("Error approving doctor:", error);
        toast.error("Failed to approve doctor");
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleRejectDoctor = async (doctorId) => {
    if (window.confirm("Are you sure you want to reject this doctor?")) {
      try {
        setProcessing(true);
        await updateDoc(doc(db, 'doctors', doctorId), {
          STATUS: 'rejected'
        });
        toast.success("Doctor rejected successfully");
        setPendingDoctors(pendingDoctors.filter(doctor => doctor.id !== doctorId));
      } catch (error) {
        console.error("Error rejecting doctor:", error);
        toast.error("Failed to reject doctor");
      } finally {
        setProcessing(false);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading pending doctors...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-purple-700 mb-6">Pending Doctors ({pendingDoctors.length})</h2>
      
      {pendingDoctors.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">No pending doctors found</p>
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
              {pendingDoctors.map((doctor) => (
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
                        onClick={() => handleViewDegree(doctor)}
                        className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded border border-blue-600 hover:bg-blue-50"
                        disabled={processing}
                      >
                        View Degree
                      </button>
                      <button
                        onClick={() => handleApproveDoctor(doctor.id)}
                        className="text-green-600 hover:text-green-900 px-3 py-1 rounded border border-green-600 hover:bg-green-50"
                        disabled={processing}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectDoctor(doctor.id)}
                        className="text-red-600 hover:text-red-900 px-3 py-1 rounded border border-red-600 hover:bg-red-50"
                        disabled={processing}
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

      <Modal
        isOpen={degreeModalOpen}
        onRequestClose={() => setDegreeModalOpen(false)}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="bg-white p-6 rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              Degree Document for {currentDoctor?.name}
            </h3>
            <button 
              onClick={() => setDegreeModalOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>
          
          {currentDegreeUrl ? (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-center">
                <iframe 
                  src={currentDegreeUrl} 
                  className="w-full h-[70vh] border border-gray-200"
                  title="Degree Document"
                  allow="fullscreen"
                />
              </div>
              <div className="mt-4 text-center">
                <a 
                  href={currentDegreeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-block px-4 py-2 border border-blue-600 rounded hover:bg-blue-50"
                >
                  Open in New Tab
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No degree document found</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PendingDoctors;