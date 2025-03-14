// Education Main Page
import React, { useEffect, useState, memo } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import EducationCard from "../components/EducationCard";
import Footer from "../components/Footer";
import MentalHealthIllustration from "../components/MentalHealthIllustration";
import DOMPurify from "dompurify";

export default function EducationMainPage() {
  const [articles, setArticles] = useState([]);
  const [patientStories, setPatientStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animationCompleted, setAnimationCompleted] = useState(false);

  // Update in useEffect function
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl =
          process.env.REACT_APP_API_URL || "http://localhost:8000/api";

        const [articlesRes, storiesRes] = await Promise.all([
          axios.get(`${apiUrl}/get_articles/`),
          axios.get(`${apiUrl}/get_patient_stories/`),
        ]);

        const articlesData = articlesRes.data.results || [];
        const storiesData = storiesRes.data.results || [];

        setArticles(selectUniqueTagItems(articlesData, 9));
        setPatientStories(selectUniqueTagItems(storiesData, 9));
      } catch (err) {
        console.error("API Fetch Error:", err.response?.data || err.message);
        setError("Failed to load content. Please check the backend API.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // The selectUniqueTagItems function
  const selectUniqueTagItems = (items, maxCount) => {
    if (items.length === 0) return [];

    // Shuffle the items first
    const shuffledItems = [...items].sort(() => 0.5 - Math.random());

    // Step 1: Try to select items with unique tags first
    const tagMap = new Map();
    const selectedItems = new Set();

    shuffledItems.forEach((item) => {
      if (selectedItems.size >= maxCount) return;

      const tags = Object.values(item.selectedTags || {});

      // If the item has tags, try to find a unique one
      if (tags.length > 0) {
        for (const tag of tags) {
          if (!tagMap.has(tag) && selectedItems.size < maxCount) {
            tagMap.set(tag, true);
            selectedItems.add(item);
            break;
          }
        }
      }
      // If no unique tag was found but we still need items, add it anyway
      else if (selectedItems.size < maxCount && !selectedItems.has(item)) {
        selectedItems.add(item);
      }
    });

    // Step 2: If we still need more items, add any remaining ones
    if (selectedItems.size < maxCount) {
      for (const item of shuffledItems) {
        if (selectedItems.size >= maxCount) break;
        if (!selectedItems.has(item)) {
          selectedItems.add(item);
        }
      }
    }

    return Array.from(selectedItems);
  };

  return (
    <div className="bg-white">
      {/* Banner Section */}
      <motion.div
        className={`text-white py-20 text-center transition-all duration-1000 ${animationCompleted
            ? "bg-gradient-to-r from-purple-600 to-orange-500"
            : ""
          }`}
        initial={{
          background: "conic-gradient(from 0deg, #ff8000, #8a2be2, #ff8000)",
        }}
        animate={{
          background: animationCompleted
            ? "linear-gradient(to right, #8a2be2, #ff8000)"
            : [
              "conic-gradient(from 0deg, #ff8000, #8a2be2, #ff8000)",
              "conic-gradient(from 120deg, #8a2be2, #ff8000, #8a2be2)",
              "conic-gradient(from 240deg, #ff8000, #8a2be2, #ff8000)",
              "linear-gradient(to right, #8a2be2, #ff8000)",
            ],
        }}
        transition={{ duration: 4, ease: "easeInOut" }}
        onAnimationComplete={() => setAnimationCompleted(true)}
      >
        <h1 className="text-5xl font-extrabold tracking-wide leading-snug drop-shadow-lg">
          Welcome to TheraMind Education
        </h1>
        <p className="mt-6 text-lg md:text-xl max-w-xl mx-auto font-light">
          Empowering individuals through education to foster understanding and
          support for mental health issues within the Pakistani context.{" "}
          <span className="font-semibold">
            Join us in breaking the silence and stigma surrounding mental
            health.
          </span>
        </p>
      </motion.div>

      {/* Aim Section - Completely Revamped */}
      <motion.div
        className="py-20 px-8 max-w-7xl mx-auto bg-gradient-to-r from-purple-50 to-orange-50 shadow-2xl border border-purple-200 overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <div className="flex flex-col md:flex-row items-center gap-12 relative">
          {/* Text Section - Enhanced */}
          <div className="md:w-1/2 p-6 z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-4">
                Our Mission
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent leading-tight">
                Why Mental Health Education Matters
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-orange-400 rounded-full my-5"></div>
              <p className="mt-5 text-gray-700 text-lg leading-relaxed">
                In Pakistan, mental health remains an overlooked challenge.
                Misinformation, stigma, and lack of awareness keep individuals
                from seeking the help they need.
              </p>
              <p className="mt-4 font-semibold text-gray-900 text-lg leading-relaxed">
                Our mission is to spread knowledge, reduce stigma, and empower
                people to prioritize mental well-being.
              </p>
              <p className="mt-4 text-gray-700 leading-relaxed">
                By fostering open conversations and education, we can build a
                compassionate society where mental well-being is understood,
                respected, and prioritized by all.
              </p>
            </motion.div>
          </div>

          {/* SVG Illustration Section - Now using imported component */}
          <div className="md:w-1/2 flex justify-center items-center relative">
            <motion.div
              className="relative w-full max-w-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              {/* Using imported SVG component */}
              <MentalHealthIllustration />

              {/* Floating decoration elements */}
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-orange-100 rounded-full opacity-60"></div>
              <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-purple-100 rounded-full opacity-60"></div>
            </motion.div>
          </div>
        </div>

        {/* Stats Section - Updated with your requirements */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          {/* Card 1: Expert Articles */}
          <motion.div
            className="bg-white p-6 shadow-lg border border-purple-100 rounded-3xl"
            whileHover={{
              scale: 1.02,
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-purple-700 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mt-2">
              Expert Articles
            </h3>
            <p className="text-gray-600 mt-2">
              Access valuable resources written by healthcare professionals. Our
              platform provides expert opinions from doctors specializing in
              mental health, offering evidence-based insights and professional
              guidance.
            </p>
          </motion.div>

          {/* Card 2: Patient Stories */}
          <motion.div
            className="bg-white p-6 shadow-lg border border-purple-100 rounded-3xl"
            whileHover={{
              scale: 1.02,
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-orange-500 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mt-2">
              Patient Stories
            </h3>
            <p className="text-gray-600 mt-2">
              Read personal journeys shared by our community members. These
              stories highlight both resilience and challenges faced during
              mental health journeys, creating connection and reducing
              isolation.
            </p>
          </motion.div>

          {/* Card 3: Advocacy */}
          <motion.div
            className="bg-white p-6 shadow-lg border border-purple-100 rounded-3xl"
            whileHover={{
              scale: 1.02,
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-purple-700 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mt-2">Advocacy</h3>
            <p className="text-gray-600 mt-2">
              Working to reduce stigma and promote policies that support mental
              health services for all. Join our efforts to create positive
              change in how society approaches mental health.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Loading and Error Handling */}
      {loading && (
        <p className="text-center text-gray-600">Loading content...</p>
      )}
      {error && <p className="text-center text-red-600">{error}</p>}

      {/* Articles Section */}
      {!loading && !error && (
        <Section
          title="Explore Expert-Led Articles"
          description="Read insightful articles written by mental health professionals, covering anxiety, depression, and more."
          items={articles}
          emptyMessage="No articles available yet. Stay tuned for expert insights."
          buttonText="Explore More Articles"
          buttonLink="/articles"
          buttonClass="bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white"
          titleColor="text-orange-600"
          type="article"
        />
      )}

      {/* Patient Stories Section */}
      {!loading && !error && (
        <Section
          title="Explore Real-Life Patient Stories"
          description="Discover inspiring stories from individuals who have faced mental health challenges and found strength in their journey."
          items={patientStories}
          emptyMessage="No patient stories available yet. Check back soon!"
          buttonText="Explore More Stories"
          buttonLink="/patient-stories"
          buttonClass="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white"
          titleColor="text-purple-600"
          type="story"
        />
      )}

      <Footer />
    </div>
  );
}

const Section = memo(
  ({
    title,
    description,
    items,
    emptyMessage,
    buttonText,
    buttonLink,
    buttonClass,
    titleColor,
    type,
  }) => {
    const navigate = useNavigate();

    return (
      <motion.div
        className="py-16 px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.7 }}
      >
        <h2 className={`text-3xl font-bold text-center mb-4 ${titleColor}`}>
          {title}
        </h2>
        <p className="text-center text-gray-600 mb-6">{description}</p>

        {items.length === 0 ? (
          <p className="text-center text-gray-500">{emptyMessage}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const previewText = item.content
                ? DOMPurify.sanitize(item.content)
                  .replace(/<[^>]+>/g, "")
                  .substring(0, 150) + "..."
                : "No content preview available.";

              return (
                <EducationCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  content={previewText}
                  author={item.author_name}
                  date={new Date(item.date_time).toLocaleDateString()}
                  tags={Object.values(item.selectedTags || {})}
                  type={type}
                />
              );
            })}
          </div>
        )}

        <div className="text-center mt-8">
          <Link to={buttonLink}>
            <button
              className={`${buttonClass} px-6 py-3 rounded-lg shadow-md font-semibold`}
            >
              {buttonText}
            </button>
          </Link>
        </div>
      </motion.div>
    );
  }
);
