import React, { useState, useEffect } from "react";
import axios from "axios"; // For making API requests
import PageBanner from "../components/PageBanner";
import ListViewCard from "../components/ListViewCard";

const ArticlesListPage = () => {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1); // State for current page
  const [totalPages, setTotalPages] = useState(1); // Total number of pages
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    setLoading(true);
    // Fetch paginated articles from Firestore
    axios
      .get(`/api/articles/?page=${page}`)
      .then((response) => {
        setArticles(response.data.results); // Assuming 'results' holds articles
        setTotalPages(response.data.total_pages); // Assuming total_pages is returned from API
        setLoading(false);
      })
      .catch((error) => {
        setError("Error fetching articles."); // Handle errors
        setLoading(false);
      });
  }, [page]);

  if (loading) {
    return <div>Loading...</div>; // Loading state
  }

  if (error) {
    return <div>{error}</div>; // Error state
  }

  if (articles.length === 0) {
    return (
      <div className="bg-gray-100 min-h-screen">
        {/* Page Banner with Improved Gradient */}
        <PageBanner
          title="Explore Expert-Led Articles"
          subtitle="Gain insights from mental health professionals covering anxiety, depression, and well-being."
          background="bg-gradient-to-r from-orange-800 via-orange-600 to-orange-400"
        />

        <div className="max-w-5xl mx-auto py-12 px-6">
          <h2 className="text-3xl font-semibold text-orange-600 mb-6">
            Latest Articles
          </h2>
          <p>No articles available at the moment.</p>{" "}
          {/* Message when no articles are found */}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Page Banner with Improved Gradient */}
      <PageBanner
        title="Explore Expert-Led Articles"
        subtitle="Gain insights from mental health professionals covering anxiety, depression, and well-being."
        background="bg-gradient-to-r from-orange-800 via-orange-600 to-orange-400"
      />

      {/* Articles List Section */}
      <div className="max-w-5xl mx-auto py-12 px-6">
        <h2 className="text-3xl font-semibold text-orange-600 mb-6">
          Latest Articles
        </h2>

        <div className="space-y-6">
          {articles.map((article) => (
            <ListViewCard
              key={article.id}
              title={article.title}
              content={article.content}
              author={article.author}
              date={article.date}
              tags={article.tags}
              link={`/articles/${article.id}`} // Navigation to article detail
              titleColor="text-orange-700" // Ensure titles are orange
              tagColor="bg-orange-200 text-orange-700" // Update tags to orange
              borderColor="border-orange-500" // Ensure border styling is orange
            />
          ))}
        </div>

        {/* Pagination Controls */}
        {articles.length > 0 && (
          <div className="flex justify-center space-x-2 mt-6">
            <button
              onClick={() => setPage((prevPage) => Math.max(prevPage - 1, 1))}
              disabled={page === 1}
              className="bg-orange-600 text-white px-4 py-2 rounded"
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
              className="bg-orange-600 text-white px-4 py-2 rounded"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlesListPage;
