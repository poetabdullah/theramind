// PatientStoriesListPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import PageBanner from "../components/PageBanner";
import ListViewCard from "../components/ListViewCard";

const PatientStoriesListPage = () => {
  const [stories, setStories] = useState([]); // Ensure it's initialized as an empty array
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://127.0.0.1:8000/api/get_patient_stories/?page=${page}`)
      .then((response) => {
        setStories(response.data.results || []); // Ensure 'results' is always an array
        setTotalPages(response.data.total_pages);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching patient stories:", error);
        setError(
          error.response?.data?.message || "Error fetching patient stories."
        );
        setLoading(false);
      });
  }, [page]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <PageBanner
        title="Real-Life Patient Stories"
        subtitle="Read inspiring personal journeys of resilience and hope in mental health."
        background="bg-gradient-to-r from-purple-800 via-purple-600 to-purple-500"
      />

      <div className="max-w-5xl mx-auto py-12 px-6">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
          Latest Patient Stories
        </h2>

        {stories.length === 0 ? (
          <p>No patient stories available at the moment.</p>
        ) : (
          <>
            <div className="space-y-6">
              {stories.map((story) => (
                <ListViewCard
                  key={story.id}
                  title={story.title}
                  content={story.content?.[0] || "No content available"} // Ensure content is handled safely
                  author={story.author_name}
                  date={new Date(story.date_time).toLocaleDateString()}
                  tags={story.selectedTags || []} // Ensure tags is always an array
                  link={`/stories/${story.id}`}
                />
              ))}
            </div>

            <div className="flex justify-center space-x-2 mt-6">
              <button
                onClick={() => setPage((prevPage) => Math.max(prevPage - 1, 1))}
                disabled={page === 1}
                className="bg-purple-600 text-white px-4 py-2 rounded disabled:bg-purple-300"
              >
                Prev
              </button>
              <span className="self-center text-lg">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((prevPage) => Math.min(prevPage + 1, totalPages))
                }
                disabled={page === totalPages}
                className="bg-purple-600 text-white px-4 py-2 rounded disabled:bg-purple-300"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PatientStoriesListPage;
