import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebaseConfig";
import { collection, doc, getDoc, addDoc } from "firebase/firestore";
import Footer from "../components/Footer";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { onAuthStateChanged } from "firebase/auth";

const EducationWritePage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const patientDoc = await getDoc(doc(db, "patients", user.email));
        const doctorDoc = await getDoc(doc(db, "doctors", user.email));

        if (doctorDoc.exists()) {
          setUserRole("doctor");
        } else if (patientDoc.exists()) {
          setUserRole("patient");
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not logged in");

      const articleData = {
        title,
        content,
        selectedTags,
        author_name: user.displayName || "Anonymous",
        user_id: user.uid,
        date_time: new Date(),
        last_updated: new Date(),
      };

      const collectionName =
        userRole === "doctor" ? "articles" : "patient_stories";
      await addDoc(collection(db, collectionName), articleData);
      navigate("/education-main");
    } catch (error) {
      console.error("Error submitting:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-2xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-purple-200 to-purple-50 min-h-screen flex flex-col">
      <div className="max-w-3xl mx-auto flex-grow py-12 px-4">
        <h1 className="text-5xl font-bold text-purple-900 mb-8">
          {userRole === "doctor"
            ? "Write an Article"
            : "Write Your Patient Story"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full text-4xl font-semibold text-purple-900 bg-transparent border-b-2 border-gray-400 outline-none focus:ring-0 focus:border-purple-500 placeholder-gray-400"
            required
          />

          <ReactQuill
            value={content}
            onChange={setContent}
            placeholder="Write your content here..."
            className="bg-purple-200 p-4 rounded-md shadow-md text-lg text-purple-900 border border-purple-300"
          />

          <div className="space-y-4">
            <div className="text-lg font-medium text-purple-900">
              Select Tags
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                "Mental Health",
                "Anxiety",
                "Stress",
                "Depression",
                "Wellness",
                "Self-Care",
                "Therapy",
                "Mindfulness",
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    setSelectedTags((prev) =>
                      prev.includes(tag)
                        ? prev.filter((t) => t !== tag)
                        : prev.length < 3
                        ? [...prev, tag]
                        : prev
                    )
                  }
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? "bg-purple-600 text-white"
                      : "bg-purple-300 text-purple-900"
                  } hover:bg-purple-700`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              You can select up to 3 tags.
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/education-main")}
              className="bg-purple-300 text-purple-900 py-3 px-6 rounded-lg hover:bg-purple-400 transition duration-300 text-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`py-3 px-8 rounded-lg transition duration-300 text-lg ${
                isSubmitting
                  ? "opacity-50 cursor-not-allowed bg-purple-400"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Publish"}
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default EducationWritePage;
