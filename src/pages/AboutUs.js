import React from "react";
import { motion } from "framer-motion";
import Footer from "../components/Footer";

const AboutUs = () => {
  return (
    <div className="flex flex-col min-h-screen bg-orange-50">
      <header className="meditation-header relative bg-gradient-to-r from-purple-600 to-orange-500 py-20">
        {/* Animated Heading */}
        <motion.h1
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
          className="text-6xl font-extrabold text-white text-center mb-4 tracking-wide"
        >
          About Us
        </motion.h1>

        {/* Animated Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
          className="mt-6 text-lg md:text-xl max-w-2xl mx-auto font-light text-white text-center"
        >
          TheraMind is a mental health platform dedicated to providing accessible and compassionate mental
          health support for individuals, families, and organizations. Our goal is to break the stigma
          surrounding mental health and create a safe space for people to understand, manage, and improve
          their well-being.
        </motion.p>
      </header>

      <main className="flex-grow flex flex-col items-center bg-gradient-to-r from-purple-150 to-orange-150 pb-10">
        {/* Who We Are */}
        <motion.div
          className="service-item bg-white shadow-sm rounded-lg p-6 mt-4 w-11/12 max-w-4xl transition duration-300 hover:scale-105"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.h3 className="text-4xl font-extrabold text-purple-700 mb-2">
            Who We Are
          </motion.h3>
          <p className="leading-relaxed text-black">
            TheraMind brings together a team of dedicated mental health professionals, technology experts,
            and advocates committed to enhancing mental health awareness. Our platform offers AI-driven support,
            educational resources, and access to professional help, ensuring that anyone struggling with mental
            health challenges has a place to turn to.
          </p>
        </motion.div>

        {/* Our Scope */}
        <motion.div
          className="service-item bg-white shadow-sm rounded-lg p-4 mt-4 w-11/12 max-w-4xl transition duration-300 hover:scale-105"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.h3 className="text-4xl font-extrabold text-purple-700 mb-2">
            Our Scope
          </motion.h3>
          <motion.p>
            We specialize in identifying and addressing a range of mental health conditions, including:
          </motion.p>
          <motion.ul className="list-disc list-inside space-y-2">
            {[
              "Stress (Acute Stress, Chronic Stress, Post-Traumatic Stress Disorder - PTSD)",
              "Anxiety (Separation Anxiety, Generalized Anxiety Disorder, Panic Disorder)",
              "Depression (Post-Partum Depression, Major Depressive Disorder, Atypical Depression)",
              "Trauma (Single Event Trauma, Complex Trauma, Developmental Trauma)",
              "Obsessive Compulsive Disorder - OCD (Contamination OCD, Checking OCD, Symmetry OCD)"
            ].map((condition, index) => (
              <motion.li
                key={index}
                className="text-gray-700 cursor-pointer transition duration-300 hover:text-orange-600"
                whileHover={{ scale: 1.05 }}
              >
                {condition}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Our Vision & Mission */}
        <motion.div
          className="service-item bg-white shadow-sm rounded-lg p-6 mt-4 w-11/12 max-w-4xl transition duration-300 hover:scale-105"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.h3 className="text-4xl font-extrabold text-purple-700 mb-2">
            Our Vision & Mission
          </motion.h3>
          <p className="leading-relaxed text-black">
            Our vision is a world where seeking mental health support is free of judgment and accessible to
            all. We believe that mental well-being should be a priority, not a privilege. Through our
            platform, we strive to empower individuals by offering self-assessment tools, educational
            resources, and direct access to professional support.
          </p>
        </motion.div>

        {/* What We Offer */}
        <motion.div
          className="service-item bg-white shadow-sm rounded-lg p-6 mt-4 w-11/12 max-w-4xl transition duration-300 hover:scale-105"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.h3 className="text-4xl font-extrabold text-purple-700 mb-2">
            What We Offer
          </motion.h3>
          <motion.p className="leading-relaxed text-gray-700">
            TheraMind provides a range of features to help users navigate their mental health journey:
            <motion.ul className="list-disc pl-5 space-y-2">
              <motion.li>
                <motion.a href="/start-screen"
                  className="text-purple-700 font-medium transition duration-200 hover:text-orange-500 
                hover:underline">Mental Health Diagnostic Assessment
                </motion.a><span> – A self-assessment tool to help individuals identify potential mental health conditions.
                </span>
              </motion.li>
              <motion.li>
                <motion.a href="/education-main"
                  className="text-purple-700 font-medium transition duration-200 hover:text-orange-500 
                hover:underline">Mental Health Educational Articles & User Stories
                </motion.a><span> – Insights into mental health topics and personal stories that inspire and educate.
                </span>
              </motion.li>
              <motion.li>
                <motion.a href="/splash-screen"
                  className="text-purple-700 font-medium transition duration-200 hover:text-orange-500 
                hover:underline">Mental Health ChatBot
                </motion.a><span> – An interactive chatbot that provides mental health information and support.
                </span>
              </motion.li>
              <motion.li>
                <motion.a href="/meditation"
                  className="text-purple-700 font-medium transition duration-200 hover:text-orange-500 
                hover:underline">Mental Health Meditation Exercises
                </motion.a><span> – Guided exercises designed to reduce stress and improve emotional resilience.
                </span>
              </motion.li>
            </motion.ul>
          </motion.p>
        </motion.div>

        {/* Why Choose Us */}
        <motion.div
          className="service-item bg-white shadow-sm rounded-lg p-6 mt-4 w-11/12 max-w-4xl transition duration-300 hover:scale-105"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.h3 className="text-4xl font-extrabold text-purple-700 mb-2">
            Why Choose Us
          </motion.h3>
          <motion.p className="leading-relaxed text-gray-700">
            TheraMind is built on a foundation of scientific research, expert guidance, and user-centric design. We provide:
            <motion.li>AI-driven mental health insights</motion.li>
            <motion.li>Confidential and secure support</motion.li>
            <motion.li>Professional recommendations</motion.li>
            <motion.li>A welcoming and stigma-free environment</motion.li>
          </motion.p>
        </motion.div>

        {/* Commitment to Privacy */}
        <motion.div
          className="service-item bg-white shadow-sm rounded-lg p-6 mt-4 w-11/12 max-w-4xl transition duration-300 hover:scale-105"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.h3 className="text-2xl font-extrabold text-purple-700 mb-2">
            Commitment to Privacy & Security
          </motion.h3>
          <p className="leading-relaxed text-black">
            Your mental health journey is personal, and we respect your privacy. TheraMind follows strict
            data security and confidentiality protocols to ensure that your information remains protected
            at all times.
          </p>
        </motion.div>

        {/* Get in Touch */}
        <motion.div
          className="service-item bg-white shadow-sm rounded-lg p-6 mt-4 w-11/12 max-w-4xl transition duration-300 hover:scale-105"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.h3 className="text-4xl font-extrabold text-purple-700 mb-2">
            Get In Touch
          </motion.h3>
          <motion.p className="leading-relaxed text-gray-700">
            We’d love to connect with you! Follow us on social media for updates and mental health insights:
            <motion.ul className="list-disc pl-5 space-y-2">
              <motion.li>
                <motion.a href="https://www.instagram.com/theramind.web?igsh=Y3hucWx6Zzdrbzhh"
                  className="text-purple-700 font-medium transition duration-200 hover:text-orange-500 
                hover:underline">Instagram
                </motion.a><span> - theramind.web
                </span>
              </motion.li>
              <motion.li>
                <motion.a href="mailto:theramind.web@gmail.com"
                  className="text-purple-700 font-medium transition duration-200 hover:text-orange-500 
                hover:underline">Gmail
                </motion.a><span> - theramind.web@gmail.com
                </span>
              </motion.li>
            </motion.ul>
          </motion.p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
