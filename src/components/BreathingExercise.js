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
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-8 sm:py-12">
            {/* Header Section */}
            <div className="text-center mb-8 sm:mb-12 max-w-3xl px-4">
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl sm:text-4xl md:text-5xl font-bold text-purple-800 mb-4 sm:mb-6"
                >
                    The Art of Mindful Breathing
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mx-auto text-base sm:text-lg text-gray-700"
                >
                    Discover inner calm through simple breathing techniques. Reduce stress, quiet your mind, and find your moment of peace.
                </motion.p>
            </div>

            {/* Main Content */}
            <motion.div
                className="flex flex-col lg:flex-row items-center justify-center gap-8 sm:gap-12 lg:gap-16 w-full"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
            >
                {/* Animated Breathing Circle */}
                <motion.div
                    className="breathing-circle w-48 h-48 sm:w-64 sm:h-64 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg"
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
                    <p className="text-center">Breathe {breathPhase}</p>
                </motion.div>

                {/* Meditation Timer */}
                <motion.div
                    className="meditation-timer w-64 h-64 sm:w-80 sm:h-80 rounded-full flex flex-col items-center justify-center text-white text-lg sm:text-xl font-bold p-4 sm:p-6 shadow-lg"
                    animate={{ 
                        background: [
                            "linear-gradient(to right, #dd4600, rgb(190, 80, 15))", 
                            "linear-gradient(to right, rgb(255, 60, 0), #fad0c4)", 
                            "linear-gradient(to right, #dd4600, rgb(185, 28, 159))"
                        ]
                    }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                >
                    <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6">
                        <div className="flex justify-center">
                            <span className="mr-1 sm:mr-2">{Math.floor(time / 60)}</span>:
                            <span className="ml-1 sm:ml-2">{String(time % 60).padStart(2, "0")}</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                        <motion.button 
                            onClick={startTimer}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm transition-colors"
                        >
                            Start
                        </motion.button>
                        <motion.button 
                            onClick={stopTimer}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm transition-colors"
                        >
                            Stop
                        </motion.button>
                        <motion.button 
                            onClick={resetTimer}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm transition-colors"
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