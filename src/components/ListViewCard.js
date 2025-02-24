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
      className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition duration-300 cursor-pointer border border-gray-200"
      onClick={() => navigate(link || `/content/${id}`)}
    >
      {/* Tags Section */}
      <div className="flex flex-wrap gap-2 mb-2">
        {Array.isArray(tags) &&
          tags.map((tag, index) => (
            <span
              key={index}
              className={`${tagBgColor} text-xs font-semibold py-1 px-3 rounded-full`}
            >
              {tag}
            </span>
          ))}
      </div>

      {/* Title Section */}
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>

      {/* Author & Date */}
      <p className="text-sm text-gray-500 mb-3">
        By <span className={`${authorTextColor} font-medium`}>{author}</span> ·{" "}
        {date ? new Date(date).toLocaleDateString() : "Unknown Date"}
      </p>

      {/* Content Preview */}
      <div
        className="text-gray-700 text-sm line-clamp-3"
        dangerouslySetInnerHTML={{ __html: content || "No content available." }}
      ></div>
    </div>
  );
};

export default ListViewCard;
