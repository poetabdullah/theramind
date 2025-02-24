import React from "react";
import "./questionnaire.css";
import { motion } from "framer-motion";
import Footer from "../components/Footer";

const NoDiagnosedCondition = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow flex items-center justify-center mb-5">
        <motion.div className="bg-white shadow-lg rounded-lg p-4 mt-4 w-full max-w-xl">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Thank you for taking TheraMind's diagnostic questionnaire!
          </h3>
          <p className="text-lg text-gray-600">
            Based on your responses, you are not diagnosed with any of the mental health conditions.
          </p>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default NoDiagnosedCondition;
