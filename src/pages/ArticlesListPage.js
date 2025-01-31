// ArticlesListPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import PageBanner from "../components/PageBanner";
import ListViewCard from "../components/ListViewCard";

const ArticlesListPage = () => {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`/api/get_articles/?page=${page}`)
      .then((response) => {
        setArticles(response.data.results || []); // Ensure 'results' is always an array
        setTotalPages(response.data.total_pages);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching articles:", error);
        // Handle the case when no articles are found (404 status)
        if (error.response?.status === 404) {
          setError("No articles found.");
        } else {
          setError(error.response?.data?.message || "Error fetching articles.");
        }
        setLoading(false);
      });
  }, [page]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <PageBanner
        title="Explore Expert-Led Articles"
        subtitle="Gain insights from mental health professionals covering anxiety, depression, and well-being."
        background="bg-gradient-to-r from-orange-800 via-orange-600 to-orange-400"
      />

      <div className="max-w-5xl mx-auto py-12 px-6">
        <h2 className="text-3xl font-semibold text-orange-600 mb-6">
          Latest Articles
        </h2>

        {error && <p className="text-red-500">{error}</p>}

        {/* If there are no articles */}
        {articles.length === 0 ? (
          <p>No articles available at the moment.</p>
        ) : (
          <>
            <div className="space-y-6">
              {articles.map((article) => (
                <ListViewCard
                  key={article.id}
                  title={article.title}
                  content={article.content?.[0] || "No content available"}
                  author={article.author_name}
                  date={new Date(article.date_time).toLocaleDateString()}
                  tags={article.tags}
                  link={`/articles/${article.id}`}
                  titleColor="text-orange-700"
                  tagColor="bg-orange-200 text-orange-700"
                  borderColor="border-orange-500"
                />
              ))}
            </div>
          </>
        )}

        {/* Pagination controls */}
        <div className="flex justify-center space-x-2 mt-6">
          <button
            onClick={() => setPage((prevPage) => Math.max(prevPage - 1, 1))}
            disabled={page === 1}
            className="bg-orange-600 text-white px-4 py-2 rounded disabled:bg-orange-300"
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
            className="bg-orange-600 text-white px-4 py-2 rounded disabled:bg-orange-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticlesListPage;
