import React from "react";
import { motion } from "framer-motion";

const MeditationHeader = () => {
   return (
     <header className="meditation-header bg-gradient-to-r from-orange-500 via-pink-500 to-orange-600 py-24">
       <motion.h1
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.8 }}
         className="text-6xl font-bold text-white text-center mb-4"
       >
         Welcome to TheraMind Meditation
       </motion.h1>
       <motion.p
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 0.5, duration: 0.8 }}
         className="text-3xl text-white text-center"
       >
         Why Meditation is Important
       </motion.p>
     </header>
   );
};

export default MeditationHeader;