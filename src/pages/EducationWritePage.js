import React, { useState, useEffect, useRef } from "react";
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
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { onAuthStateChanged } from "firebase/auth";
import AIAnalysisAnimation from "../components/AIAnalysisAnimation";

// Enhanced Strip HTML/markdown for model input
const stripHtml = (html) => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  let text = tempDiv.textContent || tempDiv.innerText || "";

  // Remove common markdown syntax
  text = text
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/~~(.*?)~~/g, '$1') // Remove strikethrough
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
    .replace(/^\s*[-*+]\s+/gm, '') // Remove bullet points
    .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered lists
    .replace(/^\s*>\s+/gm, '') // Remove blockquotes
    .trim();

  return text;
};

// Normalize text: collapse whitespace
const normalize = (text) => text.trim().replace(/\s+/g, " ");

// Count word differences between two stripped texts
const countWordDiff = (oldText, newText) => {
  const oldWords = normalize(oldText).split(/\s+/).filter(Boolean);
  const newWords = normalize(newText).split(/\s+/).filter(Boolean);
  let diff = 0;
  const minLen = Math.min(oldWords.length, newWords.length);
  for (let i = 0; i < minLen; i++) {
    if (oldWords[i] !== newWords[i]) diff++;
  }
  diff += Math.abs(oldWords.length - newWords.length);
  return diff;
};

const EducationWritePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.state?.isEditing || false;
  const docId = location.state?.id || null;
  const type = location.state?.type || "";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [tags, setTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Keep originals for diff check
  const originalStrippedRef = useRef("");
  const originalTitleRef = useRef("");

  // AI Animation and result state
  const [showAIAnimation, setShowAIAnimation] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);
  const [aiAnalysisMessage, setAiAnalysisMessage] = useState("");

  const [triggerCompletion, setTriggerCompletion] = useState(false);

  // Auth and role detection
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }
      try {
        const patientSnap = await getDoc(doc(db, "patients", user.email));
        const doctorSnap = await getDoc(doc(db, "doctors", user.email));
        if (doctorSnap.exists()) setUserRole("doctor");
        else if (patientSnap.exists()) setUserRole("patient");
        else navigate("/");
      } catch (err) {
        console.error(err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch available tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tagDocs = await getDocs(collection(db, "tags"));
        setTags(tagDocs.docs.map((d) => d.data().tag_name));
      } catch (err) {
        console.error("Error fetching tags:", err);
      }
    };
    fetchTags();
  }, []);

  // Load original content when editing
  useEffect(() => {
    const fetchDoc = async () => {
      if (isEditing && docId) {
        try {
          const snap = await getDoc(doc(db, type, docId));
          if (snap.exists()) {
            const data = snap.data();
            setTitle(data.title || "");
            setContent(data.content || "");
            setSelectedTags(data.selectedTags || []);
            originalStrippedRef.current = normalize(stripHtml(data.content || ""));
            originalTitleRef.current = data.title || "";
          }
        } catch (err) {
          console.error("Error loading doc:", err);
        }
      }
    };
    fetchDoc();
  }, [isEditing, docId, type]);

  const handleTagClick = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : prev.length < 5
          ? [...prev, tag]
          : prev
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const stripped = normalize(stripHtml(content));

    // Validate ALL minimum criteria first - only proceed if everything is valid
    if (title.length < 10 || title.length > 100) {
      setError("Title must be 10–100 characters.");
      setIsSubmitting(false);
      return;
    }
    if (stripped.length < 1500 || stripped.length > 9000) {
      setError("Content must be 1500–9000 characters.");
      setIsSubmitting(false);
      return;
    }
    if (selectedTags.length < 1 || selectedTags.length > 5) {
      setError("Select 1–5 tags.");
      setIsSubmitting(false);
      return;
    }

    // On edits, check if changes are significant enough
    if (isEditing) {
      const titleUnchanged = title === originalTitleRef.current;
      const diff = countWordDiff(originalStrippedRef.current, stripped);

      // Don't allow update if less than 5 words changed
      if (diff < 5) {
        setError("Please make at least 5 words of changes before updating.");
        setIsSubmitting(false);
        return;
      }

      // Skip AI validation if less than 7 words changed
      if (titleUnchanged && diff < 7) {
        try {
          await updateDoc(doc(db, type, docId), {
            title,
            content,
            selectedTags,
            last_updated: new Date(),
          });
          navigate("/education-main");
        } catch (err) {
          setError("Update failed. Try again.");
        }
        setIsSubmitting(false);
        return;
      }
    }


    // Trigger AI validation
    setShowAIAnimation(true);

    let res, data;
    let retries = 0;
    const maxRetries = 5;

    while (retries < maxRetries) {
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
        res = await fetch(`${backendUrl}/api/validate-content/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content }),
        });

        if (res.ok) {
          data = await res.json();
          if (data && typeof data.valid === "boolean") break;
        }
      } catch (e) {
        console.error("Retry error:", e);
      }

      retries++;
      await new Promise((r) => setTimeout(r, 1500));
    }

    if (!data || typeof data.valid !== "boolean") {
      setAiAnalysisResult(false);
      setAiAnalysisMessage("🚨 AI validation failed or returned incomplete data.");
      setTriggerCompletion(true); // Force AI animation to finish
      return;
    }

    const allowed = data.valid;
    const conf = typeof data.confidence_score === "number"
      ? `${(data.confidence_score * 100).toFixed(1)}%`
      : "N/A";
    const votes = typeof data.votes === "number" ? `${data.votes}/3` : "N/A";
    const note = data.note || "No note provided.";

    const msg = [
      allowed ? "✅ Approved by AI ensemble!" : "❌ Blocked by AI moderation.",
      `🧠 Confidence Score: ${conf}`,
      `🧪 Confidence Threshold Passed: ${data.confidence_pass ? "✔️" : "✖️"}`,
      `🔁 TTA (Augmented Consistency) Passed: ${data.tta_pass ? "✔️" : "✖️"}`,
      `🧷 Keyword Override Triggered: ${data.override_pass ? "✔️" : "✖️"}`,
      `📊 Total Votes: ${votes}`,
      `📝 Note: ${note}`,
    ].join("\n");

    setAiAnalysisResult(allowed);
    setAiAnalysisMessage(msg);
    setTriggerCompletion(true);  // This is what allows animation to exit stage 3

  };

  const handleAIAnalysisComplete = async () => {
    setShowAIAnimation(false);
    setIsSubmitting(false);
    if (aiAnalysisResult) {
      try {
        const user = auth.currentUser;
        const collectionName = isEditing
          ? type
          : userRole === "doctor"
            ? "articles"
            : "patient_stories";
        if (isEditing) {
          await updateDoc(doc(db, collectionName, docId), {
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
      } catch (err) {
        setError("Submit failed. Try again.");
      }
    } else {
      setError(aiAnalysisMessage);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-2xl">Loading...</div>;

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

          <ReactQuill
            value={content}
            onChange={setContent}
            placeholder="Write your content here..."
            className="bg-purple-200 p-4 rounded-md shadow-md text-lg text-purple-900 border border-purple-300"
            modules={{
              toolbar: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link"],
                ["clean"],
              ],
            }}
          />

          <div className="space-y-4">
            <div className="text-lg font-medium text-purple-900">Select Tags</div>
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
            className="bg-purple-600 text-white py-3 px-8 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Analyzing..." : isEditing ? "Update" : "Publish"}
          </button>
        </form>
      </div>

      <AIAnalysisAnimation
        isVisible={showAIAnimation}
        onComplete={handleAIAnalysisComplete}
        isSuccess={aiAnalysisResult}
        message={aiAnalysisMessage}
        triggerCompletion={triggerCompletion}
      />


      <Footer />
    </div>
  );
};

export default EducationWritePage;