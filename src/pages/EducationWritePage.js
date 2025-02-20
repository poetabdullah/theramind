import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebaseConfig"; // Firestore setup
import { collection, doc, setDoc, getDoc, addDoc } from "firebase/firestore";
import Footer from "../components/Footer";

const EducationWritePage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRole, setUserRole] = useState(null); // "doctor" or "patient"

  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const loggedInUserDoc = await getDoc(
        doc(db, "logged_in_users", user.uid)
      );
      if (loggedInUserDoc.exists()) {
        const userData = loggedInUserDoc.data();
        setUserRole(userData.role === "doctor" ? "doctor" : "patient");
      }
    };

    fetchUserRole();
  }, []);

  const handleTitleChange = (e) => setTitle(e.target.value);

  const handleContentChange = (e) => {
    const paragraphs = e.target.value
      .split(/\n+/)
      .filter((para) => para.trim() !== "");
    setContent(paragraphs);
  };

  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

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

      navigate(`/${collectionName}`);
    } catch (error) {
      console.error("Error submitting:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/articles");
  };

  return (
    <div className="bg-gradient-to-b from-purple-100 to-white min-h-screen flex flex-col">
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
            onChange={handleTitleChange}
            placeholder="Title"
            className="w-full text-4xl font-semibold text-purple-900 bg-transparent border-b-2 border-gray-400 outline-none focus:ring-0 focus:border-purple-500 placeholder-gray-400"
            required
          />

          <textarea
            value={content.join("\n")}
            onChange={handleContentChange}
            placeholder="Write your content here..."
            rows="15"
            className="w-full text-lg text-gray-800 bg-transparent border-b-2 border-gray-400 outline-none focus:ring-0 focus:border-purple-500 placeholder-gray-400"
            required
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
                  onClick={() => handleTagToggle(tag)}
                  className={`${
                    selectedTags.includes(tag)
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-purple-900"
                  } px-4 py-2 rounded-full text-sm hover:bg-purple-500 transition-colors`}
                  disabled={
                    selectedTags.length >= 3 && !selectedTags.includes(tag)
                  }
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
              onClick={handleCancel}
              className="text-lg text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${
                isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : "bg-orange-500 text-white"
              } py-3 px-8 rounded-lg hover:bg-orange-600 transition duration-300 text-lg`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Publish"}
            </button>
          </div>
        </form>
      </div>

      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
};

export default EducationWritePage;
