import React, { useState } from "react";
import { motion } from "framer-motion";
import Footer from "../components/Footer.js";
import DOMPurify from "dompurify";
import { db } from "../firebaseConfig.js";
import { collection, addDoc } from "firebase/firestore";

const StarIcon = ({ filled, onClick, onMouseEnter, onMouseLeave }) => (
  <svg
    onClick={onClick}
    onMouseEnter={onMouseEnter} // When mouse hovers over the stars
    onMouseLeave={onMouseLeave} // When mouse leaves the star
    className="cursor-pointer transition-transform duration-200 transform hover:scale-110"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="50%" stopColor="#ff7b00" />
        <stop offset="100%" stopColor="#9333ea" />
      </linearGradient>
    </defs>
    <polygon
      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21 12 17.77 5.82 21 7 14.14 2 9.27 8.91 8.26 12 2"
      fill={filled ? "url(#starGradient)" : "#d1d5db"}
      stroke={filled ? "#f59e0b" : "#d1d5db"}
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Testimonial = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: "" });
  };

  const validate = () => {
    let errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Please enter a valid email address";

    const msg = formData.message.trim();
    if (!msg) errors.message = "Message is required";
    else if (msg.length < 10)
      errors.message = "Message must be at least 10 characters";
    else if (msg.length > 500)
      errors.message = "Message must be under 500 characters";

    if (rating === 0) errors.rating = "Please select a rating";

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    const sanitizedMessage = DOMPurify.sanitize(formData.message, {
      ALLOWED_TAGS: [], // Remove all tags
      ALLOWED_ATTR: [],
    });

    setLoading(true);
    try {
      await addDoc(collection(db, "testimonials"), {
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: sanitizedMessage,
        rating,
        timestamp: new Date(),
      });

      setSuccess(true);
      setFormData({ name: "", email: "", message: "" });
      setRating(0);
    } catch (error) {
      console.error("Error adding testimonial: ", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="text-center py-4">
        <h2 className="text-3xl font-bold text-purple-600 mt-2">
          Share Your Experience With Us
        </h2>
      </header>
      <main className="flex-grow flex items-center justify-center mb-5">
        <motion.div
          className="bg-white shadow-lg rounded-lg p-4 mt-4 w-full max-w-xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
        >
          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
              <p className="font-bold">Thank you for your feedback!</p>
              <p>Your testimonial has been submitted successfully.</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {Object.entries({ name: "Name", email: "Email" }).map(
              ([key, label]) => (
                <div key={key} className="relative">
                  <label className="block text-purple-600 font-semibold">
                    {label}
                  </label>
                  <motion.input
                    type={key === "email" ? "email" : "text"}
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 transition duration-300"
                  />
                  {errors[key] && (
                    <p className="text-red-500 text-xs mt-1">{errors[key]}</p>
                  )}
                </div>
              )
            )}
            <div className="relative">
              <label className="block text-purple-600 font-semibold">
                Your Testimonial
              </label>
              <motion.textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 transition duration-300"
              ></motion.textarea>
              {errors.message && (
                <p className="text-red-500 text-xs mt-1">{errors.message}</p>
              )}
            </div>
            <div className="relative">
              <label className="block text-purple-600 font-semibold">
                Rating
              </label>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, index) => {
                  const starValue = index + 1;
                  return (
                    <StarIcon
                      key={index}
                      filled={starValue <= (hover || rating)} // Only fill up to the selected/hovered star
                      onClick={() => setRating(starValue)}
                      onMouseEnter={() => setHover(starValue)}
                      onMouseLeave={() => setHover(null)}
                    />
                  );
                })}
              </div>
              {errors.rating && (
                <p className="text-red-500 text-xs mt-1">{errors.rating}</p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold p-2 rounded-lg hover:scale-105 transition duration-300"
            >
              {loading ? "Submitting..." : "Submit Review"}
            </motion.button>
          </form>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Testimonial;
