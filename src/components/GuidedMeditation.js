import { motion } from 'framer-motion';
import { useState } from 'react';

const exercises = [
    { 
        title: "Deep Breathing", 
        steps: ["Inhale deeply through your nose", "Hold for 4 seconds", "Exhale slowly through your mouth"], 
        image: "/img/exercise1.jpg" 
    },
    { 
        title: "Body Scan", 
        steps: ["Focus on your toes", "Move your attention upward", "Relax each body part as you go"], 
        image: "/img/exercise4.jpg" 
    },
    { 
        title: "Visualization", 
        steps: ["Close your eyes", "Imagine a peaceful place", "Engage all your senses in the visualization"], 
        image: "/img/exercise3.jpg" 
    }
];

export default function GuidedMeditation() {
    const [selected, setSelected] = useState(0);

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Banner Section */}
            <div className="bg-white py-8 md:py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl sm:text-4xl lg:text-5xl font-bold text-purple-800 mb-4 md:mb-6"
                    >
                        Discover the Power of Guided Meditation
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-gray-700 mb-6 md:mb-8"
                    >
                        Guided meditation is a transformative practice that helps you reduce stress, improve focus, and cultivate inner peace.
                    </motion.p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Image Slider */}
                    <div className="w-full lg:w-1/2">
                        <motion.div 
                            className="relative overflow-hidden rounded-xl shadow-lg"
                            initial={{ opacity: 0, y: -20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ duration: 0.5 }}
                            style={{
                                aspectRatio: '1/1', // Maintain square aspect ratio
                                maxHeight: '500px'
                            }}
                        >
                            {exercises.map((exercise, index) => (
                                <motion.div
                                    key={index}
                                    className="absolute inset-0 flex justify-center items-center bg-gradient-to-br from-orange-100 to-pink-100"
                                    style={{
                                        left: `${(index - selected) * 100}%`,
                                        transition: 'left 0.5s ease',
                                    }}
                                >
                                    <motion.img 
                                        src={exercise.image} 
                                        alt={exercise.title} 
                                        className="object-cover w-full h-full"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: selected === index ? 1 : 0.5 }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                        <div className="flex justify-center mt-4 space-x-2">
                            {exercises.map((_, index) => (
                                <button 
                                    key={index}
                                    onClick={() => setSelected(index)}
                                    className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-colors ${selected === index ? 'bg-pink-500' : 'bg-gray-300'}`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Exercise Cards */}
                    <div className="w-full lg:w-1/2">
                        <h2 className="text-2xl sm:text-3xl font-bold text-purple-800 mb-6">Try With Us</h2>
                        <div className="space-y-4">
                            {exercises.map((exercise, index) => (
                                <motion.div 
                                    key={index}
                                    className={`p-4 sm:p-6 rounded-xl cursor-pointer transition-all ${selected === index ? 'bg-gradient-to-r from-pink-500 to-orange-500' : 'bg-white shadow-md'}`}
                                    onClick={() => setSelected(index)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <h3 className={`text-lg sm:text-xl font-semibold mb-3 ${selected === index ? 'text-white' : 'text-pink-600'}`}>
                                        {exercise.title}
                                    </h3>
                                    <ul className="space-y-2">
                                        {exercise.steps.map((step, i) => (
                                            <motion.li 
                                                key={i}
                                                className={`text-sm sm:text-base ${selected === index ? 'text-white' : 'text-gray-700'}`}
                                                whileHover={{ 
                                                    x: 5,
                                                    color: selected === index ? '#ffffff' : '#ff4081'
                                                }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {step}
                                            </motion.li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}