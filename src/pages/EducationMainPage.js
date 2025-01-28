import React, { memo } from "react";
import { motion } from "framer-motion";
import EducationCard from "../components/EducationCard";

export default function EducationMainPage() {
  const articles = [
    {
      id: 1,
      title: "Understanding Anxiety",
      content: "Learn about the signs, symptoms, and ways to manage anxiety...",
      author: "Dr. Smith",
      date: "2025-01-20",
      tags: ["Mental Health", "Anxiety"],
    },
    {
      id: 2,
      title: "Coping with Depression",
      content:
        "Discover strategies to cope with depression and improve your mood...",
      author: "Dr. Jones",
      date: "2025-01-22",
      tags: ["Depression", "Wellness"],
    },
  ];

  const patientStories = [
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
  ];

  return (
    <div className="bg-white">
      {/* Banner Section with Framer Motion */}
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
          In Pakistan, where mental health issues are often underreported and
          misunderstood, mental health education plays a crucial role in
          fostering awareness and creating an environment where individuals can
          seek help without fear of judgment. Our mission is to spread knowledge
          about mental health, reduce stigma, and equip people with the tools to
          support their own well-being and that of others. By integrating mental
          health education into communities and schools, we strive to create a
          more resilient society.
        </p>
      </motion.div>

      {/* Articles Section */}
      <Section
        title="Explore Expert-Led Articles"
        description="Read insightful articles written by mental health professionals, covering a wide range of topics such as anxiety, depression, and more."
        items={articles}
        buttonText="Explore More Articles"
        buttonClass="bg-orange-500 text-white hover:bg-orange-600"
        titleColor="text-orange-500" // Ensuring title color matches the orange theme
      />

      {/* Patient Stories Section */}
      <Section
        title="Real-Life Patient Stories"
        description="Discover inspiring stories from individuals who have faced mental health challenges and found strength in their journey."
        items={patientStories}
        buttonText="Explore More Stories"
        buttonClass="bg-purple-500 text-white hover:bg-purple-600"
        titleColor="text-purple-500" // Ensuring title color matches the purple theme
      />
    </div>
  );
}

const Section = memo(
  ({ title, description, items, buttonText, buttonClass, titleColor }) => (
    <motion.div
      className="py-16 px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.7 }}
    >
      <h2 className={`text-3xl font-bold text-center mb-4 ${titleColor}`}>
        {title}
      </h2>
      <p className="text-center text-gray-600 mb-6">{description}</p>{" "}
      {/* Reduced bottom margin for consistency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <EducationCard
            key={item.id}
            title={item.title}
            content={item.content}
            author={item.author}
            date={item.date}
            tags={item.tags}
            onClick={() => console.log(`Navigate to ${item.id}`)}
          />
        ))}
      </div>
      <div className="text-center mt-8">
        {" "}
        {/* Reduced top margin for better spacing */}
        <button className={`${buttonClass} px-6 py-2 rounded-lg shadow-md`}>
          {buttonText}
        </button>
      </div>
    </motion.div>
  )
);
