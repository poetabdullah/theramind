import React from "react";
import { motion } from "framer-motion";

const benefits = [
  { 
    title: "Reduces Stress", 
    description: "Meditation helps lower stress levels and promotes relaxation." 
  },
  { 
    title: "Improves Focus", 
    description: "Enhance your concentration and cognitive abilities through mindfulness." 
  },
  { 
    title: "Emotional Well-being", 
    description: "Helps in managing emotions and reducing anxiety." 
  },
];

const MeditationBenefits = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            className="relative overflow-hidden rounded-2xl shadow-lg"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 15px 30px rgba(0,0,0,0.2)"
            }}
            transition={{ 
              duration: 0.6,
              delay: index * 0.2,
              type: "spring",
              stiffness: 300
            }}
            viewport={{ once: true }}
          >
            <div 
              className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-400 opacity-90"
            ></div>
            
            <div className="relative z-10 p-6 text-white">
              <motion.h3 
                className="text-2xl font-bold mb-4 text-white"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 + 0.3 }}
              >
                {benefit.title}
              </motion.h3>
              
              <motion.p
                className="text-purple-100 leading-relaxed"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 + 0.4 }}
              >
                {benefit.description}
              </motion.p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MeditationBenefits;