// nice save
import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import ListViewCard from "../components/ListViewCard";
import PatientDetailForm from "../components/PatientDetailForm";
import HealthHistoryForm from "../components/HealthHistoryForm";
import { useNavigate } from "react-router-dom";

const PatientDashboard = () => {
  const [user, setUser] = useState(null);
  const [patientStories, setPatientStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
        fetchPatientData(authUser.email);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchPatientData = async (email) => {
    try {
      const q = query(collection(db, "patients"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        setPatientData({ id: querySnapshot.docs[0].id, ...docData });
        fetchPatientStories(email);
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
  };

  const fetchPatientStories = async (email) => {
    try {
      const q = query(
        collection(db, "patient_stories"),
        where("author_email", "==", email)
      );
      const querySnapshot = await getDocs(q);
      const stories = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPatientStories(stories);
    } catch (err) {
      console.error("Error fetching patient stories:", err);
      setError("Failed to load patient stories.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (updatedData) => {
    try {
      const patientRef = doc(db, "patients", patientData.id);
      await updateDoc(patientRef, updatedData);
      setIsEditing(false);
      fetchPatientData(user.email);
    } catch (error) {
      console.error("Error updating patient data:", error);
    }
  };

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-purple-700 mb-4">
          Hi, {patientData?.fullName || "User"}
        </h1>
        {isEditing ? (
          step === 1 ? (
            <PatientDetailForm
              patientData={patientData}
              disableFields={["dateOfBirth", "gender"]}
              onContinue={() => setStep(2)}
            />
          ) : (
            <HealthHistoryForm
              patientData={patientData}
              onSubmit={handleSubmit}
              onBack={() => setStep(1)}
            />
          )
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto mt-6 bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-purple-700">
            Your Patient Stories
          </h2>
          <button
            onClick={() => navigate("/write-education")}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600"
          >
            Write a Story
          </button>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : patientStories.length === 0 ? (
          <div className="text-gray-500">
            You have not shared any patient stories yet.
          </div>
        ) : (
          <div className="space-y-6">
            {patientStories.map((story) => (
              <ListViewCard
                key={story.id}
                title={story.title}
                content={story.content || "No content available"}
                author={story.author_name}
                date={new Date(story.date_time).toLocaleDateString()}
                tags={story.selectedTags || []}
                link={`/stories/${story.id}`}
                titleColor="text-purple-700"
                tagColor="bg-orange-200 text-orange-700"
                borderColor="border-orange-500"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
