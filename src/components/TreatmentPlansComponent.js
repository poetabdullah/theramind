import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const TreatmentPlansComponent = () => {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const fetchPlans = async () => {
      const snapshot = await getDocs(collection(db, 'treatment_plans'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlans(data);
    };
    fetchPlans();
  }, []);

  return (
    <div className="mt-4 bg-white p-6 shadow rounded">
      <h3 className="text-lg font-bold mb-4">All Treatment Plans</h3>
      <ul className="space-y-3">
        {plans.map(plan => (
          <li key={plan.id} className="border p-3 rounded">
            <p><strong>Plan ID:</strong> {plan.id}</p>
            <p><strong>Doctor:</strong> {plan.doctor_name}</p>
            <p><strong>Patient:</strong> {plan.patient_email}</p>
            <p><strong>Goals:</strong> {plan.goals?.length || 0}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TreatmentPlansComponent;