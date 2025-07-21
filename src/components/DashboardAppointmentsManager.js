import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { toast } from 'react-toastify';

const DashboardAppointmentsManager = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "appointments"));
      const appointmentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate()
      }));

      setAppointments(appointmentsData);
    } catch (error) {
      toast.error("Failed to fetch appointments: " + error.message);
    }
    setLoading(false);
  };

  const formatTimeslot = (timeslot) => {
    if (!timeslot) return 'Not specified';
    
    // Handle both Firestore timestamp and string formats
    let date;
    if (timeslot.toDate && typeof timeslot.toDate === 'function') {
      // Firestore timestamp
      date = timeslot.toDate();
    } else if (typeof timeslot === 'string') {
      // String format like "2025-07-30T10:00:00.000Z"
      date = new Date(timeslot);
    } else if (timeslot instanceof Date) {
      // Already a Date object
      date = timeslot;
    } else {
      return 'Invalid date';
    }

    // Format to readable format: "July 30, 2025 at 10:00 AM"
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) + ' at ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-purple-700">Appointments Management</h3>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-8 bg-gray-100 rounded-lg">
          <p>No appointments found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeslot</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meet Link</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map(appointment => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium">{appointment.patientName}</p>
                      <p className="text-sm text-gray-500">{appointment.patientEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium">{appointment.doctorName}</p>
                      <p className="text-sm text-gray-500">{appointment.doctorEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatTimeslot(appointment.timeslot)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    
              {appointment.meetLink} 
                     
                    
                    
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

export default DashboardAppointmentsManager;