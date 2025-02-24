import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Footer from "../components/Footer";

const EducationDetailView = () => {
  const { id } = useParams();
  const pathname = window.location.pathname;
  const pathParts = pathname.split("/");
  const type = pathParts[1] === "stories" ? "stories" : "articles";

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false); // ✅ New state
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      setError("No content ID provided");
      setLoading(false);
      return;
    }

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoggedInUser(user || null);
    });

    const fetchData = async () => {
      const apiUrl =
        process.env.REACT_APP_API_URL || "http://localhost:8000/api";
      const url = `${apiUrl}/${type}/${id}`;

      try {
        const response = await axios.get(url, {
          withCredentials: true,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
        setData(response.data || null);
      } catch (err) {
        setError(err.response?.data?.error || "Error fetching content");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => unsubscribe();
  }, [id, type]);

  const handleEdit = () => {
    navigate("/write-education", {
      state: {
        isEditing: true,
        id,
        type,
        title: data.title,
        content: data.content,
        selectedTags: data.selectedTags ? Object.values(data.selectedTags) : [],
      },
    });
  };

  const handleDelete = async () => {
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8000/api";
    try {
      await axios.delete(`${apiUrl}/${type}/${id}/delete/`, {
        withCredentials: true,
      });

      setDeleteSuccess(true);
      setTimeout(() => {
        setShowDeleteModal(false); // Close modal after 2 seconds
        navigate("/education-main"); // Redirect
      }, 2000);
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Error deleting content");
    }
  };

  if (loading || !data) {
    return (
      <div className="text-center py-10 text-purple-600 text-xl">
        Loading...
      </div>
    );
  }

  const isAuthor =
    loggedInUser?.email?.toLowerCase() === data?.author_email?.toLowerCase();

  return (
    <div className="bg-gradient-to-b from-purple-100 to-white min-h-screen flex flex-col">
      <div className="max-w-3xl mx-auto flex-grow py-12 px-6">
        <h1 className="text-5xl font-bold text-purple-900 leading-tight mb-6">
          {data.title}
        </h1>
        <p className="text-lg text-gray-700 mb-6 italic">
          By{" "}
          <span className="text-orange-600 font-semibold">
            {data.author_name}
          </span>{" "}
          &middot; {new Date(data.date_time).toLocaleDateString()}
        </p>
        {data.selectedTags && (
          <div className="flex flex-wrap gap-2 mb-8">
            {Object.values(data.selectedTags).map((tag, index) => (
              <span
                key={index}
                className="bg-purple-200 text-purple-800 text-sm font-medium py-1 px-3 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div
          className="prose prose-lg max-w-none text-gray-800 leading-relaxed text-justify"
          dangerouslySetInnerHTML={{ __html: data.content }}
        />
        {isAuthor && (
          <div className="mt-8 flex space-x-4">
            <button
              onClick={handleEdit}
              className="bg-orange-500 text-white py-2 px-6 rounded-lg hover:bg-orange-600 transition text-lg shadow-md"
            >
              Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 transition text-lg shadow-md"
            >
              Delete
            </button>
          </div>
        )}
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            {deleteSuccess ? (
              <p className="text-lg text-green-600 font-semibold">
                Content deleted successfully! Redirecting...
              </p>
            ) : (
              <>
                <p className="text-lg text-gray-700 mb-4">
                  Are you sure you want to delete this?
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleDelete}
                    className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 transition"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="bg-gray-300 py-2 px-6 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default EducationDetailView;
