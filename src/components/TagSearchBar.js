import React, { useState, useEffect, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { X, Search, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { db } from "../firebaseConfig.js";

const TagSearchBar = ({ onSearch, selectedTags, themeColor }) => {
  const [tags, setTags] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
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

  const filteredTags = searchInput
    ? tags.filter((tag) =>
        tag.toLowerCase().includes(searchInput.toLowerCase())
      )
    : tags;

  const primaryColor = themeColor === "orange" ? "orange" : "purple";
  const getColor = (type) => {
    const colors = {
      orange: {
        primary: "bg-orange-600",
        secondary: "bg-orange-500",
        hover: "hover:bg-orange-700",
        text: "text-orange-600",
        light: "bg-orange-100",
        gradient: "bg-gradient-to-r from-orange-500 to-orange-600",
        hoverGradient: "hover:from-orange-600 hover:to-orange-700",
        border: "border-orange-300",
        shadow: "shadow-orange-200",
      },
      purple: {
        primary: "bg-purple-600",
        secondary: "bg-purple-500",
        hover: "hover:bg-purple-700",
        text: "text-purple-600",
        light: "bg-purple-100",
        gradient: "bg-gradient-to-r from-purple-500 to-purple-600",
        hoverGradient: "hover:from-purple-600 hover:to-purple-700",
        border: "border-purple-300",
        shadow: "shadow-purple-200",
      },
    };
    return colors[primaryColor][type];
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-6 relative" ref={searchBarRef}>
      <div className="relative">
        <div className="mb-2 flex items-center">
          <Tag className={`mr-2 ${getColor("text")}`} size={18} />
          <h3 className="text-lg font-medium text-gray-700">
            Topic Tags
            <span className="text-sm font-normal text-gray-500 ml-2">
              (Select up to 3)
            </span>
          </h3>
        </div>

        <div
          className={`w-full p-4 border ${getColor(
            "border"
          )} rounded-xl cursor-pointer flex flex-wrap items-center gap-2 bg-white ${getColor(
            "shadow"
          )} shadow-lg transition-all duration-300 hover:shadow-xl relative`}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <Search size={18} className="text-gray-400 absolute left-4" />

          <input
            type="text"
            className="pl-8 pr-4 py-1 rounded-lg outline-none flex-grow bg-transparent placeholder-gray-400"
            placeholder={
              selectedTags.length > 0
                ? "Add more tags..."
                : "Search for topics..."
            }
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onFocus={() => setDropdownOpen(true)}
          />

          <div className="flex flex-wrap items-center gap-2 ml-2">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className={`${getColor(
                  "gradient"
                )} text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 shadow-sm transition-all duration-200 hover:shadow-md`}
              >
                <span>{tag}</span>
                <X
                  size={14}
                  className="cursor-pointer hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTag(tag);
                  }}
                />
              </span>
            ))}
          </div>

          <div className="ml-auto">
            {dropdownOpen ? (
              <ChevronUp size={18} className="text-gray-400" />
            ) : (
              <ChevronDown size={18} className="text-gray-400" />
            )}
          </div>
        </div>

        {dropdownOpen && (
          <div className="absolute w-full bg-white border rounded-xl mt-2 shadow-xl z-10 max-h-64 overflow-y-auto transition-all duration-300 divide-y divide-gray-100">
            {filteredTags.length > 0 ? (
              filteredTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <div
                    key={tag}
                    className={`p-2 cursor-pointer transition-all duration-200 ${
                      isSelected ? getColor("light") : ""
                    }`}
                    onClick={() => handleTagClick(tag)}
                  >
                    <div
                      className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
                        isSelected ? getColor("text") : "text-gray-700"
                      } hover:bg-gray-50`}
                    >
                      <Tag
                        size={16}
                        className={
                          isSelected ? getColor("text") : "text-gray-400"
                        }
                      />
                      <span className="font-medium">{tag}</span>
                      {isSelected && (
                        <span
                          className={`ml-auto text-xs px-2 py-0.5 rounded-full ${getColor(
                            "primary"
                          )} text-white`}
                        >
                          Selected
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-gray-500">
                No matching tags found
              </div>
            )}
          </div>
        )}
      </div>

      <button
        className={`${getColor("gradient")} ${getColor(
          "hoverGradient"
        )} text-white px-6 py-3 rounded-xl mt-4 w-full transition-all duration-300 disabled:opacity-50 font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5`}
        onClick={() => {
          setDropdownOpen(false);
          setSearchInput("");
        }}
        disabled={selectedTags.length === 0}
      >
        <Search size={18} />
        Search{" "}
        {selectedTags.length > 0
          ? `with ${selectedTags.length} tag${
              selectedTags.length > 1 ? "s" : ""
            }`
          : ""}
      </button>
    </div>
  );
};

export default TagSearchBar;
