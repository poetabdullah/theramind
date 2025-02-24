import React from "react";
import "./questionnaire.css";
import { motion } from "framer-motion";
import Footer from "../components/Footer";

const SuicidalThoughts = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow flex items-center justify-center mb-5">
        <motion.div className="bg-white shadow-lg rounded-lg p-4 mt-4 w-full max-w-xl">
          <h2 className="text-red-800 text-2xl font-bold">Suicidal Thoughts!</h2>
          <p className="text-lg text-gray-600">
            You have been diagnosed with Suicidal Thoughts. Please contact an emergency hotline. Your life is valuable, and we care for you.
          </p>
          <h3 className="text-lg font-semibold text-gray-700 mt-4">Emergency Hotlines:</h3>
          <p>
            <strong>Umang:</strong> (92) 0311 7786264 <br />
            <strong>Rozan:</strong> (92) 0304 111 1741 <br />
            <strong>Welfare Bureau:</strong> 1121
          </p>
          <p className="mt-4">
            If you are in immediate danger, please dial <strong>911</strong>. If you need someone to talk to, consider reaching out to a counselor or a trusted individual.
          </p>
          <p className="font-semibold mt-4">Your safety and well-being are a priority.</p>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default SuicidalThoughts;
