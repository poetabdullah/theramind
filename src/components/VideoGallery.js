import React, { useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const VideoGallery = () => {
    const videos = [
      { id: 1, title: 'Morning Meditation', url: 'https://www.youtube.com/embed/8bBPJ1EEUCc' },
      { id: 2, title: 'Stress Relief', url: 'https://www.youtube.com/embed/-9KLB2HI9BI' },
      { id: 3, title: 'Sleep Meditation', url: 'https://www.youtube.com/embed/DBhadQTCBeo' },
      { id: 4, title: 'Anxiety Relief', url: 'https://www.youtube.com/embed/9yj8mBfHlMk' },
      { id: 5, title: 'Focus Enhancement', url: 'https://www.youtube.com/embed/inpok4MKVLM' },
      { id: 6, title: 'Deep Relaxation', url: 'https://www.youtube.com/embed/O-6f5wQXSu8' },
      { id: 7, title: 'Mindful Living', url: 'https://www.youtube.com/embed/ssss7V1_eyA' },
      { id: 8, title: 'Inner Peace', url: 'https://www.youtube.com/embed/2LjHKZQLrkg' },
      { id: 9, title: 'Healing Meditation', url: 'https://www.youtube.com/embed/liwbUMPVKoI' }
    ];

    const [currentPage, setCurrentPage] = useState(0);
    const videosPerPage = 3;
    const totalPages = Math.ceil(videos.length / videosPerPage);

    const nextPage = () => {
        setCurrentPage((prevPage) => (prevPage + 1) % totalPages);
    };

    const prevPage = () => {
        setCurrentPage((prevPage) => (prevPage - 1 + totalPages) % totalPages);
    };

    const pageVariants = {
        initial: { opacity: 0, x: 300 },
        in: { opacity: 1, x: 0 },
        out: { opacity: 0, x: -300 }
    };

    const pageTransition = {
        type: "tween",
        ease: "anticipate",
        duration: 0.5
    };

    return (
        <section className="container mx-auto px-4 py-16 mb-24">
            <motion.h2 
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold text-purple-800 text-center mb-8"
            >
                Meditation Video Gallery
            </motion.h2>
            
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center text-gray-600 max-w-2xl mx-auto mb-12"
            >
                Immerse yourself in these carefully curated meditation videos. Each session is designed to help you find inner peace, reduce stress, and enhance your mental well-being. Take a moment, breathe, and let these guided meditations transform your day.
            </motion.p>

            <div className="relative flex items-center justify-center">
                <motion.button 
                    onClick={prevPage}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute left-0 z-10"
                >
                    <ChevronLeft size={48} className="text-purple-800" />
                </motion.button>

                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentPage}
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                        className="flex space-x-6"
                    >
                        {videos.slice(currentPage * videosPerPage, (currentPage + 1) * videosPerPage).map((video) => (
                            <motion.div 
                                key={video.id} 
                                whileHover={{ scale: 1.05 }} 
                                className="w-96 bg-white shadow-lg rounded-xl overflow-hidden"
                            >
                                <div className="h-56 w-full">
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
                                <div className="p-4">
                                    <h3 className="text-xl font-semibold text-purple-800">{video.title}</h3>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>

                <motion.button 
                    onClick={nextPage}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-0 z-10"
                >
                    <ChevronRight size={48} className="text-purple-800" />
                </motion.button>
            </div>
        </section>
    );
};

export default VideoGallery;