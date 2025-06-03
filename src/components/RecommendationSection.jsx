import {React, useState, useEffect} from 'react';
import {motion} from 'framer-motion';
import {db} from '../firebase';
import {collection, getDocs, doc, getDoc, query, where, getDocs} from 'firebase/firestore';

const RecommendationSection = ({diagnosedSubtype}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState([]);

  const fetchDoctorBySpeciality = async () => {
    try {
      const doctorsRef = collection(db, 'doctors');
      const q = query(doctorsRef, where('specialties', 'array-contains-any', [diagnosedSubtype, diagnosedCondition]));
      const querySnapshot = await getDocs(q);
      const matchedDoctors = querySnapshot.docs.map((doc) => doc.data());
      if (matchedDoctors.length === 0 && diagnosedCondition) {  
        const fallbackQuery = await doctorsRef.where('specialties', 'array-contains', diagnosedCondition);
        const fallbackSnapshot = await getDocs(fallbackQuery);
        matchedDoctors = fallbackSnapshot.docs.map(doc => doc.data());
        setDoctorProfile(matchedDoctors);
      }
    }
      catch (error) {
        console.error("Error fetching doctors:", error);
      } 
    }

    useEffect(() => {
      if (diagnosedSubtype) {
        fetchDoctorBySpeciality();
      }
    }, [diagnosedCondition, diagnosedSubtype]);

    if (doctorProfile.length === 0) {
      return (
        <motion.div
          className="text-center mt-6 text-red-600 text-lg font-medium"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
        >
          Sorry, we couldn't find any doctor specializing in your condition at the moment.
        </motion.div>
      );
    }
  

  return (
    <motion.div
      className="mt-10 mb-16 px-4 max-w-4xl mx-auto"
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
    >
      <motion.h3 className="text-3xl font-bold text-purple-800 mb-6 text-center">Recommended Professional</motion.h3>
      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {doctors.map((doctor, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -20}}
          >
            <div className="flex items-center mb-4"></div>
            <h4 className="text-xl font-semibold text-purple-700">{doctor.name}</h4>
            <p className="text-gray-600">{doctor.specialties.join(', ')}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}