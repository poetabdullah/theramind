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
    const getVideosPerPage = () => {
        if (window.innerWidth < 640) return 1;
        if (window.innerWidth < 1024) return 2;
        return 3;
    };
    const [videosPerPage, setVideosPerPage] = useState(getVideosPerPage());
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

    // Handle window resize
    React.useEffect(() => {
        const handleResize = () => {
            setVideosPerPage(getVideosPerPage());
            setCurrentPage(0); // Reset to first page on resize
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 mb-12 sm:mb-24">
            <motion.h2 
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-purple-800 text-center mb-6 sm:mb-8"
            >
                Meditation Video Gallery
            </motion.h2>
            
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center text-gray-600 text-sm sm:text-base max-w-2xl mx-auto mb-8 sm:mb-12 px-2"
            >
                Immerse yourself in these carefully curated meditation videos. Each session is designed to help you find inner peace, reduce stress, and enhance your mental well-being.
            </motion.p>

            <div className="relative flex items-center justify-center">
                <motion.button 
                    onClick={prevPage}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute left-0 sm:-left-4 z-10"
                    aria-label="Previous videos"
                >
                    <ChevronLeft size={32} className="text-purple-800 sm:w-10 sm:h-10" />
                </motion.button>

                <div className="w-full max-w-7xl mx-auto overflow-hidden px-8 sm:px-12">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={currentPage}
                            initial="initial"
                            animate="in"
                            exit="out"
                            variants={pageVariants}
                            transition={pageTransition}
                            className="flex justify-center gap-4 sm:gap-6"
                        >
                            {videos.slice(currentPage * videosPerPage, (currentPage + 1) * videosPerPage).map((video) => (
                                <motion.div 
                                    key={video.id} 
                                    whileHover={{ scale: 1.03 }} 
                                    className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] bg-white shadow-md hover:shadow-lg rounded-xl overflow-hidden transition-shadow"
                                >
                                    <div className="aspect-video w-full">
                                        <iframe
                                            title={video.title}
                                            width="100%"
                                            height="100%"
                                            src={video.url}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="w-full h-full"
                                        />
                                    </div>
                                    <div className="p-3 sm:p-4">
                                        <h3 className="text-lg sm:text-xl font-semibold text-purple-800">{video.title}</h3>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <motion.button 
                    onClick={nextPage}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-0 sm:-right-4 z-10"
                    aria-label="Next videos"
                >
                    <ChevronRight size={32} className="text-purple-800 sm:w-10 sm:h-10" />
                </motion.button>
            </div>

            {/* Pagination indicators */}
            <div className="flex justify-center mt-6 gap-2">
                {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentPage(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${currentPage === index ? 'bg-purple-800' : 'bg-purple-200'}`}
                        aria-label={`Go to page ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
};

export default VideoGallery;