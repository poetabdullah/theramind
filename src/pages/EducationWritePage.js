import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const EducationWritePage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Predefined tags
  const availableTags = [
    "Mental Health",
    "Anxiety",
    "Stress",
    "Depression",
    "Wellness",
    "Self-Care",
    "Therapy",
    "Mindfulness",
  ];

  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleContentChange = (e) => setContent(e.target.value);

  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission (e.g., to a backend or Firestore)
    setTimeout(() => {
      console.log({ title, content, selectedTags });
      setIsSubmitting(false);
      navigate("/articles"); // Redirect after submission
    }, 1500);
  };

  const handleCancel = () => {
    navigate("/articles"); // Redirect to articles list
  };

  return (
    <div className="bg-gradient-to-b from-purple-100 to-white min-h-screen py-12 px-4">
      {/* Full-width simple layout */}
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold text-purple-900 mb-8">
          Write Your Article
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title input */}
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Article Title"
            className="w-full text-4xl font-semibold text-purple-900 bg-transparent border-b-2 border-gray-400 outline-none focus:ring-0 focus:border-purple-500 placeholder-gray-400"
            required
          />

          {/* Content area */}
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="Write your article content here..."
            rows="15"
            className="w-full text-lg text-gray-800 bg-transparent border-b-2 border-gray-400 outline-none focus:ring-0 focus:border-purple-500 placeholder-gray-400"
            required
          />

          {/* Tag selection */}
          <div className="space-y-4">
            <div className="text-lg font-medium text-purple-900">
              Select Tags
            </div>
            <div className="flex flex-wrap gap-3">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`${
                    selectedTags.includes(tag)
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-purple-900"
                  } px-4 py-2 rounded-full text-sm hover:bg-purple-500 transition-colors`}
                  disabled={
                    selectedTags.length >= 3 && !selectedTags.includes(tag)
                  }
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              You can select up to 3 tags.
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="text-lg text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${
                isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : "bg-orange-500 text-white"
              } py-3 px-8 rounded-lg hover:bg-orange-600 transition duration-300 text-lg`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Publish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EducationWritePage;
