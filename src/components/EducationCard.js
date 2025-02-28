import React from "react";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";

const EducationCard = ({ id, title, author, date, tags, content, type }) => {
  const navigate = useNavigate();
  const detailPageUrl =
    type === "article"
      ? `/articles/${id}`
      : type === "story"
      ? `/stories/${id}`
      : `/content/${id}`;

  // Set colors based on content type
  const colors =
    type === "article"
      ? {
          badge: "bg-orange-600",
          title: "text-orange-800",
          author: "text-orange-600",
          border: "border-orange-200",
          tag: "bg-orange-100 text-orange-700 hover:bg-orange-200",
        }
      : {
          badge: "bg-purple-600",
          title: "text-purple-800",
          author: "text-purple-600",
          border: "border-purple-200",
          tag: "bg-purple-100 text-purple-700 hover:bg-purple-200",
        };

  // Format type for display
  const typeLabel = type
    ? type.charAt(0).toUpperCase() + type.slice(1)
    : "Content";

  return (
    <div
      className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-2xl hover:-translate-y-1 transform transition duration-300 cursor-pointer border border-gray-100 relative overflow-hidden"
      onClick={() => navigate(detailPageUrl)}
    >
      {/* Type Badge */}
      <div
        className={`absolute top-0 right-0 ${colors.badge} text-white text-xs font-bold py-1 px-3 rounded-bl-lg`}
      >
        {typeLabel}
      </div>

      {/* Title with padding to avoid badge overlap */}
      <h3 className={`text-xl font-bold ${colors.title} mb-3 pr-16`}>
        {title}
      </h3>

      {/* Author & Date */}
      <p className="text-sm text-gray-500 mb-3">
        By <span className={`${colors.author} font-medium`}>{author}</span> ·{" "}
        {date ? new Date(date).toLocaleDateString() : "Unknown Date"}
      </p>

      {/* Content Preview with left border styling */}
      <div
        className={`text-gray-700 text-sm line-clamp-3 mb-4 border-l-4 ${colors.border} pl-3`}
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(content) || "No content available.",
        }}
      ></div>

      {/* Tags Section with improved styling */}
      <div className="flex flex-wrap gap-2 mt-3">
        {Array.isArray(tags) && tags.length > 0 ? (
          tags.map((tag, index) => (
            <span
              key={index}
              className={`${colors.tag} text-xs font-semibold py-1 px-3 rounded-full transition-colors`}
            >
              {tag}
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-400 italic">No tags</span>
        )}
      </div>
    </div>
  );
};

export default EducationCard;
