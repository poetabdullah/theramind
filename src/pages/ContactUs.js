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
        setFormData({ ...formData, [event.target.name]: event.target.value });
        setErrors({ ...errors, [event.target.name]: "" });
      };

      const validate = () => {
        let errors = {};

        if (!formData.name.trim()) errors.name = "Name is required";
        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))
          errors.email = "Please enter a valid email address";
        if (!formData.subject.trim()) errors.subject = "Subject is required";
        if (!formData.message.trim()) errors.message = "Message is required";

        setErrors(errors);
        return Object.keys(errors).length === 0;
      };

      const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validate()) return;

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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="text-center py-4">
        <h2 className="text-3xl font-bold text-purple-600 mt-2">
          Feel Free To Contact Our Team
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
            <div
              className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4"
              role="alert"
            >
              <p className="font-bold">Your response is invaluable to us!</p>
              <p>Thanks for contacting us, we will get back to you shortly.</p>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-800 font-semibold">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-800 font-semibold">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="subject" className="block text-gray-800 font-semibold">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
              {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="message" className="block text-gray-800 font-semibold">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              ></textarea>
              {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-700 to-indigo-800 text-white font-semibold p-2 rounded-lg on-hover:bg-orange-700 opacity-50"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
          
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

    export default Contact;
