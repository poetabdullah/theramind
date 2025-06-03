import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from "../firebaseConfig.js";
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import ListViewCard from './ListViewCard.js';

const RecommendationSection = ({ diagnosedSubtype, diagnosedCondition }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [meditations, setMeditations] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState([]);
  const [doctorRelatedArticles, setDoctorRelatedArticles] = useState([]);
  const [patientStories, setPatientStories] = useState([]);

  //Fetch Healing Tips & Meditational Links From Firestore
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
  const fetchDoctorsBySubtype = async (subtype) => {
    if (!subtype) {
      console.error("Subtype is undefined or empty.");
      return;
    }

      const q = query(
        collection(db, "doctors"),
        where("subtypeTags", "array-contains", subtype),
        where("status", "==", "approved")
      );
      const querySnapshot = await getDocs(q);
      const doctors = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("Matched doctors by subtype:", doctors);
      setDoctorProfile(doctors);

    };

  const fetchArticlesBySubtype = async (diagnosedSubtype) => {
  try {
    const q = query(
      collection(db, "articles"),
      where("selectedTags", "array-contains", diagnosedSubtype)
    );

    const querySnapshot = await getDocs(q);

    const articles = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setDoctorRelatedArticles(articles);
  } 
     catch (error) {
      console.error("Error fetching articles by specialties:", error);
      setDoctorRelatedArticles([]);
    }
  };

  const fetchPatientStoriesBySubtype = async (diagnosedSubtype) => {
  try {
    const q = query(
      collection(db, "patient_stories"),
      where("selectedTags", "array-contains", diagnosedSubtype)
    );

    const querySnapshot = await getDocs(q);

    const patient_stories = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setPatientStories(patient_stories);
  } 
     catch (error) {
      console.error("Error fetching articles by specialties:", error);
      setPatientStories([]);
    }
  };

  useEffect(() => {
    if (diagnosedSubtype) {
      fetchDoctorsBySubtype(diagnosedSubtype);
      fetchHealingData();
      fetchArticlesBySubtype(diagnosedSubtype);
      fetchPatientStoriesBySubtype(diagnosedSubtype);
    }
  }, [diagnosedSubtype]);

  return (
    <motion.div
      className="mt-10 mb-16 px-4 max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Recommended Professionals */}
      <motion.h3
        className="text-3xl font-bold text-purple-800 mt-2 mb-4 text-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        Recommended Professionals
      </motion.h3>
      {doctorProfile.length === 0 ? (
        <motion.p
          className="text-center text-red-600 text-lg font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Sorry, we couldn't find any doctor specializing in your condition at the moment.
        </motion.p>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
        >
          {doctorProfile.map((doctor, index) => (
            <motion.div
              key={index}
              className="bg-gradient-to-r from-purple-200 to-fuchsia-200 rounded-lg shadow-md p-6 cursor-pointer font-medium transition-shadow duration-300 hover:shadow-xl"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{
                scale: 1.03,
                backgroundImage: "linear-gradient(to right, #c4b5fd, #fbcfe8)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.h4
                className="text-2xl font-bold text-purple-700"
                initial={{ scale: 1, color: "#6b21a8" }}
                whileHover={{ scale: 1.05, color: "#db2777" }}
                transition={{ duration: 0.3 }}
              >
                {doctor.fullName}
              </motion.h4>
              <motion.h4
                className="text-xl font-semibold text-pink-700"
                initial={{ scale: 1, color: "#be185d" }}
                whileHover={{ scale: 1.05, color: "#f43f5e" }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                Speciality
              </motion.h4>
              <motion.p
                className="text-pink-600"
                initial={{ scale: 1, color: "#ec4899" }}
                whileHover={{ scale: 1.02, color: "#f472b6" }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {doctor.specialties?.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}
              </motion.p>
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
            className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-3 px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {recommendations.map((tip, index) => (
              <motion.h3
                key={index}
                className="text-pink-500 text-xl p-4 rounded-lg shadow-md border-l-4 border-purple-500 cursor-pointer font-medium transition-all duration-300 ease-in-out"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{
                  scale: 1.03,
                  backgroundColor: "#ffe4e6",
                  color: "#db2777",
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
                }}
              >
                {tip}
              </motion.h3>
            ))}
          </motion.div>

          {/* Meditation Videos */}
          <motion.h3
            className="text-3xl font-bold text-purple-800 mb-6 mt-2 text-center"
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

          {/* Doctor Related Articles */}
          {doctorRelatedArticles.length > 0 && (
            <>
              <motion.h3
                className="text-3xl font-bold text-purple-800 mt-10 mb-6 text-center"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                Articles Recommended by Your Professionals
              </motion.h3>

              <motion.div
                className="flex flex-col space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                {doctorRelatedArticles.map((article) => (
                  <ListViewCard
                    key={article.id}
                    id={article.id}
                    title={article.title}
                    author={article.author || "Unknown"}
                    date={article.date}
                    tags={article.selectedTags}
                    content={article.content}
                    link={article.link}
                    type="article"
                  />
                ))}
              </motion.div>
            </>
          )}

          {/* Subtype Related Patient Stories */}
          {patientStories.length > 0 && (
            <>
              <motion.h3
                className="text-3xl font-bold text-purple-800 mt-10 mb-6 text-center"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                Patient Stories From People Like You
              </motion.h3>

              <motion.div
                className="flex flex-col space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                {patientStories.map((patient_stories) => (
                  <ListViewCard
                    key={patient_stories.id}
                    id={patient_stories.id}
                    title={patient_stories.title}
                    author={patient_stories.author || "Unknown"}
                    date={patient_stories.date}
                    tags={patient_stories.selectedTags}
                    content={patient_stories.content}
                    link={patient_stories.link}
                    type="patient_stories"
                  />
                ))}
              </motion.div>
            </>
          )}
        </>
      )}
    </motion.div>
  );
};
export default RecommendationSection;
