import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const EducationDetailView = () => {
  const { id } = useParams();
  const pathname = window.location.pathname;
  const pathParts = pathname.split("/");
  const type = pathParts[1] === "stories" ? "stories" : "articles";

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
      if (!id) {
        setError("No content ID provided");
        setLoading(false);
        return;
      }

      const apiUrl =
        process.env.REACT_APP_API_URL || "http://localhost:8000/api";
      const url = `${apiUrl}/${type}/${id}`;

      try {
        const response = await axios({
          method: "get",
          url: url,
          withCredentials: true,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Origin: "http://localhost:3000",
          },
        });

        if (response.data) {
          setData(response.data);
        } else {
          setError("No content found");
        }
      } catch (err) {
        setError(err.response?.data?.error || "Error fetching content");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => unsubscribe();
  }, [id, type]);

  const handleEdit = () => navigate(`/edit/${type}/${id}`);

  const handleDelete = async () => {
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

    try {
      await axios.delete(`${apiUrl}/${type}/${id}/delete`);
      navigate(`/${type}`);
    } catch (err) {
      setError(err.response?.data?.error || "Error deleting content");
    }
  };

  if (error) {
    return (
      <div className="text-center py-10 text-purple-600 text-xl">{error}</div>
    );
  }

  if (loading || !data) {
    return (
      <div className="text-center py-10 text-purple-600 text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-purple-100 to-white min-h-screen py-12 px-6">
      <div className="max-w-3xl mx-auto">
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
            {data.selectedTags &&
              Object.values(data.selectedTags).map((tag, index) => (
                <span
                  key={index}
                  className="bg-purple-200 text-purple-800 text-sm font-medium py-1 px-3 rounded-full"
                >
                  {tag}
                </span>
              ))}
          </div>
        )}

        <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed text-justify">
          {data.content &&
            data.content.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
        </div>

        {loggedInUser && loggedInUser.email === data.author_email && (
          <div className="mt-8 flex space-x-4">
            <button
              onClick={handleEdit}
              className="bg-orange-500 text-white py-2 px-6 rounded-lg hover:bg-orange-600 transition text-lg shadow-md"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 transition text-lg shadow-md"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EducationDetailView;
