import React from "react";
import { useNavigate } from "react-router-dom";

const EducationCard = ({ title, author, date, tags, content, link }) => {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-2xl hover:-translate-y-1 transform transition duration-300 cursor-pointer border border-gray-100"
      onClick={() => navigate(link)}
    >
      <h3 className="text-xl font-bold text-purple-800 mb-3">{title}</h3>
      <p className="text-sm text-gray-500 mb-3">
        By <span className="text-purple-600 font-medium">{author}</span> ·{" "}
        {new Date(date).toLocaleDateString()}
      </p>
      <p className="text-gray-700 text-sm line-clamp-3 mb-4">{content}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
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
