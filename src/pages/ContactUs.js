import React, { useState } from "react";
import { motion } from "framer-motion";
import Footer from "../components/Footer";
import { db } from "../firebaseConfig.js";
import { collection, addDoc } from "firebase/firestore";
import DOMPurify from "dompurify";

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
    setFormData({ ...formData, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: "" });
  };

  const validate = () => {
    const errs = {};
    const trimmed = Object.fromEntries(
      Object.entries(formData).map(([k, v]) => [k, v.trim()])
    );

    // Required fields
    if (!trimmed.name) errs.name = "Name is required";
    if (!trimmed.email || !/\S+@\S+\.\S+/.test(trimmed.email))
      errs.email = "Please enter a valid email address";
    if (!trimmed.subject) errs.subject = "Subject is required";
    if (!trimmed.message) errs.message = "Message is required";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    // Sanitize inputs
    const cleanData = {};
    for (const field of ["name", "email", "subject", "message"]) {
      const raw = formData[field].trim();
      const clean = DOMPurify.sanitize(raw);
      if (clean !== raw) {
        setErrors({ [field]: "Invalid characters detected" });
        return;
      }
      cleanData[field] = clean;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "contactMessages"), {
        name: cleanData.name,
        email: cleanData.email,
        subject: cleanData.subject,
        message: cleanData.message,
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
        <motion.h1
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
          className="text-6xl font-extrabold text-white text-center mb-4 tracking-wide"
        >
          Feel Free To Contact Our Team
        </motion.h1>

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
            {Object.entries({ name: "Name", email: "Email", subject: "Subject" }).map(([key, label]) => (
              <motion.div key={key} className="relative">
                <motion.label className="block text-purple-700 text-xl font-bold">
                  {label}
                </motion.label>
                <motion.input
                  type={key === "email" ? "email" : "text"}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className="w-full p-2 border border-orange-500 rounded-lg focus:ring-2 focus:ring-orange-500 focus:ouline-none outline-none transition duration-300"
                  whileFocus={{ scale: 1.02 }}
                />
                {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
              </motion.div>
            ))}
            <div className="relative">
              <label className="block text-purple-700 text-xl font-bold">
                Message
              </label>
              <motion.textarea
                name="message"
                value={formData.message}
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
