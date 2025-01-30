import React, { useState, useEffect } from "react";
import axios from "axios"; // For making API requests
import PageBanner from "../components/PageBanner";
import ListViewCard from "../components/ListViewCard";

const PatientStoriesListPage = () => {
  const [stories, setStories] = useState([]);
  const [page, setPage] = useState(1); // State for current page
  const [totalPages, setTotalPages] = useState(1); // Total number of pages
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    setLoading(true);
    // Fetch paginated stories from Firestore
    axios
      .get(`/api/patient_stories/?page=${page}`)
      .then((response) => {
        setStories(response.data.results); // Assuming 'results' holds stories
        setTotalPages(response.data.total_pages); // Assuming total_pages is returned from API
        setLoading(false);
      })
      .catch((error) => {
        setError("Error fetching patient stories."); // Handle errors
        setLoading(false);
      });
  }, [page]);

  if (loading) {
    return <div>Loading...</div>; // Loading state
  }

  if (error) {
    return <div>{error}</div>; // Error state
  }

  if (stories.length === 0) {
    return (
      <div className="bg-gray-100 min-h-screen">
        {/* Page Banner */}
        <PageBanner
          title="Real-Life Patient Stories"
          subtitle="Read inspiring personal journeys of resilience and hope in mental health."
          background="bg-gradient-to-r from-purple-800 via-purple-600 to-purple-500"
        />

        <div className="max-w-5xl mx-auto py-12 px-6">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">
            Latest Patient Stories
          </h2>
          <p>No patient stories available at the moment.</p>{" "}
          {/* Message when no stories are found */}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Page Banner */}
      <PageBanner
        title="Real-Life Patient Stories"
        subtitle="Read inspiring personal journeys of resilience and hope in mental health."
        background="bg-gradient-to-r from-purple-800 via-purple-600 to-purple-500"
      />

      {/* Stories List Section */}
      <div className="max-w-5xl mx-auto py-12 px-6">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
          Latest Patient Stories
        </h2>

        <div className="space-y-6">
          {stories.map((story) => (
            <ListViewCard
              key={story.id}
              title={story.title}
              content={story.content}
              author={story.author}
              date={story.date}
              tags={story.tags}
              link={`/stories/${story.id}`} // Navigation to story detail
            />
          ))}
        </div>

        {/* Pagination Controls */}
        {stories.length > 0 && (
          <div className="flex justify-center space-x-2 mt-6">
            <button
              onClick={() => setPage((prevPage) => Math.max(prevPage - 1, 1))}
              disabled={page === 1}
              className="bg-purple-600 text-white px-4 py-2 rounded"
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
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientStoriesListPage;
