import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios"; // used for API requests to Django
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Footer from "../components/Footer";

const EducationDetailView = () => {
  const { id } = useParams();
  const pathname = window.location.pathname;
  const pathParts = pathname.split("/");
  const type = pathParts[1] === "stories" ? "stories" : "articles";

  const [data, setData] = useState(null); // article or story data
  const [error, setError] = useState(null); // tracks errors
  const [loggedInUser, setLoggedInUser] = useState(null); // sees if the user is logged in
  const [loading, setLoading] = useState(true); // loading: for fetching from backend
  const [showDeleteModal, setShowDeleteModal] = useState(false); // pop-up to see the delete
  const [deleteSuccess, setDeleteSuccess] = useState(false); // successfully deleted
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
    // Fetches the data from the backend: article or a story
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

  // Handles the editing mode, fetches the data from the website and navigates to the EducationWritePage.js
  const handleEdit = () => {
    const coll = type === "stories" ? "patient_stories" : "articles";
    navigate("/write-education", {
      state: {
        isEditing: true,
        id,
        type: coll,            // now exactly "articles" or "patient_stories"
        title: data.title,
        content: data.content,
        selectedTags: data.selectedTags ? Object.values(data.selectedTags) : [],
      },
    });
  };

  // Deletes the specific article / story (only if the user is logged in)
  const handleDelete = async () => {
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8000/api";
    try {
      await axios.delete(`${apiUrl}/${type}/${id}/delete/`, {
        withCredentials: true,
      });

      setDeleteSuccess(true);
      setTimeout(() => {
        setShowDeleteModal(false);
        navigate("/education-main");
      }, 2000);
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Error deleting content");
    }
  };

  if (loading || !data) {
    return (
      <div className="text-center py-10 text-purple-600 text-xl">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // Check if user is logged in first, then compare emails
  const isAuthor =
    loggedInUser &&
    loggedInUser.email &&
    data.author_email &&
    loggedInUser.email.toLowerCase() === data.author_email.toLowerCase();

  return (
    <div className="bg-gradient-to-b from-purple-100 via-indigo-50 to-white min-h-screen flex flex-col">
      <div className="max-w-4xl mx-auto flex-grow py-12 px-6 md:px-8 lg:px-4">
        {/* Content Header */}
        <header className="mb-10 border-b border-purple-300 pb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-800 via-indigo-700 to-purple-900 leading-normal pb-12">
            {data.title}
          </h1>

          <div className="flex flex-wrap items-center text-lg text-gray-600 mb-4">
            <span className="mr-2">By</span>
            <span className="text-orange-600 font-semibold mr-2">
              {data.author_name}
            </span>
            <span className="text-gray-400 mx-2">•</span>
            <span className="text-indigo-600">
              {new Date(data.date_time).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          {data.selectedTags && (
            <div className="flex flex-wrap gap-2 mt-4">
              {Object.values(data.selectedTags).map((tag, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-purple-200 to-indigo-200 text-purple-800 text-sm font-medium py-1 px-3 rounded-full shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Article/Story Content */}
        <article className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
          <div
            className="prose-headings:text-indigo-800 prose-headings:font-semibold prose-p:text-gray-700 prose-p:leading-7 prose-p:my-5 prose-a:text-orange-600 prose-a:no-underline prose-a:font-medium prose-a:hover:underline prose-li:my-1 prose-li:text-gray-700"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        </article>

        {/* Action buttons with gradient styling */}
        {isAuthor && (
          <div className="mt-12 flex space-x-4 justify-start">
            <button
              onClick={handleEdit}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 px-6 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition text-lg shadow-md flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 px-6 rounded-lg hover:from-red-600 hover:to-orange-600 transition text-lg shadow-md flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Delete Modal: Pop up to confirm if the user wanna deletes something */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full mx-4 transform transition-all">
            {deleteSuccess ? (
              <div className="py-4">
                <svg
                  className="w-16 h-16 text-green-500 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                <p className="text-xl text-green-600 font-semibold">
                  Content deleted successfully!
                </p>
                <p className="text-gray-500 mt-2">Redirecting you...</p>
              </div>
            ) : (
              <>
                <svg
                  className="w-16 h-16 text-red-500 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  ></path>
                </svg>
                <p className="text-xl text-gray-800 font-semibold mb-2">
                  Delete Confirmation
                </p>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this content? This action
                  cannot be undone.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleDelete}
                    className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 px-6 rounded-lg hover:from-red-600 hover:to-orange-600 transition shadow-md"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:from-gray-300 hover:to-gray-400 transition shadow-md"
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
