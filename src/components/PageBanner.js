import React from "react";
import { motion } from "framer-motion";

const PageBanner = ({ title, subtitle, background }) => {
  return (
    <div
      className={`relative py-20 flex flex-col items-center justify-center ${background}`}
    >
      {/* Glassmorphic Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <motion.div
        className="relative text-center text-white max-w-3xl px-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-5xl font-extrabold tracking-wide drop-shadow-lg">
          {title}
        </h1>
        <p className="mt-4 text-lg font-medium opacity-90">{subtitle}</p>
      </motion.div>
    </div>
  );
};

export default PageBanner;
