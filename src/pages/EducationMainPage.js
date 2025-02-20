import React, { useEffect, useState, memo } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Link } from "react-router-dom";
import EducationCard from "../components/EducationCard";
import { useNavigate } from "react-router-dom";

export default function EducationMainPage() {
  const [articles, setArticles] = useState([]);
  const [patientStories, setPatientStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl =
          process.env.REACT_APP_API_URL || "http://localhost:8000/api";

        const [articlesRes, storiesRes] = await Promise.all([
          axios.get(`${apiUrl}/get_articles/`),
          axios.get(`${apiUrl}/get_patient_stories/`),
        ]);

        console.log("Raw Articles Response:", articlesRes.data);

        // ✅ Extract articles from 'results' array
        const articlesData = articlesRes.data.results || [];
        const storiesData = storiesRes.data.results || [];

        console.log("Extracted Articles:", articlesData);

        setArticles(Array.isArray(articlesData) ? articlesData : []);
        setPatientStories(Array.isArray(storiesData) ? storiesData : []);
      } catch (err) {
        console.error("API Fetch Error:", err.response?.data || err.message);
        setError("Failed to load content. Please check the backend API.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white">
      {/* Banner Section */}
      <motion.div
        className="bg-gradient-to-r from-purple-600 to-orange-500 text-white py-20 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-5xl font-extrabold tracking-wide leading-snug">
          Welcome to TheraMind Education
        </h1>
        <p className="mt-6 text-lg md:text-xl max-w-xl mx-auto">
          Empowering individuals through education to foster understanding and
          support for mental health issues within the Pakistani context. Join us
          in breaking the silence and stigma surrounding mental health.
        </p>
      </motion.div>

      {/* Aim Section */}
      <motion.div
        className="py-16 px-6 text-center max-w-4xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-purple-700">
          Why Mental Health Education is Vital for Pakistan
        </h2>
        <p className="mt-4 text-gray-700">
          In Pakistan, where mental health issues are often under-reported and
          misunderstood, mental health education plays a crucial role in
          fostering awareness and creating an environment where individuals can
          seek help without fear of judgment. Our mission is to spread knowledge
          about mental health, reduce stigma, and equip people with the tools to
          support their own well-being and that of others. By integrating mental
          health education into communities and schools, we strive to create a
          more resilient society.
        </p>
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
          description="Read insightful articles written by mental health professionals, covering a wide range of topics such as anxiety, depression, and more."
          items={articles}
          emptyMessage="No articles available yet. Stay tuned for expert insights."
          buttonText="Explore More Articles"
          buttonLink="/articles"
          buttonClass="bg-orange-600 text-white hover:bg-orange-500"
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
          buttonClass="bg-purple-600 text-white hover:bg-purple-500"
          titleColor="text-purple-600"
          type="story"
        />
      )}
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

        {/* Handle case when no articles/stories are available */}
        {items.length === 0 ? (
          <p className="text-center text-gray-500">{emptyMessage}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <EducationCard
                key={item.id}
                id={item.id}
                title={item.title}
                content={
                  Array.isArray(item.content) && item.content.length > 0
                    ? `${item.content.slice(0, 3).join(" ")}...`
                    : "No content preview available."
                }
                author={item.author_name}
                date={new Date(item.date_time).toLocaleDateString()}
                tags={Object.values(item.selectedTags || {})}
                type={type} // ✅ Pass type to determine correct navigation
                onClick={() =>
                  navigate(
                    `/${type === "article" ? "articles" : "stories"}/${item.id}`
                  )
                }
              />
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link to={buttonLink}>
            <button className={`${buttonClass} px-6 py-2 rounded-lg shadow-md`}>
              {buttonText}
            </button>
          </Link>
        </div>
      </motion.div>
    );
  }
);
