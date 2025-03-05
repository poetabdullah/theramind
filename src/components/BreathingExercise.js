import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const BreathingExercise = () => {
    const [time, setTime] = useState(300);
    const [running, setRunning] = useState(false);
    const [breathPhase, setBreathPhase] = useState("in");

    useEffect(() => {
        let timer;
        if (running && time > 0) {
            timer = setInterval(() => {
                setTime((prevTime) => prevTime - 1);
            }, 1000);
        } else if (!running && time !== 0) {
            clearInterval(timer);
        }

        return () => clearInterval(timer);
    }, [running, time]);

    const startTimer = () => setRunning(true);
    const stopTimer = () => setRunning(false);
    const resetTimer = () => {
        setTime(300);
        setRunning(false);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
            <div className="text-center mb-12">
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-purple-800 mb-6"
                >
                    The Art of Mindful Breathing
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="max-w-2xl mx-auto text-lg text-gray-700"
                >
                    Discover inner calm through simple breathing techniques. Reduce stress, quiet your mind, and find your moment of peace. Ready to transform your day with just a few breaths?
                </motion.p>
            </div>

            <motion.div
                className="flex items-center space-x-16"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
            >
                {/* Animated Breathing Circle */}
                <motion.div
                    className="breathing-circle w-64 h-64 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                    animate={{ 
                        scale: [1, 1.3, 1],
                        backgroundColor: breathPhase === "in" 
                            ? ['#FF6B93', '#FF4081', '#FF6B93'] 
                            : ['#6B5AFF', '#4B3AFF', '#6B5AFF']
                    }}
                    transition={{ 
                        repeat: Infinity, 
                        duration: 4, 
                        ease: "easeInOut" 
                    }}
                    onAnimationComplete={() => setBreathPhase(breathPhase === "in" ? "out" : "in")}
                >
                    <p className="text-center">Breathe</p>
                </motion.div>

                {/* Meditation Timer */}
                <motion.div
                    className="meditation-timer w-80 h-80 rounded-full flex flex-col items-center justify-center text-white background: linear-gradient(to right, #ff9a9e, #fad0c4)text-xl font-bold p-6"
                    animate={{ 
                        backgroundColor: ['#FF6B93', '#FF4081', '#FF6B93']
                    }}
                    transition={{ 
                        repeat: Infinity, 
                        duration: 4, 
                        ease: "easeInOut" 
                    }}
                >
                    <div className="text-6xl font-bold mb-8">
                        <div className="flex justify-center">
                            <span className="mr-2">{Math.floor(time / 60)}</span>:
                            <span className="ml-2">{String(time % 60).padStart(2, "0")}</span>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <motion.button 
                            onClick={startTimer}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white/20 text-white px-4 py-2 rounded-full text-sm"
                        >
                            Start
                        </motion.button>
                        <motion.button 
                            onClick={stopTimer}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white/20 text-white px-4 py-2 rounded-full text-sm"
                        >
                            Stop
                        </motion.button>
                        <motion.button 
                            onClick={resetTimer}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white/20 text-white px-4 py-2 rounded-full text-sm"
                        >
                            Reset
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default BreathingExercise;