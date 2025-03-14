import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; // Import icons for arrows

const slides = [
  {
    id: 1,
    image: "/img/slider1.jpeg",
    title: "TheraMind",
    description:
      "Get ready to conquer your mind by the best mental health services backed by psychology experts, AI-personalized recommendations, and several free beneficial resources.",
  },
  {
    id: 2,
    image: "/img/slider2.png",
    title: "TheraMind",
    description:
      "Discover a healthier mindset. Our therapy tools and expert insights will guide you every step of the way.",
  },
  {
    id: 3,
    image: "/img/slider4.jpeg",
    title: "TheraMind",
    description:
      "Unlock the power of your mind with science-backed mental health solutions tailored for you.",
  },
];

const BannerSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Function to go to next slide
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // Function to go to previous slide
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Auto-slide every 5 seconds
  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 6000);
    return () => clearInterval(slideInterval);
  }, []);

  return (
    <div className="banner-slider">
      {/* Slide Background */}
      <div
        className="slide"
        style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
      >
        {/* Content Section */}
        <div className="content">
          <h1>{slides[currentSlide].title}</h1>
          <p>{slides[currentSlide].description}</p>
<<<<<<< HEAD
          <a href="/questionnaire" className="cta-button">Get Started</a>
=======
          <a href="/signup" className="cta-button">
            Get Started
          </a>
>>>>>>> 50eeb44ce82f23d98f7c34e7aa6fb6cddd4e934d
          {/* <button className="cta-button">Get Started</button> */}
        </div>

        {/* Navigation Arrows */}
        <button className="prev" onClick={prevSlide}>
          <FaChevronLeft />
        </button>
        <button className="next" onClick={nextSlide}>
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

export default BannerSlider;
