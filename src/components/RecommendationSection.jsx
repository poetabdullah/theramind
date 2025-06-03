import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from "../firebaseConfig.js";
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

const RecommendationSection = ({ diagnosedSubtype, diagnosedCondition }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [meditations, setMeditations] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState([]);

  // Fetch healing tips and meditations from doc ID
  const fetchHealingData = async () => {
    try {
      const docRef = doc(db, 'healingTips', diagnosedSubtype);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRecommendations(data.tips || []);
        setMeditations(data.meditation || []);
      } else {
        console.warn('No healing tips found for subtype:', diagnosedSubtype);
        setRecommendations([]);
        setMeditations([]);
      }
    } catch (error) {
      console.error('Error fetching healing tips:', error);
    }
  };

  // Fetch doctors by subtype or condition
  const fetchDoctorBySpeciality = async () => {
    try {
      const doctorsRef = collection(db, 'doctors');
      const q = query(
        doctorsRef,
        where('specialties', 'array-contains-any', [diagnosedSubtype, diagnosedCondition])
      );
      const querySnapshot = await getDocs(q);
      let matchedDoctors = querySnapshot.docs.map((doc) => doc.data());

      if (matchedDoctors.length === 0 && diagnosedCondition) {
        const fallbackQuery = query(
          doctorsRef,
          where('specialties', 'array-contains', diagnosedCondition)
        );
        const fallbackSnapshot = await getDocs(fallbackQuery);
        matchedDoctors = fallbackSnapshot.docs.map((doc) => doc.data());
      }

      setDoctorProfile(matchedDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  useEffect(() => {
    if (diagnosedSubtype) {
      fetchDoctorBySpeciality();
      fetchHealingData();
    }
  }, [diagnosedCondition, diagnosedSubtype]);

  return (
    <motion.div
      className="mt-10 mb-16 px-4 max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Recommended Professionals */}
      <motion.h3 className="text-3xl font-bold text-purple-800 mt-2 mb-3 text-center">
        Recommended Professionals
      </motion.h3>
      {doctorProfile.length === 0 ? (
        <motion.p className="text-center text-red-600 text-lg font-medium">
          Sorry, we couldn't find any doctor specializing in your condition at the moment.
        </motion.p>
      ) : (
        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {doctorProfile.map((doctor, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <motion.h4 className="text-xl font-semibold text-purple-700">{doctor.fullName}</motion.h4>
              <motion.p className="text-gray-600">{doctor.specialties?.join(', ')}</motion.p>
            </motion.div>
          ))}
        </motion.div>
      )}

     {/* Self Healing Tips */}
{(recommendations.length > 0 || meditations.length > 0) && (
  <>
    <motion.h3
      className="text-3xl font-bold text-purple-800 mb-4 mt-2 text-center"
      style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)' }}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      Self Healing Tips
    </motion.h3>

    <motion.div
      className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-8 px-2 "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.6 }}
    >
      {recommendations.map((tip, index) => (
        <motion.div
          key={index}
          className="bg-pink p-4 rounded-lg shadow-md border-l-4 border-purple-500 cursor-pointer font-medium transition-all duration-300 ease-in-out"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          whileHover={{
            scale: 1.03,
            backgroundColor: "#fef2f2",
            color: "#9d174d",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
          }}
        >
          {tip}
        </motion.div>
      ))}
    </motion.div>

    {/* Meditation Videos */}
      <motion.h3
        className="text-3xl font-bold text-purple-800 mb-6 mt-8 text-center"
        style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)' }}
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
         Meditational Exercises
      </motion.h3>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-2 px-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
      >
        {meditations.map((video, index) => (
      <motion.div
        key={index}
        className="bg-purple-100 p-4 rounded-xl shadow-md hover:shadow-2xl transition duration-300 ease-in-out cursor-pointer"
        whileHover={{
          scale: 1.03,
          backgroundColor: "#ede9fe",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)"
        }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 * index, duration: 0.5 }}
      >
        <h4 className="text-xl font-semibold text-purple-800 mb-2">{video.title}</h4>
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-pink-600 hover:text-pink-700 hover:underline transition-colors duration-200"
        >
          Watch on YouTube →
        </a>
      </motion.div>
  ))}
</motion.div>

        </>
      )}

    </motion.div>
  );
};

export default RecommendationSection;
