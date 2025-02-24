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

  return (
    <div
      className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-2xl hover:-translate-y-1 transform transition duration-300 cursor-pointer border border-gray-100"
      onClick={() => navigate(detailPageUrl)}
    >
      {/* Title */}
      <h3 className="text-xl font-bold text-purple-800 mb-3">{title}</h3>

      {/* Author & Date */}
      <p className="text-sm text-gray-500 mb-3">
        By <span className="text-purple-600 font-medium">{author}</span> ·{" "}
        {date ? new Date(date).toLocaleDateString() : "Unknown Date"}
      </p>

      {/* Content Preview - Rendered Safely */}
      <p
        className="text-gray-700 text-sm line-clamp-3 mb-4"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(content) || "No content available.",
        }}
      ></p>

      {/* Tags Section */}
      <div className="flex flex-wrap gap-2">
        {Array.isArray(tags) &&
          tags.map((tag, index) => (
            <span
              key={index}
              className="bg-orange-100 text-orange-600 text-xs font-semibold py-1 px-3 rounded-full"
            >
              {tag}
            </span>
          ))}
      </div>
    </div>
  );
};

export default EducationCard;
