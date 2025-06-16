import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import Modal from 'react-modal';

// Modal styles
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflow: 'auto',
    borderRadius: '12px',
    padding: '0',
    border: 'none',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000
  }
};

Modal.setAppElement('#root');

const ViewDoctorDetails = ({ doctorEmail, onClose }) => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, "doctors", doctorEmail);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Format the appliedAt date if it exists
          const formattedData = {
            ...data,
            appliedAt: data.appliedAt?.toDate ? data.appliedAt.toDate().toLocaleDateString() : 'N/A'
          };
          setDoctor(formattedData);
        } else {
          setError('No such doctor found!');
        }
      } catch (err) {
        console.error('Error fetching doctor details:', err);
        setError('Failed to fetch doctor details');
      } finally {
        setLoading(false);
      }
    };

    if (doctorEmail) {
      fetchDoctorDetails();
    }
  }, [doctorEmail]);

  const renderEducation = (education) => {
    if (!education || education.length === 0) return <p>No education information available</p>;
    
    return (
      <div className="space-y-4">
        {education.map((edu, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Degree</p>
                <p className="text-gray-900">{edu.degree || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Institute</p>
                <p className="text-gray-900">{edu.institute || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Graduation Date</p>
                <p className="text-gray-900">{edu.gradDate || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Proof</p>
                {edu.proof ? (
                  <a 
                    href={edu.proof} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Document
                  </a>
                ) : (
                  <p className="text-gray-900">N/A</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Modal
      isOpen={!!doctorEmail}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel="Doctor Details"
    >
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading doctor details...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-4 text-gray-600">{error}</p>
          <button
            onClick={onClose}
            className="mt-4 bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700 transition duration-200"
          >
            Close
          </button>
        </div>
      ) : doctor ? (
        <div>
          <div className="bg-purple-600 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{doctor.name}</h2>
                <p className="text-purple-100">{doctor.email}</p>
                <p className="text-purple-100">{doctor.phone}</p>
              </div>
              <button
                onClick={onClose}
                className="text-purple-200 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Specialty</p>
                <p className="text-gray-900">{doctor.specialty || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Experience</p>
                <p className="text-gray-900">{doctor.experience || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Applied On</p>
                <p className="text-gray-900">{doctor.appliedAt || 'N/A'}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Education</h3>
              {renderEducation(doctor.education)}
            </div>

            {doctor.healingTips && doctor.healingTips.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Healing Tips</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {doctor.healingTips.map((tip, index) => (
                    <li key={index} className="text-gray-700">{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {doctor.patientStories && doctor.patientStories.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Stories</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {doctor.patientStories.map((story, index) => (
                    <li key={index} className="text-gray-700">{story}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default ViewDoctorDetails;