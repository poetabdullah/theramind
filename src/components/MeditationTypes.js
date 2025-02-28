import React from "react";
import { motion } from 'framer-motion';

const MeditationTypes = () => {
    const types = [
      { text: "Your Mind, Your Sanctuary", content: "Meditation helps you find a peaceful space within yourself." },
      { text: "Breathe In Calm, Breathe Out Stress", content: "Focus on deep breathing to release stress and tension." },
      { text: "Conscious Sleep, Deep Relaxation", content: "Practice mindful relaxation for improved sleep quality." },
      { text: "Tune into Your Body, Tune Out Your Mind", content: "Feel each breath and movement as you connect with yourself." },
      { text: "Let Go of Stress, One Muscle at a Time", content: "Progressive muscle relaxation helps in releasing built-up stress." },
      { text: "Cultivate Compassion, Heal the World", content: "Through loving-kindness meditation, develop empathy and kindness." }
    ];
  
    return (
      <section className="meditation-types">
        <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.8 }}>
          {types.map((item, index) => (
            <motion.li
              key={index}
              whileHover={{ scale: 1.02, backgroundColor: '#ffdde1' }}
              whileTap={{ scale: 0.98 }}
              className="meditation-item"
            >
              <span>{item.text}</span>
              <motion.p className="hidden-content" initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}>
                {item.content}
              </motion.p>
            </motion.li>
          ))}
        </motion.ul>
      </section>
    );
  };

  export default MeditationTypes;