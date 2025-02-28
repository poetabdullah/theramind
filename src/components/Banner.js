import React from 'react';
// Banner Component

const Banner = () => {
  return (
    <div className="relative flex items-center justify-center bg-gradient-to-r from-purple-700 to-purple-900 text-white py-24 px-6 md:px-16 lg:px-32 animated-bg">
      <div className="max-w-2xl text-left">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">TheraMind</h1>
        <p className="text-lg md:text-xl opacity-90 mb-6">
          Get ready to conquer your mind. TheraMind is dedicated to providing the best mental health services backed by psychology experts, AI-personalized recommendations, and several free beneficial resources.
        </p>
        <button className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full text-lg font-semibold transition-transform transform hover:scale-105">
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Banner;