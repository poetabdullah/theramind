import React from "react";
import { motion } from 'framer-motion';

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
  
    return (
      <section className="video-gallery">
        <h2 className="video-gallery-title">Video Gallery</h2>
        <div className="video-slider-container">
          {[0, 1, 2].map((row) => (
            <div key={row} className="video-slider">
              {videos.slice(row * 3, row * 3 + 3).map((video) => (
                <motion.div key={video.id} whileHover={{ scale: 1.05 }} className="video-card">
                  <div className="video-placeholder">
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
                  <h3 className="video-title">{video.title}</h3>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </section>
    );
  };
  export default VideoGallery;