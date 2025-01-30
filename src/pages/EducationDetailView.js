// src/pages/EducationDetailView.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const EducationDetailView = () => {
  const { id, type } = useParams(); // Get the article or patient story ID and type (article or patient story)
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Construct the API URL based on the type (article or patient story)
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/${type}/${id}/`
        );
        setData(response.data); // Store the fetched data
      } catch (err) {
        setError("Error fetching data. Please try again later.");
      }
    };

    fetchData();
  }, [id, type]);

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
    </div>
  );
};

export default EducationDetailView;
