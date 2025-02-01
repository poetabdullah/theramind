import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Use useNavigate instead of useHistory
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const EducationDetailView = () => {
  const { id, type } = useParams(); // Get the article or patient story ID and type (article or patient story)
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null); // Store logged-in user data
  const navigate = useNavigate(); // Replace useHistory with useNavigate

  useEffect(() => {
    // Fetch logged-in user details
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedInUser(user); // Set logged-in user data
      } else {
        setLoggedInUser(null); // Set null if no user is logged in
      }
    });

    const fetchData = async () => {
      const url = `${process.env.REACT_APP_API_URL}/${type}/${id}/`;
      console.log("Fetching data from URL:", url); // Log the URL to ensure it's correct
      try {
        const response = await axios.get(url);
        console.log("Fetched data:", response.data); // Log the response data
        setData(response.data); // Store the fetched data
      } catch (err) {
        console.error("Error fetching data:", err); // Log the error for debugging
        setError("Error fetching data. Please try again later.");
      }
    };

    fetchData();
  }, [id, type]);

  const handleEdit = () => {
    // Redirect to the edit page (modify as per your routes)
    navigate(`/edit/${type}/${id}`); // Use navigate instead of history.push
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/${type}/${id}/`);
      navigate(`/${type}s`); // Redirect to the list page after deletion (either stories or articles)
    } catch (err) {
      setError("Error deleting data. Please try again later.");
    }
  };

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-purple-600 mb-4">{data.title}</h1>
      <p className="text-sm text-gray-600 mb-2">By {data.author_name}</p>
      <p className="text-sm text-gray-500 mb-4">
        {new Date(data.date_time).toLocaleString()}
      </p>

      <div className="content text-lg text-gray-700">
        <p>{data.content}</p>
      </div>

      <div className="tags mt-4">
        {data.tags && data.tags.length > 0 && (
          <div className="flex space-x-2">
            {data.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Conditionally render Edit and Delete buttons if logged-in user is the author, so that only the author has authority to delete or edit the content */}
      {loggedInUser?.email === data.author_email && (
        <div className="mt-6 flex space-x-4">
          <button
            onClick={handleEdit}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default EducationDetailView;
