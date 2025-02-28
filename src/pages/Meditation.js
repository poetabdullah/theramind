import React from 'react';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const Meditation = () => {
  const videos = [
    { id: 1, title: 'Morning Meditation', url: 'https://www.youtube.com/embed/8bBPJ1EEUCc?si=1QgsBtgCl_S5jE9y' },
    { id: 2, title: 'Stress Relief', url: 'https://www.youtube.com/embed/-9KLB2HI9BI?si=Ytf_hwiZ1LSDSEDk' },
    { id: 3, title: 'Sleep Meditation', url: 'https://www.youtube.com/embed/DBhadQTCBeo?si=QYE3xleLTLBkpnur' },
    { id: 4, title: 'Anxiety Relief', url: 'https://www.youtube.com/embed/9yj8mBfHlMk?si=Ca8AcEJ_Euo_dABI' },
    { id: 5, title: 'Focus Enhancement', url: 'https://www.youtube.com/embed/inpok4MKVLM?si=alPg8wWK456zocke' },
    { id: 6, title: 'Deep Relaxation', url: 'https://www.youtube.com/embed/O-6f5wQXSu8?si=9DrEseHNNK4EoDy8' },
    { id: 7, title: 'Mindful Living', url: 'https://www.youtube.com/embed/ssss7V1_eyA?si=G5I0qNdsAtjyCueJ' },
    { id: 8, title: 'Inner Peace', url: 'https://www.youtube.com/embed/2LjHKZQLrkg?si=GIqww_Ftktkh1Lfa' },
    { id: 9, title: 'Healing Meditation', url: 'https://www.youtube.com/embed/liwbUMPVKoI?si=4X2LgnR9k0olM7Ru' }
  ];

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

      <section className="meditation-types">
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          {[
            "Your Mind, Your Sanctuary",
            "Breathe In Calm, Breathe Out Stress",
            "Conscious Sleep, Deep Relaxation",
            "Tune into Your Body, Tune Out Your Mind",
            "Let Go of Stress, One Muscle at a Time",
            "Cultivate Compassion, Heal the World"
          ].map((text, index) => (
            <motion.li
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="meditation-item"
            >
              {text}
            </motion.li>
          ))}
        </motion.ul>
      </section>

      <section className="video-gallery">
        <div className="video-grid">
          {videos.map((video) => (
            <motion.div
              key={video.id}
              whileHover={{ scale: 1.05 }}
              className="video-card"
            >
              <div className="video-placeholder">
                <iframe
                  title={video.title}
                  width="100%"
                  height="100%"
                  src={video.url}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <h3 className="video-title">{video.title}</h3>
            </motion.div>
         
     ))}
        </div>
      </section>

    </div>
  );
};

export default Meditation;
