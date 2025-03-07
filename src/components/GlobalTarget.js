import React from 'react';
import { motion } from 'framer-motion';

const GlobalTarget = () => {
  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center">
      <motion.h1
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          transition: {
            duration: 0.5,
            type: "spring",
            bounce: 0.4
          }
        }}
        className="text-5xl font-bold text-center mb-10 transition-all duration-300 hover:text-pink-500 hover:scale-105"
        style={{ color: '#FF6347' }}
      >
        TheraMinds Goal
      </motion.h1>

      <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-10">
        <div 
          className="w-full md:w-1/3 bg-[#FF7F50] p-6 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-pink-400 cursor-pointer group"
        >
          <div className="flex items-center justify-center mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 64 64" 
              className="w-24 h-24 transition-transform duration-300 group-hover:rotate-12"
            >
              <rect x="4" y="4" width="56" height="56" fill="#FF6347" rx="10" ry="10"/>
              <path 
                d="M32 16c-8.84 0-16 7.16-16 16s7.16 16 16 16 16-7.16 16-16-7.16-16-16-16zm8 18h-6v6a2 2 0 01-4 0v-6h-6a2 2 0 010-4h6v-6a2 2 0 014 0v6h6a2 2 0 010 4z" 
                fill="white"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-4 transition-colors duration-300 group-hover:text-pink-200">
            SDG Target 3.4
          </h2>
          <p className="text-white text-center transition-colors duration-300 group-hover:text-pink-100">
            Reduce premature mortality from non-communicable diseases and promote mental health
          </p>
        </div>

        <div 
          className="w-full md:w-2/3 bg-[#FFF4E0] p-8 rounded-lg shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
        >
          <h3 className="text-3xl font-semibold mb-6 text-[#FF6347] transition-colors duration-300 hover:text-pink-500">
            Our Commitment
          </h3>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.5 } 
            }}
            className="text-lg text-gray-800 mb-4"
          >
            TheraMinds is dedicated to addressing the global challenge of reducing mortality from non-communicable diseases and enhancing mental health support. Our platform is strategically designed to contribute to this critical goal by:
          </motion.p>
          <ul className="list-disc pl-6 text-gray-700 space-y-3">
            {['Early Detection', 'Preventive Care', 'Holistic Support', 'Global Awareness'].map((item, index) => (
              <motion.li 
                key={item}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  transition: { 
                    duration: 0.5,
                    delay: index * 0.2 
                  } 
                }}
                className="transition-all duration-300 hover:translate-x-4 hover:text-pink-600 cursor-pointer"
              >
                <strong>{item}:</strong> {getDescription(item)}
              </motion.li>
            ))}
          </ul>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { 
                duration: 0.5,
                delay: 1 
              } 
            }}
            className="mt-6 text-lg text-gray-800"
          >
            By 2030, we aim to empower millions in their journey towards better mental health and reduced disease vulnerability.
          </motion.p>
        </div>
      </div>
    </div>
  );
};

// Helper function to get descriptions
const getDescription = (item) => {
  const descriptions = {
    'Early Detection': 'Providing advanced screening tools to identify mental health risks and potential non-communicable disease indicators early.',
    'Preventive Care': 'Offering personalized mental health resources, lifestyle guidance, and preventive strategies to mitigate disease risks.',
    'Holistic Support': 'Creating a comprehensive ecosystem of mental health professionals, support groups, and evidence-based interventions.',
    'Global Awareness': 'Educating users about the importance of mental health and proactive health management.'
  };
  return descriptions[item];
};

export default GlobalTarget;