import React, { useState, useEffect } from "react";
import axios from "axios";
import PageBanner from "../components/PageBanner";
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

  useEffect(() => {
    fetchArticles();
  }, [page, selectedTags]);

  const fetchArticles = () => {
    setLoading(true);
    setNoResults(false);
    let url = `http://127.0.0.1:8000/api/get_articles/?page=${page}`;
    if (selectedTags.length > 0) {
      url += `&tags=${selectedTags.join(",")}`;
    }
    axios
      .get(url)
      .then((response) => {
        let filteredArticles = response.data.results || [];
        if (selectedTags.length > 0) {
          filteredArticles = filteredArticles.filter((article) =>
            selectedTags.every((tag) => article.selectedTags?.includes(tag))
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
        title="Explore Expert-Led Articles"
        subtitle="Gain insights from mental health professionals covering anxiety, depression, and well-being."
        background="bg-gradient-to-r from-orange-800 via-orange-600 to-orange-400"
      />

      <div className="max-w-5xl mx-auto py-6 px-6">
        <TagSearchBar
          themeColor="orange"
          onSearch={setSelectedTags}
          selectedTags={selectedTags} // Ensures tags persist
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
          <div>Loading...</div>
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
              {articles.map((article) => (
                <ListViewCard
                  key={article.id}
                  title={article.title}
                  content={article.content || "No content available"}
                  author={article.author_name}
                  date={new Date(article.date_time).toLocaleDateString()}
                  tags={article.selectedTags || []}
                  link={`/articles/${article.id}`}
                  titleColor="text-orange-700"
                  tagColor="bg-orange-200 text-orange-700"
                  borderColor="border-orange-500"
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
                      : "bg-orange-500 text-white"
                  }`}
                >
                  Previous
                </button>
                <span className="text-orange-600 font-semibold">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={nextPage}
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded-lg ${
                    page === totalPages
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-orange-500 text-white"
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
