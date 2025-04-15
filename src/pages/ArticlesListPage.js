// Lists all of the articles written by the doctors
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import ListViewCard from "../components/ListViewCard";
import Footer from "../components/Footer";
import TagSearchBar from "../components/TagSearchBar";

const ArticlesListPage = () => {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [animationCompleted, setAnimationCompleted] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, [page, selectedTags]);

  // Fetches the articles from the backend, all or selected by the tags
  const fetchArticles = () => {
    setLoading(true);
    setNoResults(false);
    let url = `http://127.0.0.1:8000/api/get_articles/?page=${page}`;
    if (selectedTags.length > 0) { // Adds tags as a comma-separated query string if any are selected.
      url += `&tags=${selectedTags.join(",")}`;
    }
    axios
      .get(url)
      .then((response) => {
        let filteredArticles = response.data.results || [];
        if (selectedTags.length > 0) { // Search logic to filter the articles
          filteredArticles = filteredArticles.filter((article) =>
            selectedTags.every((tag) =>
              Object.values(article.selectedTags || {}).includes(tag)
            )
          );
        }
        setArticles(filteredArticles);
        setTotalPages(response.data.total_pages);
        setLoading(false);
        if (filteredArticles.length === 0) {
          setNoResults(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching articles:", error);
        setError(error.response?.data?.message || "Error fetching articles.");
        setLoading(false);
      });
  };

  // Define the pages, which limit the articles to 10 max on a page
  const nextPage = () => setPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setPage((prev) => Math.max(prev - 1, 1));

  // Resets the selected tags and returns all of the articles in DB
  const resetSearch = () => {
    setSelectedTags([]);
    setPage(1);
    setNoResults(false);
  };

  return (
    <div className="bg-gradient-to-br from-orange-100 via-amber-50 to-orange-100 min-h-screen">
      {/* Orange gradient rotating banner */}
      <motion.div
        className="text-white py-20 text-center transition-all duration-1000 bg-gradient-to-r from-orange-900 via-orange-700 to-orange-500"
        initial={{
          background: "conic-gradient(from 0deg, #ff4500, #ff8c00, #ff4500)",
        }}
        animate={{
          background: animationCompleted
            ? "linear-gradient(to right, #ff4500, #ff8c00)"
            : [
              "conic-gradient(from 0deg, #ff4500, #ff8c00, #ff4500)",
              "conic-gradient(from 120deg, #ff8c00, #ff4500, #ff8c00)",
              "conic-gradient(from 240deg, #ff4500, #ff8c00, #ff4500)",
              "linear-gradient(to right, #ff4500, #ff8c00)",
            ],
        }}
        transition={{ duration: 4, ease: "easeInOut" }}
        onAnimationComplete={() => setAnimationCompleted(true)}
      >
        <h1 className="text-5xl font-extrabold tracking-wide leading-snug drop-shadow-lg">
          Explore Expert-Led Articles
        </h1>
        <p className="mt-6 text-lg md:text-xl max-w-xl mx-auto font-light">
          Gain insights from mental health professionals covering anxiety,
          depression, and well-being.
        </p>
      </motion.div>

      <div className="max-w-5xl mx-auto py-6 px-6">
        <TagSearchBar
          themeColor="orange"
          onSearch={setSelectedTags}
          selectedTags={selectedTags}
        />
        {selectedTags.length > 0 && (
          <button
            onClick={resetSearch}
            className="ml-4 bg-orange-500 text-white px-4 py-2 rounded-lg"
          >
            Reset
          </button>
        )}
      </div>

      <div className="max-w-5xl mx-auto py-12 px-6">
        <h2 className="text-3xl font-semibold text-orange-600 mb-6">
          Latest Articles
        </h2>

        {loading ? (
          <motion.div
            className="py-10 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="h-14 w-14 rounded-full bg-gradient-to-r from-orange-600 to-orange-400"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <p className="text-orange-700 mt-4 font-medium">Loading articles...</p>
          </motion.div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : noResults ? (
          <div className="text-gray-500">
            No articles found for the selected tags. Try different tags or reset
            the filter.
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {/* Article preview card */}
              {articles.map((article) => (
                <ListViewCard
                  key={article.id}
                  title={article.title}
                  content={article.content || "No content available"}
                  author={article.author_name}
                  date={new Date(article.date_time).toLocaleDateString()}
                  tags={Object.values(article.selectedTags || {})}
                  link={`/articles/${article.id}`}
                  titleColor="text-orange-700"
                  tagColor="bg-orange-200 text-orange-700"
                  borderColor="border-orange-500"
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4 mt-8">
                <button
                  onClick={prevPage}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${page === 1
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 text-white hover:from-orange-700 hover:via-orange-600 hover:to-orange-500"
                    }`}
                >
                  Previous
                </button>

                <div className="text-orange-700 font-medium">
                  Page {page} of {totalPages}
                </div>

                <button
                  onClick={nextPage}
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${page === totalPages
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 text-white hover:from-orange-700 hover:via-orange-600 hover:to-orange-500"
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

export default ArticlesListPage;
