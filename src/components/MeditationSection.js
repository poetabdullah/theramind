import React from "react";
import { motion } from "framer-motion";

const MeditationSection = () => {
  return (
    <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-10">
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ 
          opacity: 1, 
          x: 0,
          transition: { duration: 0.5 } 
        }}
        className="w-full md:w-1/2 flex justify-center"
      >
        <img 
          src="https://img.freepik.com/free-vector/yoga-school-instructor-meditation-practice-relaxation-techniques-body-stretching-exercises-female-yogi-lotus-pose-spiritual-balance-guru_335657-3611.jpg?t=st=1740750744~exp=1740754344~hmac=1ed13d23b577be54fab3d87a4518af3408b12449e81d799a9394e9b0e4480c56&w=740" 
          alt="Peaceful Meditation" 
          className="max-w-full h-auto object-contain rounded-lg shadow-lg"
        />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ 
          opacity: 1, 
          x: 0,
          transition: { duration: 0.5 } 
        }}
        className="w-full md:w-1/2 flex flex-col space-y-4"
      >
        <h2 className="text-3xl font-bold text-purple-700">
          What is Mindfulness Meditation?
        </h2>
        <p className="text-lg text-gray-600 mb-4">
          Join us and learn the science behind mindfulness, as well as practical,
          scientifically-proven techniques for reducing stress and cultivating well-being.
        </p>
        <motion.a 
          href="/meditation" 
          className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-md hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Explore Meditation
        </motion.a>
      </motion.div>
    </div>
  );
};

export default MeditationSection;