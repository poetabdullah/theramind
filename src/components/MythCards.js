import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const MythCards = () => {
  // Array of myth and fact pairs
  const mythsAndFacts = [
    {
      myth: "❌ Myth: If you can function, your Mental Health isn't that bad.",
      fact: "✅ Fact: High-functioning individuals can still struggle with serious mental health conditions."
    },
    {
      myth: "❌ Myth: Therapy is only for people with severe mental illness.",
      fact: "✅ Fact: Therapy helps anyone dealing with stress, anxiety, or life transitions."
    },
    {
      myth: "❌ Myth: Mental health problems are a sign of weakness.",
      fact: "✅ Fact: Mental health conditions are medical issues, not character flaws."
    },
    {
      myth: "❌ Myth: Talking about Mental Health makes things worse.",
      fact: "✅ Fact: Open conversations about Mental Health reduce stigma and encourage people to seek help."
    },
    {
      myth: "❌ People with mental illness are violent and dangerous.",
      fact: "✅ Fact: Most people with mental illness are not violent and are more likely to be victims than perpetrators."
    },
    {
      myth: "❌ You can just 'snap out of' Mental Health problems.",
      fact: "✅ Fact: Recovery from Mental Health conditions requires proper treatment and support."
    }
  ];

  // Container variants for the scroll animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  // Card variants for the scroll animation
  const cardVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      }
    }
  };

  // Track scroll position for animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.card-container');
    elements.forEach(el => observer.observe(el));

    return () => elements.forEach(el => observer.unobserve(el));
  }, []);

  return (
    <motion.div 
      className="flex flex-col items-center w-full py-12 bg-gray-100"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      <h2 className="text-3xl font-bold mb-12 text-purple-600">Mental Health: Myths & Facts</h2>
      
      <div className="w-full max-w-6xl px-4">
        {/* Row of cards - display 2 per row */}
        {[0, 2, 4].map((index) => (
          <div key={index} className="flex flex-col md:flex-row justify-center gap-8 mb-12">
            {mythsAndFacts.slice(index, index + 2).map((item, i) => (
              <motion.div 
                key={i}
                className="card-container w-full md:w-1/2"
                variants={cardVariants}
              >
                <div className="flip-card w-full h-64">
                  <div className="flip-card-inner w-full h-full relative">
                    {/* Front side - Myth - Updated gradient from bright pink to almost white */}
                    <div className="flip-card-front w-full h-full rounded-xl shadow-xl bg-gradient-to-r from-pink-500 to-pink-50 flex flex-col items-center justify-center p-6">
                      <p className="text-xl md:text-2xl font-bold text-center text-purple-800">
                        {item.myth}
                      </p>
                    </div>
                    
                    {/* Back side - Fact - Updated gradient from bright orange to almost white */}
                    <div className="flip-card-back w-full h-full rounded-xl shadow-xl bg-gradient-to-r from-orange-500 to-orange-50 flex flex-col items-center justify-center p-6">
                      <p className="text-xl md:text-2xl font-bold text-center text-purple-800">
                        {item.fact}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ))}
      </div>

      {/* CSS for the flip effect */}
      <style jsx>{`
        .flip-card {
          perspective: 1000px;
        }
        
        .flip-card-inner {
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }
        
        .flip-card:hover .flip-card-inner {
          transform: rotateY(180deg);
        }
        
        .flip-card-front, .flip-card-back {
          position: absolute;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
        
        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </motion.div>
  );
};

export default MythCards;