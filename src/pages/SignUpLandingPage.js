import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

export default function SignUpLandingPage() {
    const navigate = useNavigate();
    const [gradientAngle, setGradientAngle] = useState(0);

    // Animate gradient rotation
    useEffect(() => {
        const animate = () => setGradientAngle(prev => (prev + 0.5) % 360);
        const interval = setInterval(animate, 30);
        return () => clearInterval(interval);
    }, []);

    const backgroundStyle = {
        background: `linear-gradient(${gradientAngle}deg, #7e22ce 0%, #6366f1 50%, #f97316 100%)`,
        backgroundSize: '400% 400%',
        transition: 'background 0.3s ease',
    };

    return (
        <div>
            <div className="flex flex-col min-h-screen">
                {/* Main Content Section - Takes all space except footer */}
                <div className="flex-grow relative" style={backgroundStyle}>
                    {/* Stars + Shooting Stars Layer */}
                    <div className="absolute inset-0 bg-[rgba(0,0,0,0.2)] pointer-events-none z-0 overflow-hidden">
                        {/* Static stars */}
                        {[...Array(60)].map((_, i) => (
                            <motion.div
                                key={`star-${i}`}
                                className="absolute rounded-full bg-white"
                                style={{
                                    width: `${Math.random() * 2 + 1}px`,
                                    height: `${Math.random() * 2 + 1}px`,
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    opacity: Math.random() * 0.5 + 0.2,
                                }}
                                animate={{ opacity: [0.2, 0.6, 0.2] }}
                                transition={{ duration: Math.random() * 4 + 3, repeat: Infinity, ease: 'easeInOut' }}
                            />
                        ))}

                        {/* Shooting stars */}
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={`shooting-star-${i}`}
                                className="absolute h-px rounded-full"
                                style={{
                                    width: `${Math.random() * 80 + 120}px`,
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 60}%`,
                                    opacity: 0,
                                    rotate: `${Math.random() * 20 - 10}deg`,
                                    background: 'linear-gradient(90deg, transparent, white 50%, rgba(255,255,255,0.8))',
                                    boxShadow: '0 0 6px 2px rgba(255,255,255,0.4)',
                                }}
                                animate={{ opacity: [0, 1, 0], x: ['-50%', '150%'] }}
                                transition={{
                                    duration: Math.random() * 0.8 + 0.6,
                                    repeat: Infinity,
                                    repeatDelay: Math.random() * 8 + 4,
                                    ease: 'easeOut',
                                }}
                            />
                        ))}
                    </div>

                    {/* TheraMind title - now centered */}
                    <div className="pt-8 px-8 relative z-10 text-center">
                        <h1 className="text-5xl md:text-6xl font-bold text-white">TheraMind</h1>
                        <p className="text-lg text-white/80 mt-2 mx-auto max-w-md">
                            A comprehensive platform promoting mental health awareness and providing essential tools for self-care.
                        </p>

                    </div>

                    {/* Centered Card */}
                    <div className="flex items-center justify-center p-6 h-[calc(100%-120px)] relative z-10">
                        <motion.div
                            className="backdrop-blur-lg bg-white/90 border border-white/40 rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center transform transition-transform hover:scale-[1.015]"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            whileHover={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)' }}
                        >
                            <h1 className="text-4xl font-extrabold text-gray-800 mb-4 bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">Join TheraMind Today</h1>
                            <p className="text-gray-700 mb-8 text-lg">
                                Sign up as a doctor or as a patient to start your mental health journey.
                            </p>
                            <div className="flex flex-col md:flex-row gap-6 justify-center">
                                <motion.button
                                    onClick={() => navigate('/signup')}
                                    className="w-full px-6 py-4 font-semibold rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:scale-105 transition-transform"
                                    whileHover={{ boxShadow: '0 0 20px rgba(157,78,221,0.6)' }}
                                >
                                    Sign Up as Patient
                                </motion.button>
                                <motion.button
                                    onClick={() => navigate('/doctor-signup')}
                                    className="w-full px-6 py-4 font-semibold rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg hover:scale-105 transition-transform"
                                    whileHover={{ boxShadow: '0 0 20px rgba(56,189,248,0.6)' }}
                                >
                                    Sign Up as Doctor
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}