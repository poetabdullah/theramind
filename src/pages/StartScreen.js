import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

const WelcomeScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-600 to-orange-500 text-white">
          {/* Animated Heading */}
          <motion.h1
            className="text-6xl font-extrabold text-center mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Welcome to TheraMind
          </motion.h1>

          {/* Animated Subtitle */}
          <motion.p
            className="text-lg text-center text-gray-200 max-w-lg mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            Our diagnostic questionnaire will help assess your mental well-being. Answer honestly for accurate insights.
          </motion.p>

          {/* Animated Start Button */}
          <motion.button
            className="px-6 py-3 bg-gradient-to-r from-purple-550 to-orange-550 font-bold text-lg text-white rounded-full shadow-lg hover:bg-purple-100 transition duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/questionnaire")}
          >
            Start Questionnaire
          </motion.button>

          {/* Disclaimer */}
          <motion.h4
            className="text-2xl font-bold text-center mt-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Disclaimer:
          </motion.h4>
          <motion.p
            className="text-lg text-center text-gray-200 max-w-5xl mt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            TheraMind's diagnostic questionnaire does not in any form try to substitute a professional's
            diagnosis, it just aims to provide a preliminary insights into potential mental health conditions.<br></br>
            This questionnaire is based on the following scales: Beck Depression Inventory (BDI), Beck Anxiety
            Inventory (BAI), Obsessive Compulsive Inventory-Revised (OCI-R), NSESSS, IES-R.
          </motion.p>
        </div>
      </main>
      <Footer />
    </div >
  );
};

export default WelcomeScreen;
