import React, { useState, useEffect } from 'react';
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import DoctorInfoCard from '../components/DoctorInfoCard';
import DoctorEducationCard from '../components/DoctorEducationCard';
import DoctorExperienceCard from '../components/DoctorExperienceCard';
import DoctorBioCard from '../components/DoctorBioCard';
import ListViewCard from '../components/ListViewCard';

// Main Dashboard Component
const DoctorDashboard = () => {
    const [doctorData, setDoctorData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingSection, setEditingSection] = useState(null);
    const [articles, setArticles] = useState([]);
    const [loadingArticles, setLoadingArticles] = useState(true);
    const [articlesError, setArticlesError] = useState(null);
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

    // Fetch doctor's articles
    const fetchArticles = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            setLoadingArticles(true);

            // Query articles collection for documents authored by the current user
            const articlesRef = collection(db, "articles");
            const articlesQuery = query(articlesRef, where("author_email", "==", user.email));
            const querySnapshot = await getDocs(articlesQuery);

            const articlesList = [];
            querySnapshot.forEach((doc) => {
                articlesList.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Sort articles by creation date (newest first)
            articlesList.sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            });

            setArticles(articlesList);
            setArticlesError(null);
        } catch (err) {
            console.error("Error fetching articles:", err);
            setArticlesError("Failed to load your articles");
        } finally {
            setLoadingArticles(false);
        }
    };

    // Call fetchArticles on component mount and after auth state changes
    useEffect(() => {
        if (auth.currentUser) {
            fetchArticles();
        }
    }, []);

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

            // Refresh articles after update
            fetchArticles();

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

                        {/* Articles Section - Added mt-12 for more margin from previous card */}
                        <div className="mt-12 mb-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold bg-gradient-to-r from-orange-500 to-yellow-600 bg-clip-text text-transparent">
                                    Your Medical Articles
                                </h2>
                                <button
                                    onClick={() => navigate("/write-education")}
                                    className="px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-500  text-white rounded-lg shadow hover:from-orange-500 hover:to-orange-600 transition"
                                >
                                    Write an Article
                                </button>
                            </div>

                            {loadingArticles ? (
                                <div className="py-8 text-center text-gray-500">
                                    Loading your articles...
                                </div>
                            ) : articlesError ? (
                                <div className="py-8 text-center text-red-500">{articlesError}</div>
                            ) : articles.length === 0 ? (
                                <div className="py-8 text-center text-gray-500 bg-white rounded-2xl border border-orange-100 shadow">
                                    You have not published any medical articles yet.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {articles.map((article) => (
                                        <ListViewCard
                                            key={article.id}
                                            id={article.id}
                                            title={article.title}
                                            content={article.content || "No content available"}
                                            author={article.author || doctorData.fullName}
                                            date={
                                                article.createdAt && article.createdAt.seconds
                                                    ? new Date(article.createdAt.seconds * 1000).toLocaleDateString()
                                                    : "No date available"
                                            }
                                            tags={article.tags || []}
                                            link={`/articles/${article.id}`}
                                            type="article"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default DoctorDashboard;