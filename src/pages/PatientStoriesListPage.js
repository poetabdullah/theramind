import React, { useState, useEffect } from "react";
import PageBanner from "../components/PageBanner";
import ListViewCard from "../components/ListViewCard";

const PatientStoriesListPage = () => {
  // Dummy stories data (replace with API fetch later)
  const [stories, setStories] = useState([
    {
      id: 1,
      title: "My Journey with Anxiety",
      content:
        "This is my story of dealing with anxiety and overcoming challenges...",
      author: "Jane Doe",
      date: "2025-01-18",
      tags: ["Personal Story", "Anxiety"],
    },
    {
      id: 2,
      title: "Finding Hope",
      content:
        "Sharing my experience with mental health and how I found hope again...",
      author: "John Smith",
      date: "2025-01-21",
      tags: ["Inspiration", "Mental Health"],
    },
  ]);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Page Banner */}
      <PageBanner
        title="Real-Life Patient Stories"
        subtitle="Read inspiring personal journeys of resilience and hope in mental health."
        background="bg-gradient-to-r from-purple-800 via-purple-600 to-purple-500"
      />

      {/* Stories List Section */}
      <div className="max-w-5xl mx-auto py-12 px-6">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
          Latest Patient Stories
        </h2>

        <div className="space-y-6">
          {stories.map((story) => (
            <ListViewCard
              key={story.id}
              title={story.title}
              content={story.content}
              author={story.author}
              date={story.date}
              tags={story.tags}
              link={`/stories/${story.id}`} // Navigation to story detail
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientStoriesListPage;
