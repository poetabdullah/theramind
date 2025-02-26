import React from "react"
import { motion } from "framer-motion"
import Footer from "../components/Footer"

const AboutUs = () => {
  return (
    <div className="flex flex-col min-h-screen bg-orange-50">
      <header className="text-center py-4">
        <motion.h1 className="text-3xl font-bold text-purple-700 mt-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>About Us</motion.h1>
      </header>
      <main className="flex-grow flex flex-col space-y-6 items-center mb-5">
    <motion.div
          className="service-item bg-white shadow-sm bg-gradient-to-r from-purple-200 to-orange-200
           rounded-lg p-6 mt-2 w-11/12 max-w-4xl transition duration-300 hover:scale-105 slideUp"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          whileHover={{ scale: 1.05 }}
    >
          <motion.h3 className="text-2xl font-bold text-purple-700 mb-2">
            Who We Are
      </motion.h3>
      <p className="leading-relaxed text-gray-700">
            Theramind is a mental health platform that provides a wide range of mental health services
            to individuals, families, and organizations. We are dedicated to providing the best mental
            health services to our clients. Our team of mental health professionals are highly trained
            and experienced in providing mental health services. We are committed to helping our clients
            achieve their mental health goals and live a happy and fulfilling life.
        </p>
        </motion.div>
        <motion.div
          className="service-item bg-white shadow-sm rounded-lg p-4 mt-4 w-11/12 max-w-4xl transition duration-300 hover:scale-105"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.h3 className="text-2xl font-bold text-purple-700 mb-2">
            Our Scope
          </motion.h3>
          <p>
            Theramind target the following mental health conditions & its sub-types:
            </p>
            <ul className="list-disc list-inside space-y-2">
            {[
              "Stress(Acute Stress, Chronic Stress, Post-Traumatic Stress Disorder - PTSD)",
              "Anxiety (Separation Anxiety, Generalized Anxiety Disorder, Panic Disorder)",
              "Depression (Post-Partum Depression, Major Depressive Disorder, Atypical Depression)",
              "Trauma (Single Event Trauma, Complex Trauma, Developmental Trauma)",
              "Obsessive Compulsive Disorder - OCD (Contamination OCD, Checking OCD, Symmetry OCD)"
              ].map((condition, index) => (
                <motion.li key={index} 
                className="text-gray-700 flex items-center space-x-2 cursor-pointer transition duration-300 hover:text-orange-600"
                whileHover={{ scale: 1.05 }}
            >
              <span className="w-2 h-2 bg-puple-700 rounded-full flex-shrink-0"></span>
              <span>{condition}</span>
            </motion.li>
              ))}
            </ul>
        </motion.div>
        <motion.div
          className="service-item bg-white shadow-sm bg-gradient-to-r from-purple-200 to-orange-200 rounded-lg p-6 mt-4 w-11/12 max-w-4xl transition duration-300 hover:scale-105"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.h3 className="text-2xl font-bold text-purple-700 mb-2">
            Our Vision & Mission
          </motion.h3>
          <p className="leading-relaxed text-gray-700">
            This platform thrives to achieve a world where seeking help for mental health conditions 
            is free of any judgement and it is freely accesible to whoever needs it without much effort 
            & where people feel understood and valued, because your mental health matter!<br></br>
            Our platform gives adequate features which help people identify the possible mental health
            conditions they must be going through and get properly educated about those conditions and
            how to treat them. We also provide contacts of professionals that people can connect with to
            hear them & help them get healed.
          </p>
        </motion.div>
        <motion.div
          className="service-item bg-white shadow-sm bg-gradient-to-r from-purple-200 to-orange-200 rounded-lg p-6 mt-4 w-11/12 max-w-4xl transition duration-300 hover:scale-105"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.h3 className="text-2xl font-bold text-purple-700 mb-2">
            What We Offer
          </motion.h3>
          <p className="leading-relaxed text-gray-700">
            List of key features our platform offers:
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <a href="/questionnaire" 
                className="text-purple-700 font-medium transition duration-200 hover:text-orange-500 
                hover:underline">Mental Health Diagnostic Assessment
                </a><span> - Self-assessment tool to identify the mental health condition and its sub-type.
                </span>
              </li>
              <li>
                <a href="/education-main"
                  className="text-purple-700 font-medium transition duration-200 hover:text-orange-500 
                hover:underline">Mental Health Educational Articles & User Stories
                </a><span> - Educational articles & user stories to motivate people,
                  that they are not alone in this healing journey.
                </span>
              </li>
              <li>
                <a href="/therachat"
                  className="text-purple-700 font-medium transition duration-200 hover:text-orange-500 
                hover:underline">Mental Health ChatBot
                </a><span> - An AI chatbot that can give responses to queries related to mental health.
                </span>
              </li>
              <li>
                <a href="/meditation"
                  className="text-purple-700 font-medium transition duration-200 hover:text-orange-500 
                hover:underline">Mental Health Meditation Exercises
                </a><span> - Self-healing meditation and mindful
                  exercises that can help relieve stress and other issues, which will ultimately help you heal.
                </span>
              </li>
            </ul>
          </p>
        </motion.div>
        <motion.div
          className="service-item bg-white shadow-sm bg-gradient-to-r from-purple-200 to-orange-200 rounded-lg p-6 mt-4 w-11/12 max-w-4xl transition duration-300 hover:scale-105"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.h3 className="text-2xl font-bold text-purple-700 mb-2">
            Why Choose Us
          </motion.h3>
          <p className="leading-relaxed text-gray-700">
            We are dedicated to provide the best mental health services backed by psychology experts,
            AI-personalized recommendations, user-friendly and accessible platform, which ensures
            complete confidentiality of our clients. We are committed to help our clients achieve
            their mental health goals and live a happy and fulfilling life.
          </p>
        </motion.div>
        <motion.div
          className="service-item bg-white shadow-sm bg-gradient-to-r from-purple-200 to-orange-200 rounded-lg p-6 mt-4 w-11/12 max-w-4xl transition duration-300 hover:scale-105"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.h3 className="text-2xl font-bold text-purple-700 mb-2">
            Commitment To Privacy & Security
          </motion.h3>
          <p className="leading-relaxed text-gray-700">
            We assure you that your data is private and confidential with us. We are committed to
            protecting your privacy and security. We follow strict privacy and security protocols to
            ensure that your data is safe and secure. We do not share your data with any third party.
          </p>
        </motion.div>
        <motion.div
          className="service-item bg-white shadow-sm bg-gradient-to-r from-purple-200 to-orange-200 rounded-lg p-6 mt-4 w-11/12 max-w-4xl transition duration-300 hover:scale-105"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.h3 className="text-2xl font-bold text-purple-700 mb-2">
            Get In Touch
          </motion.h3>
          <p className="leading-relaxed text-gray-700">
            You can react out to us through the following links:
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <a href="/instagram"
                  className="text-purple-700 font-medium transition duration-200 hover:text-orange-500 
                hover:underline">Instagram
                </a><span> - theramind
                </span>
              </li>
              <li>
                <a href="/facebook"
                  className="text-purple-700 font-medium transition duration-200 hover:text-orange-500 
                hover:underline">Facebook
                </a><span> - TheraMind
                </span>
              </li>
              <li>
                <a href="/twitter"
                  className="text-purple-700 font-medium transition duration-200 hover:text-orange-500 
                hover:underline">Twitter
                </a><span> - theramind
                </span>
              </li>
            </ul>
          </p>
        </motion.div>
      </main>
      <Footer />    
      </div> 
      
    
  )
}

export default AboutUs;