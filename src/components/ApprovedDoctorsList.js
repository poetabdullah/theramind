import { db , functions} from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';

const ApprovedDoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const q = query(
          collection(db, 'doctors'),
          where('STATUS', '==', 'approved') 
        );
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          console.log('No approved doctors found');
        }

        setDoctors(snapshot.docs.map(doc => ({
          contact: doc.contact,
          name: doc.data().fullname,
          location: doc.data().location,
          education: doc.data().education,
           dob: doc.data().dob,
           email: doc.data().email
        })));
      } catch (error) {
        console.error("Failed to load doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) return <div>Loading doctors...</div>;

  return (
    <div className="doctors-container">
      <h2>Approved Doctors ({doctors.length})</h2>
      {doctors.length > 0 ? (
        <div className="doctor-cards">
          {doctors.map(doctor => (
            <div key={doctor.id} className="doctor-card">
              <h3>{doctor.name}</h3>
              <p>{doctor.specialty}</p>
              <p>{doctor.email}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No approved doctors found. Check your database or filters.</p>
      )}
    </div>
  );
};

export default ApprovedDoctorsList;