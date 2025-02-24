import React, { useState, useEffect } from "react";
import axios from "axios";
import PageBanner from "../components/PageBanner";
import ListViewCard from "../components/ListViewCard";
import Footer from "../components/Footer";
import TagSearchBar from "../components/TagSearchBar";

const PatientStoriesListPage = () => {
  const [stories, setStories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    fetchStories();
  }, [page, selectedTags]);

  const fetchStories = () => {
    setLoading(true);
    setNoResults(false);
    let url = `http://127.0.0.1:8000/api/get_patient_stories/?page=${page}`;
    if (selectedTags.length > 0) {
      url += `&tags=${selectedTags.join(",")}`;
    }
    axios
      .get(url)
      .then((response) => {
        let filteredStories = response.data.results || [];
        if (selectedTags.length > 0) {
          filteredStories = filteredStories.filter((story) =>
            selectedTags.every((tag) => story.selectedTags?.includes(tag))
          );
        }
        setStories(filteredStories);
        setTotalPages(response.data.total_pages);
        setLoading(false);
        if (filteredStories.length === 0) {
          setNoResults(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching patient stories:", error);
        setError(
          error.response?.data?.message || "Error fetching patient stories."
        );
        setLoading(false);
      });
  };

  const nextPage = () => setPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setPage((prev) => Math.max(prev - 1, 1));

  const resetSearch = () => {
    setSelectedTags([]);
    setPage(1);
    setNoResults(false);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <PageBanner
        title="Read Real Patient Stories"
        subtitle="Discover experiences shared by individuals on their mental health journeys."
        background="bg-gradient-to-r from-purple-800 via-purple-600 to-purple-400"
      />

      <div className="max-w-5xl mx-auto py-6 px-6">
        <TagSearchBar
          themeColor="purple"
          onSearch={setSelectedTags}
          selectedTags={selectedTags} // Ensures tags persist
        />

        {selectedTags.length > 0 && (
          <button
            onClick={resetSearch}
            className="ml-4 bg-purple-500 text-white px-4 py-2 rounded-lg"
          >
            Reset
          </button>
        )}
      </div>

      <div className="max-w-5xl mx-auto py-12 px-6">
        <h2 className="text-3xl font-semibold text-purple-600 mb-6">
          Latest Patient Stories
        </h2>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : noResults ? (
          <div className="text-gray-500">
            No patient stories found for the selected tags. Try different tags
            or reset the filter.
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {stories.map((story) => (
                <ListViewCard
                  key={story.id}
                  title={story.title}
                  content={story.content || "No content available"}
                  author={story.author_name}
                  date={new Date(story.date_time).toLocaleDateString()}
                  tags={story.selectedTags || []}
                  link={`/stories/${story.id}`}
                  titleColor="text-purple-700"
                  tagColor="bg-purple-200 text-purple-700"
                  borderColor="border-purple-500"
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-4">
                <button
                  onClick={prevPage}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-lg ${
                    page === 1
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-purple-500 text-white"
                  }`}
                >
                  Previous
                </button>
                <span className="text-purple-600 font-semibold">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={nextPage}
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded-lg ${
                    page === totalPages
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-purple-500 text-white"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PatientStoriesListPage;
