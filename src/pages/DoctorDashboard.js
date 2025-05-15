import React, { useState, useEffect } from 'react';
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import DoctorInfoCard from '../components/DoctorInfoCard';
import DoctorEducationCard from '../components/DoctorEducationCard';
import DoctorExperienceCard from '../components/DoctorExperienceCard';
import DoctorBioCard from '../components/DoctorBioCard';

// Main Dashboard Component
const DoctorDashboard = () => {
    const [doctorData, setDoctorData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingSection, setEditingSection] = useState(null);
    const navigate = useNavigate();

    // Handle logout - Modified to redirect immediately
    const handleLogout = () => {
        // Navigate to login page immediately when logout is pressed
        navigate("/login");

        // Perform the actual logout operation in the background
        signOut(auth).catch((error) => {
            console.error("Error signing out: ", error);
        });
    };

    // Fetch doctor data
    useEffect(() => {
        const fetchDoctorData = async () => {
            try {
                const user = auth.currentUser;

                if (!user) {
                    setError("User not authenticated");
                    setLoading(false);
                    navigate("/login");
                    return;
                }

                const doctorRef = doc(db, "doctors", user.email);
                const docSnap = await getDoc(doctorRef);

                if (docSnap.exists()) {
                    setDoctorData(docSnap.data());
                } else {
                    setError("No doctor data found");
                }
            } catch (err) {
                console.error("Error fetching doctor data:", err);
                setError("Failed to load doctor data");
            } finally {
                setLoading(false);
            }
        };

        fetchDoctorData();
    }, [navigate]);

    // Handle save for different sections
    const handleSave = async (section, updatedData) => {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("User not authenticated");

            const doctorRef = doc(db, "doctors", user.email);

            // Update only the specific section in Firestore
            let updateObj = {};

            switch (section) {
                case "personal":
                    updateObj = {
                        location: updatedData.location,
                        contact: updatedData.contact
                    };
                    break;
                case "education":
                    updateObj = { education: updatedData.education };
                    break;
                case "experiences":
                    updateObj = { experiences: updatedData.experiences };
                    break;
                case "bio":
                    updateObj = { bio: updatedData.bio };
                    break;
                default:
                    break;
            }

            await updateDoc(doctorRef, updateObj);

        } catch (error) {
            console.error("Error saving data:", error);
            alert("Failed to save changes. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-100 to-orange-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-orange-800 font-medium">Loading doctor data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-100 to-orange-50">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-700 mb-6">{error}</p>
                    <button
                        onClick={() => navigate("/login")}
                        className="w-full py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-r from-orange-100 to-orange-50">
            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {/* Greeting Section - Now inside the main container */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-yellow-600 bg-clip-text text-transparent">
                        Hi, {doctorData?.fullName || "Doctor"}
                    </h1>
                </div>

                {doctorData && (
                    <>
                        <DoctorInfoCard
                            doctorData={doctorData}
                            setDoctorData={setDoctorData}
                            isEditing={editingSection === "personal"}
                            setIsEditing={(editing) => setEditingSection(editing ? "personal" : null)}
                            handleSave={handleSave}
                        />

                        <DoctorEducationCard
                            doctorData={doctorData}
                            setDoctorData={setDoctorData}
                            isEditing={editingSection === "education"}
                            setIsEditing={(editing) => setEditingSection(editing ? "education" : null)}
                            handleSave={handleSave}
                        />

                        <DoctorExperienceCard
                            doctorData={doctorData}
                            setDoctorData={setDoctorData}
                            isEditing={editingSection === "experience"}
                            setIsEditing={(editing) => setEditingSection(editing ? "experience" : null)}
                            handleSave={handleSave}
                        />

                        <DoctorBioCard
                            doctorData={doctorData}
                            setDoctorData={setDoctorData}
                            isEditing={editingSection === "bio"}
                            setIsEditing={(editing) => setEditingSection(editing ? "bio" : null)}
                            handleSave={handleSave}
                        />
                    </>
                )}
            </main>
        </div>
    );
};

export default DoctorDashboard;