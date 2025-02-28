import React from 'react';
import { motion } from 'framer-motion';
import VideoGallery from '../components/VideoGallery';
import MeditationTypes from '../components/MeditationTypes';
import Footer from '../components/Footer';

const Meditation = () => {
  return (
    <div className="meditation-container">
      <header className="meditation-header">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="title"
        >
          Mindfulness Meditation
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="subtitle"
        >
          Find your inner peace through mindful meditation
        </motion.p>
      </header>

      <MeditationTypes />
      <VideoGallery />
      <Footer />
      
    </div>
  );
};

export default Meditation;