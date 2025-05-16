import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db, auth } from "../firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  getDocs,
} from "firebase/firestore";
import Footer from "../components/Footer";
import ReactQuill from "react-quill"; // React Quill to process the written content styling
import "react-quill/dist/quill.snow.css";
import { onAuthStateChanged } from "firebase/auth";

const EducationWritePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.state?.isEditing || false;
  const docId = location.state?.id || null;
  const type = location.state?.type || "";  // now "articles" or "patient_stories"

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [tags, setTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [authorEmail, setAuthorEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      setAuthorEmail(user.email);

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

  // Fetches all of the available tags that can be selected
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tagsCollection = collection(db, "tags");
        const tagDocs = await getDocs(tagsCollection);
        const fetchedTags = tagDocs.docs.map((doc) => doc.data().tag_name);
        setTags(fetchedTags);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    fetchTags();
  }, []);

  // Fetches the article / story data if in editing mode
  useEffect(() => {
    const fetchDocumentData = async () => {
      if (isEditing && docId) {
        try {
          const collectionName = type;  // exactly "articles" or "patient_stories"
          const docRef = doc(db, collectionName, docId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Fetched Data:", data); // Debugging Log
            setTitle(data.title || "");
            setContent(data.content || "");
            setSelectedTags(data.selectedTags || []);
          } else {
            console.error("Document not found.");
          }
        } catch (error) {
          console.error("Error fetching document:", error);
        }
      }
    };

    fetchDocumentData();
  }, [isEditing, docId, type]);

  // Can select up to 5 tags
  const handleTagClick = (tag) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag) // Remove tag if already selected
        : prevTags.length < 5
          ? [...prevTags, tag] // Add tag if limit is not reached
          : prevTags
    );
  };

  // Checks the error conditions for the docs
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (title.length < 10 || title.length > 100) {
      setError("Title must be between 10 and 100 characters.");
      setIsSubmitting(false);
      return;
    }

    if (
      content.replace(/<[^>]*>/g, "").length < 1500 ||
      content.replace(/<[^>]*>/g, "").length > 9000
    ) {
      setError("Content must be between 1500 and 9000 characters.");
      setIsSubmitting(false);
      return;
    }

    if (selectedTags.length < 1 || selectedTags.length > 5) {
      setError("You must select at least 1 tags and at most 5 tags.");
      setIsSubmitting(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not logged in");

      // If editing, use the passed-in `type`; otherwise fallback on role
      const collectionName = isEditing
        ? type                                    // "articles" or "patient_stories"
        : (userRole === "doctor"
          ? "articles"
          : "patient_stories");

      if (isEditing && docId) {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, {
          title,
          content,
          selectedTags,
          last_updated: new Date(),
        });
      } else {
        await addDoc(collection(db, collectionName), {
          title,
          content,
          selectedTags,
          author_name: user.displayName || "Anonymous",
          author_email: user.email,
          user_id: user.uid,
          date_time: new Date(),
          last_updated: new Date(),
        });
      }

      navigate("/education-main");
    } catch (error) {
      console.error("Error submitting:", error);
      setError("An error occurred while submitting. Please try again.");
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
          {isEditing
            ? "Edit Content"
            : userRole === "doctor"
              ? "Write an Article"
              : "Write Your Patient Story"}
        </h1>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full text-4xl font-semibold text-purple-900 bg-transparent border-b-2 border-gray-400 outline-none focus:ring-0 focus:border-purple-500 placeholder-gray-400"
            required
          />
          {/* Write/Edit the main content in the React Quill structure */}
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
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${selectedTags.includes(tag)
                    ? "bg-purple-600 text-white"
                    : "bg-purple-300 text-purple-900"
                    } hover:bg-purple-700`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-purple-600 text-white py-3 px-8 rounded-lg hover:bg-purple-700"
          >
            {isEditing ? "Update" : "Publish"}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default EducationWritePage;
