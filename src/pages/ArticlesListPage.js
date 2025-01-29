import React, { useState, useEffect } from "react";
import PageBanner from "../components/PageBanner";
import ListViewCard from "../components/ListViewCard";

const ArticlesListPage = () => {
  // Dummy articles data (replace with API fetch later)
  const [articles, setArticles] = useState([
    {
      id: 1,
      title: "Understanding Anxiety",
      content: "Learn about the signs, symptoms, and ways to manage anxiety...",
      author: "Dr. Smith",
      date: "2025-01-20",
      tags: ["Mental Health", "Anxiety"],
    },
    {
      id: 2,
      title: "Coping with Depression",
      content:
        "Discover strategies to cope with depression and improve your mood...",
      author: "Dr. Jones",
      date: "2025-01-22",
      tags: ["Depression", "Wellness"],
    },
  ]);

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
      </div>
    </div>
  );
};

export default ArticlesListPage;
