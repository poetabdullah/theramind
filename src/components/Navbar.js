import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    // Prevent scrolling when mobile menu is open
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [menuOpen]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, "patients", currentUser.email);
        const docSnap = await getDoc(userDocRef);
        setIsRegistered(docSnap.exists());
      } else {
        setIsRegistered(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsRegistered(false);
      setMenuOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-violet-800 via-purple-800 to-purple-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-2xl font-bold text-orange-300 hover:text-orange-500 transition-colors duration-200 no-underline"
              onClick={() => setMenuOpen(false)}
            >
              TheraMind
            </Link>
          </div>

          {/* Menu Button (Mobile) */}
          <div className="flex lg:hidden">
            <button
              className="text-orange-300 hover:text-orange-500 p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:justify-between lg:flex-1 lg:ml-12">
            {/* Nav Links */}
            <div className="flex items-center justify-center flex-1 space-x-12">
              {user ? (
                <>
                  <Link
                    to="/Questionnaire"
                    className="text-orange-300 hover:text-orange-500 transition-colors duration-200 text-lg no-underline"
                  >
                    Questionnaire
                  </Link>
                  <Link
                    to="/meditation"
                    className="text-orange-300 hover:text-orange-500 transition-colors duration-200 text-lg no-underline"
                  >
                    Meditation
                  </Link>
                  <Link
                    to="/splash-screen"
                    className="text-orange-300 hover:text-orange-500 transition-colors duration-200 text-lg no-underline"
                  >
                    TheraChat
                  </Link>
                  <Link
                    to="/education-main"
                    className="text-orange-300 hover:text-orange-500 transition-colors duration-200 text-lg no-underline"
                  >
                    Education
                  </Link>
                  <Link
                    to="/contact-us"
                    className="text-orange-300 hover:text-orange-500 transition-colors duration-200 text-lg no-underline"
                  >
                    Contact Us
                  </Link>
                  <Link
                    to="/about-us"
                    className="text-orange-300 hover:text-orange-500 transition-colors duration-200 text-lg no-underline"
                  >
                    About Us
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/meditation"
                    className="text-orange-300 hover:text-orange-500 transition-colors duration-200 text-lg no-underline"
                  >
                    Meditation
                  </Link>
                  <Link
                    to="/education-main"
                    className="text-orange-300 hover:text-orange-500 transition-colors duration-200 text-lg no-underline"
                  >
                    Education
                  </Link>
                  <Link
                    to="/contact-us"
                    className="text-orange-300 hover:text-orange-500 transition-colors duration-200 text-lg no-underline"
                  >
                    Contact Us
                  </Link>
                  <Link
                    to="/about-us"
                    className="text-orange-300 hover:text-orange-500 transition-colors duration-200 text-lg no-underline"
                  >
                    About Us
                  </Link>
                </>
              )}
            </div>

            {/* Desktop Auth Buttons */}
            {!user ? (
              <div className="flex items-center space-x-4 ml-12">
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-6 py-2.5 rounded-lg hover:from-indigo-700 hover:to-purple-800 transition-colors duration-200 text-base font-medium no-underline"
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2.5 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors duration-200 text-base font-medium no-underline"
                >
                  Login
                </Link>
              </div>
            ) : (
              isRegistered && (
                <div className="flex items-center space-x-4">
                  {user.photoURL && (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-10 h-10 rounded-full border-2 border-white"
                    />
                  )}
                  <span className="text-orange-300 font-medium">
                    {user.displayName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white px-6 py-2.5 rounded-lg hover:from-purple-800 hover:to-indigo-800 transition-colors duration-200 font-medium"
                  >
                    Logout
                  </button>
                </div>
              )
            )}
          </div>

          {/* Mobile Menu Overlay */}
          <div
            className={`${
              menuOpen ? "opacity-50 visible" : "opacity-0 invisible"
            } fixed inset-0 bg-black transition-opacity duration-300 lg:hidden`}
            onClick={() => setMenuOpen(false)}
          />

          {/* Mobile Menu Drawer */}
          <div
            className={`${
              menuOpen ? "translate-x-0" : "translate-x-full"
            } fixed top-0 right-0 h-full w-64 bg-violet-900 shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto z-50`}
          >
            <div className="flex justify-end p-4">
              <button
                className="text-orange-300 hover:text-orange-500 p-2"
                onClick={() => setMenuOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="px-4 py-2 space-y-6">
              {user ? (
                <>
                  <Link
                    to="/Questionnaire"
                    className="block text-orange-300 hover:text-orange-500 py-2 text-lg no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    Questionnaire
                  </Link>
                  <Link
                    to="/meditation"
                    className="block text-orange-300 hover:text-orange-500 py-2 text-lg no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    Meditation
                  </Link>
                  <Link
                    to="/TheraChat"
                    className="block text-orange-300 hover:text-orange-500 py-2 text-lg no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    TheraChat
                  </Link>
                  <Link
                    to="/EducationMain"
                    className="block text-orange-300 hover:text-orange-500 py-2 text-lg no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    Education
                  </Link>
                  <Link
                    to="/ContactUs"
                    className="block text-orange-300 hover:text-orange-500 py-2 text-lg no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    Contact Us
                  </Link>
                  <Link
                    to="/about-us"
                    className="block text-orange-300 hover:text-orange-500 py-2 text-lg no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    About Us
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/meditation"
                    className="block text-orange-300 hover:text-orange-500 py-2 text-lg no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    Meditation
                  </Link>
                  <Link
                    to="/EducationMain"
                    className="block text-orange-300 hover:text-orange-500 py-2 text-lg no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    Education
                  </Link>
                  <Link
                    to="/ContactUs"
                    className="block text-orange-300 hover:text-orange-500 py-2 text-lg no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    Contact Us
                  </Link>
                  <Link
                    to="/about-us"
                    className="block text-orange-300 hover:text-orange-500 py-2 text-lg no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    About Us
                  </Link>
                </>
              )}

              {!user ? (
                <div className="space-y-4 pt-6 pb-8">
                  <Link
                    to="/signup"
                    className="block bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-6 py-2.5 rounded-lg hover:from-indigo-700 hover:to-purple-800 transition-colors duration-200 text-center font-medium no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                  <Link
                    to="/login"
                    className="block bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2.5 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors duration-200 text-center font-medium no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    Login
                  </Link>
                </div>
              ) : (
                isRegistered && (
                  <div className="pt-6 pb-8">
                    <div className="flex items-center space-x-4 mb-4">
                      {user.photoURL && (
                        <img
                          src={user.photoURL}
                          alt={user.displayName}
                          className="w-10 h-10 rounded-full border-2 border-white"
                        />
                      )}
                      <span className="text-orange-300 font-medium">
                        {user.displayName}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 text-white px-6 py-2.5 rounded-lg hover:from-purple-800 hover:to-indigo-800 transition-colors duration-200 font-medium"
                    >
                      Logout
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
