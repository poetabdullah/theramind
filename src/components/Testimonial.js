import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs, limit } from "firebase/firestore";

const Testimonial = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsRef = collection(db, "testimonials");
        const q = query(reviewsRef, where("rating", "==", 5), limit(3));
        const querySnapshot = await getDocs(q);
        const reviewsData = querySnapshot.docs.map((doc) => {
          const timestamp = doc.data().timestamp;

          return {
            id: doc.id,
            name: doc.data().name || "Anonymous",
            email: doc.data().email || "No email provided",
            message: doc.data().message || "No message provided",
            timestamp: timestamp
              ? timestamp.toDate().toLocaleDateString("en-GB") // Formats as DD/MM/YYYY
              : "No date available",
          };
        });

        setReviews(reviewsData);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const renderStars = () => {
    return "★".repeat(5);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.h2
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: 1,
          transition: {
            duration: 0.5,
            type: "spring",
            bounce: 0.4,
          },
        }}
        className="text-5xl font-bold text-center mb-4 text-[#4B0082]"
      >
        Testimonials
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: { duration: 0.5, delay: 0.3 },
        }}
        className="text-xl text-center mb-12 text-gray-600"
      >
        Hear it from the TheraMind users!
      </motion.p>

      {loading ? (
        <p className="text-center text-gray-600">Loading testimonials...</p>
      ) : reviews.length === 0 ? (
        <p className="text-center text-gray-600">No 5-star testimonials yet.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.5,
                  delay: index * 0.2,
                },
              }}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.2 },
              }}
              className="p-6 bg-[#FFF0F5] rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-2xl hover:bg-[#FFE4E1]"
            >
              <p className="text-xl font-bold text-[#8A4FFF] mb-2">
                {review.name}
              </p>
              <p className="text-sm text-[#6A4FFF] mb-3">{review.email}</p>
              <p className="text-gray-700 italic mb-4">"{review.message}"</p>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">{review.timestamp}</p>
                <p className="text-yellow-500 text-xl">{renderStars()}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Testimonial;
