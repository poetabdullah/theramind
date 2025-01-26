import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true); // Track loading state
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check if the user exists in Firestore only after they are logged in
        const userDocRef = doc(db, "patients", currentUser.email);
        const docSnap = await getDoc(userDocRef);
        setIsRegistered(docSnap.exists()); // Update isRegistered after Firestore check
      } else {
        setIsRegistered(false); // Reset if user is not logged in
      }
      setLoading(false); // Set loading to false once auth state has been checked
    });

    return () => unsubscribe(); // Cleanup on component unmount
  }, [auth]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsRegistered(false); // Reset registration state on logout
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <nav className="flex justify-between items-center bg-purple-800 text-white py-4 px-6 sticky top-0 z-50">
        <div className="text-2xl font-bold cursor-pointer hover:text-orange-500">
          <Link to="/">TheraMind</Link>
        </div>
        {/* Show loading spinner or placeholder while checking auth state */}
        <div className="text-white">Loading...</div>
      </nav>
    );
  }

  return (
    <nav className="flex justify-between items-center bg-purple-800 text-white py-4 px-6 sticky top-0 z-50">
      <div className="text-2xl font-bold cursor-pointer hover:text-orange-500">
        <Link to="/">TheraMind</Link>
      </div>
      <ul className="flex gap-6">
        <li>
          <Link to="/#about" className="hover:text-orange-500">
            About
          </Link>
        </li>
        <li>
          <Link to="/Questionnaire" className="hover:text-orange-500">
            Questionnaire
          </Link>
        </li>
        <li>
          <Link to="/meditation" className="hover:text-orange-500">
            Meditation
          </Link>
        </li>
        <li>
          <Link to="/#contact" className="hover:text-orange-500">
            Contact
          </Link>
        </li>

        {/* Conditionally render Sign Up and Login buttons */}
        {!user && (
          <>
            <li>
              <Link
                to="/signup"
                className="bg-pink-500 px-4 py-2 rounded-md hover:bg-orange-400"
              >
                Sign Up
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="bg-orange-500 px-4 py-2 rounded-md hover:bg-purple-700"
              >
                Login
              </Link>
            </li>
          </>
        )}

        {/* If logged in and registered, show profile and logout */}
        {user && isRegistered && (
          <div className="flex items-center gap-4">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-sm font-medium">{user.displayName}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded-md hover:bg-red-600 text-white"
            >
              Logout
            </button>
          </div>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
