import React, { useState, useEffect, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { X } from "lucide-react";
import { db } from "../firebaseConfig.js";

const TagSearchBar = ({ onSearch, selectedTags, themeColor }) => {
  const [tags, setTags] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchBarRef = useRef(null);

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
      onSearch(selectedTags.filter((t) => t !== tag));
    } else if (selectedTags.length < 3) {
      onSearch([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tag) => {
    onSearch(selectedTags.filter((t) => t !== tag));
  };

  const handleClickOutside = (event) => {
    if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 relative" ref={searchBarRef}>
      <div className="relative">
        <div
          className="w-full p-3 border rounded-lg cursor-pointer flex flex-wrap items-center gap-2 bg-white shadow-sm hover:shadow-md transition duration-200"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          {selectedTags.length > 0 ? (
            selectedTags.map((tag) => (
              <span
                key={tag}
                className={`bg-${themeColor}-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2`}
              >
                {tag}
                <X
                  size={14}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTag(tag);
                  }}
                />
              </span>
            ))
          ) : (
            <span className="text-gray-400">Select tags...</span>
          )}
        </div>
        {dropdownOpen && (
          <div className="absolute w-full bg-white border rounded-lg mt-2 shadow-lg z-10 max-h-60 overflow-y-auto p-2">
            {tags.map((tag) => (
              <div
                key={tag}
                className={`p-2 cursor-pointer rounded-lg transition duration-200 hover:bg-${themeColor}-500 hover:text-white ${
                  selectedTags.includes(tag)
                    ? `bg-${themeColor}-600 text-white`
                    : ""
                }`}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </div>
            ))}
          </div>
        )}
      </div>
      <button
        className={`bg-${themeColor}-600 text-white px-4 py-2 rounded mt-4 w-full transition duration-200 hover:bg-${themeColor}-700 disabled:opacity-50`}
        onClick={() => setDropdownOpen(false)}
        disabled={selectedTags.length === 0}
      >
        Search
      </button>
    </div>
  );
};

export default TagSearchBar;
