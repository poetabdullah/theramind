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
        <div className="flex flex-col min-h-screen bg-orange-50">
          <header className="text-center py-4">
            <motion.h2 className="text-3xl font-bold text-purple-700 mt-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
              Feel Free To Contact Our Team
            </motion.h2>
            <p className="text-gray-800 mt-3">We are here for you, please let us know how we can help you. Whether you have a question, <br></br>or want to give us a feedback or simply want to interact, feel free to contact our team.</p>
          </header>
          <main className="flex-grow flex items-center justify-center mb-5">
            <motion.div
              className="service-item bg-white shadow-lg rounded-lg p-4 mt-2 w-full max-w-xl transition duration-300 hover:scale-105"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              whileHover={{ scale: 1.05 }}
            >
              {success && (
                <div
                  className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4"
                  role="alert"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="font-bold">Your response is invaluable to us!</p>
                  <p>Thanks for contacting us, we will get back to you shortly.</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                {Object.entries({ name: "Name", email: "Email", subject: "Subject" }).map(([key, label]) => (
                  <div key={key} className="relative">
                    <label className="block text-purple-600 font-semibold">
                      {label}
                    </label>
                    <motion.input
                      type={key === "email" ? "email" : "text"}
                      name={key}
                      value={formData[key]}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:ouline-none transition duration-300"
                      whileFocus={{ scale: 1.02 }}
                    />
                    {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
                  </div>
                )
                )}
                <div className="relative">
                  <label className="block text-purple-600 font-semibold">
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
                  className="w-full bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold p-2 rounded-lg hover:scale-105 transition duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  {loading ? "Sending..." : "Send Message"}
                </motion.button>
              </form>
            </motion.div>
          </main>
          <Footer />
        </div>
      );
    };

    export default Contact;
