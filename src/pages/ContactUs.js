import React, { useState } from "react";
import { motion } from "framer-motion";
import Footer from "../components/Footer";
import { db } from "../firebaseConfig.js";
import { collection, addDoc } from "firebase/firestore";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (event) => {
    //Updates form data as user types
    setFormData({ ...formData, [event.target.name]: event.target.value });
    //Clears existing error when user starts typing
    setErrors({ ...errors, [event.target.name]: "" });
  };

  const validate = () => {
    let errors = {};
    //Validating If Fields Are Empty Or Not
    if (!formData.name.trim()) {errors.name = "Name is required"};
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))
      {errors.email = "Please enter a valid email address";}
    if (!formData.subject.trim()) {errors.subject = "Subject is required";}
    if (!formData.message.trim()) {errors.message = "Message is required";}

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    //Prevents page refresh
    event.preventDefault();
    if (!validate()) {return;}

    setLoading(true);
    try {
      await addDoc(collection(db, "contactMessages"), {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        timestamp: new Date(),
      });

      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-purple-150 via-voilet-200 to-orange-150">
      <motion.header className="meditation-header relative bg-gradient-to-r from-purple-600 to-orange-500 py-20">
        {/* Animated Heading */}
        <motion.h1
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
          className="text-6xl font-extrabold text-white text-center mb-4 tracking-wide"
        >
          Feel Free To Contact Our Team
        </motion.h1>

        {/* Animated Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
          className="mt-6 text-lg md:text-xl max-w-2xl mx-auto font-light text-white text-center"
        >
          Your mental well-being matters, and we’re here to support you every step of the way!
        </motion.p>
      </motion.header>
      <motion.main className="flex-grow flex items-center justify-center mt-5 mb-5">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
          className="w-full max-w-xl p-6 shadow-lg rounded-xl"
        >
          {success && (
            <motion.div
              className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4"
              role="alert"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.p className="font-bold">Your response is invaluable to us!</motion.p>
              <motion.p>Thanks for contacting us, we will get back to you shortly.</motion.p>
            </motion.div>
          )}
          <motion.form onSubmit={handleSubmit} className="space-y-4">
            {/* Dynamically rendering input fields */}
            {Object.entries({ name: "Name", email: "Email", subject: "Subject" }).map(([key, label]) => (
              /* Unique keys for all three fields */
              <motion.div key={key} className="relative">
                <motion.label className="block text-purple-700 text-xl font-bold">
                  {label}
                </motion.label>
                {/* Checking the type of each field, if email, then email otherwise text for name and subject */}
                <motion.input
                  type={key === "email" ? "email" : "text"}
                  name={key}
                  //Takes value from state object; formData, which user has filled
                  value={formData[key]}
                  /* For updating local state as well on state change */
                  onChange={handleChange}
                  className="w-full p-2 border border-orange-500 rounded-lg focus:ring-2 focus:ring-orange-500 focus:ouline-none outline-none transition duration-300"
                  whileFocus={{ scale: 1.02 }}
                />
                {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
              </motion.div>
            )
            )}
            <div className="relative">
              <label className="block text-purple-700 text-xl font-bold">
                Message
              </label>
              <motion.textarea
                name="message"
                value={formData.message}
                /* For updating local state as well on state change */
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition duration-300"
              ></motion.textarea>
              {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-orange-500 text-white font-bold text-xl p-2 rounded-lg hover:scale-105 transition duration-300"
              whileHover={{ scale: 1.05 }}
            >
              {loading ? "Sending..." : "Send Message"}
            </motion.button>
          </motion.form>

        </motion.div>
      </motion.main>
      <Footer />
    </div>
  );
};

export default Contact;
