import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "What is our main goal?",
      answer: "Our main goal is to offer hassle-free support to people struggling with mental health issues."
    },
    {
      question: "How do I get started?",
      answer: "Getting started is easy! Simply sign up on our website for free and explore our services tailored to your needs with expert guidance"
    },
    {
      question: "What support options are available?",
      answer: "We offer multiple support options including 24/7 chat via TheraChat, community support, comprehensive treatment plan, and frequent progress tracking."
    },
    {
      question: "How do I book an appointment?",
      answer: "You can book an appointment through your dashboard and cancel them as well."
    },
    {
      question: "Do you offer free sessions?",
      answer: "Absolutely! We offer free sessions with full access to all services. No payment is required to start your journey here on TheraMind."
    }
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
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
        className="text-6xl font-bold text-[#4B0082] mb-12 text-center"
      >
        FAQs
      </motion.h1>
      
      <div className="w-full max-w-3xl">
        {faqs.map((faq, index) => (
          <div key={index} className="mb-4">
            <motion.div 
              className="faq-question p-4 rounded-lg cursor-pointer"
              onClick={() => toggleFAQ(index)}
              whileHover={{ 
                backgroundColor: '#FFA500',
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              style={{
                backgroundColor: activeIndex === index ? '#FF8C00' : '#FFFFFF',
                color: '#4B0082',
                border: '2px solid #FF8C00'
              }}
            >
              <div className="flex justify-between items-center text-xl font-semibold">
                {faq.question}
                <motion.span
                  animate={{ 
                    rotate: activeIndex === index ? 180 : 0 
                  }}
                  transition={{ duration: 0.3 }}
                  style={{ 
                    display: 'inline-block', 
                    marginLeft: '10px' 
                  }}
                >
                  ▼
                </motion.span>
              </div>
            </motion.div>
            <AnimatePresence>
              {activeIndex === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ 
                    opacity: 1, 
                    height: 'auto',
                    transition: { 
                      duration: 0.3,
                      ease: "easeInOut"
                    }
                  }}
                  exit={{ 
                    opacity: 0, 
                    height: 0,
                    transition: { 
                      duration: 0.2,
                      ease: "easeInOut"
                    }
                  }}
                  className="faq-answer p-4 rounded-b-lg"
                  style={{
                    backgroundColor: '#FFF8DC',
                    color: '#4B0082',
                    overflow: 'hidden',
                    fontSize: '1.125rem', // larger text
                    lineHeight: '1.6'
                  }}
                >
                  {faq.answer}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;