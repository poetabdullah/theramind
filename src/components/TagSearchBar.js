import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig.js";

const TagSearchBar = ({ onSearch, themeColor }) => {
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    const fetchTags = async () => {
      const tagsCollection = collection(db, "tags");
      const tagSnapshot = await getDocs(tagsCollection);
      const tagList = tagSnapshot.docs.map((doc) => doc.data().tag_name);
      setTags(tagList);
    };
    fetchTags();
  }, []);

  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className={`text-lg font-semibold text-${themeColor}-600 mb-2`}>
          Filter by Tags
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-3 py-1 rounded-full border ${
                selectedTags.includes(tag)
                  ? `bg-${themeColor}-600 text-white`
                  : `border-${themeColor}-500 text-${themeColor}-600`
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <button
          className={`bg-${themeColor}-600 text-white px-4 py-2 rounded`}
          onClick={() => onSearch(selectedTags)}
          disabled={selectedTags.length === 0}
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default TagSearchBar;
