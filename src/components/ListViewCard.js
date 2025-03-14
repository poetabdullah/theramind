import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ListViewCard = ({
  id,
  title,
  author,
  date,
  tags,
  content,
  link,
  type,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine color scheme based on page type
  const isArticlesPage =
    location.pathname.includes("/articles") || type === "article";
  const tagBgColor = isArticlesPage
    ? "bg-orange-100 text-orange-600"
    : "bg-purple-100 text-purple-600";
  const authorTextColor = isArticlesPage
    ? "text-orange-600"
    : "text-purple-600";

  return (
    <div
      className="mb-8 p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border border-gray-100 hover:border-l-4 hover:border-l-gray-300 cursor-pointer group"
      onClick={() => navigate(link || `/content/${id}`)}
    >
      {/* Tags Section */}
      <div className="flex flex-wrap gap-2 mb-3">
        {Array.isArray(tags) &&
          tags.map((tag, index) => (
            <span
              key={index}
              className={`${tagBgColor} px-3 py-1 text-xs font-medium rounded-full shadow-sm`}
            >
              {tag}
            </span>
          ))}
      </div>

      {/* Title Section */}
      <h2 className="text-2xl font-bold mb-3 text-gray-800 line-clamp-2 leading-tight group-hover:text-gray-700 transition-colors duration-200">
        {title}
      </h2>

      {/* Author & Date */}
      <div className="flex items-center mb-4 text-sm">
        <span className={`font-medium ${authorTextColor}`}>By {author}</span>
        <span className="mx-2 text-gray-400">·</span>
        <span className="text-gray-500">
          {date ? new Date(date).toLocaleDateString() : "Unknown Date"}
        </span>
      </div>

      {/* Content Preview */}
      <div
        className="text-gray-600 text-sm leading-relaxed overflow-hidden line-clamp-3 group-hover:text-gray-700 transition-colors duration-200"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

export default ListViewCard;
