import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Menu, X, ChevronDown } from "lucide-react";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setEducationDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-purple-900 via-violet-900 to-indigo-900 shadow-lg">
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
                    to="/about-us"
                    className="text-orange-300 hover:text-orange-500 transition-colors duration-200 text-lg no-underline"
                  >
                    About
                  </Link>
                  <Link
                    to="/contact-us"
                    className="text-orange-300 hover:text-orange-500 transition-colors duration-200 text-lg no-underline"
                  >
                    Contact
                  </Link>
                  <Link
                    to="/meditation"
                    className="text-orange-300 hover:text-orange-500 transition-colors duration-200 text-lg no-underline"
                  >
                    Meditation
                  </Link>

                  <Link
                    to="/start-screen"
                    className="text-orange-300 hover:text-orange-500 transition-colors duration-200 text-lg no-underline"
                  >
                    Questionnaire
                  </Link>

                  {/* Education Dropdown */}
                  <div
                    className="relative group"
                    ref={dropdownRef}
                    onMouseEnter={() => setEducationDropdownOpen(true)}
                    onMouseLeave={() => setEducationDropdownOpen(false)}
                  >
                    <Link
                      to="/education-main"
                      className="flex items-center text-orange-300 hover:text-orange-500 transition-colors duration-200 text-lg no-underline"
                    >
                      Education
                      <ChevronDown size={18} className="ml-1" />
                    </Link>

                    <div
                      className={`absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-violet-900 ring-1 ring-black ring-opacity-5 transition-all duration-200 ${
                        educationDropdownOpen
                          ? "opacity-100 visible translate-y-0"
                          : "opacity-0 invisible -translate-y-2"
                      }`}
                    >
                      <div className="py-1">
                        <Link
                          to="articles"
                          className="block px-4 py-2 text-orange-300 hover:bg-violet-800 hover:text-orange-500 transition-colors duration-200 no-underline"
                          onClick={() => setEducationDropdownOpen(false)}
                        >
                          Articles
                        </Link>
                        <Link
                          to="patient-stories"
                          className="block px-4 py-2 text-orange-300 hover:bg-violet-800 hover:text-orange-500 transition-colors duration-200 no-underline"
                          onClick={() => setEducationDropdownOpen(false)}
                        >
                          Patient Stories
                        </Link>
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/splash-screen"
                    className="text-orange-300 hover:text-orange-500 transition-colors duration-200 text-lg no-underline"
                  >
                    TheraChat
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/about-us"
                    className="text-orange-300 hover:text-orange-500 transition-colors duration-200 text-lg no-underline"
                  >
                    About
                  </Link>
                  <Link
                    to="/contact-us"
                    className="text-orange-300 hover:text-orange-500 transition-colors duration-200 text-lg no-underline"
                  >
                    Contact
                  </Link>

                  {/* Education Dropdown for non-logged-in users */}
                  <div
                    className="relative group"
                    ref={dropdownRef}
                    onMouseEnter={() => setEducationDropdownOpen(true)}
                    onMouseLeave={() => setEducationDropdownOpen(false)}
                  >
                    <Link
                      to="/education-main"
                      className="flex items-center text-orange-300 hover:text-orange-500 transition-colors duration-200 text-lg no-underline"
                    >
                      Education
                      <ChevronDown size={18} className="ml-1" />
                    </Link>

                    <div
                      className={`absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-violet-900 ring-1 ring-black ring-opacity-5 transition-all duration-200 ${
                        educationDropdownOpen
                          ? "opacity-100 visible translate-y-0"
                          : "opacity-0 invisible -translate-y-2"
                      }`}
                    >
                      <div className="py-1">
                        <Link
                          to="articles"
                          className="block px-4 py-2 text-orange-300 hover:bg-violet-800 hover:text-orange-500 transition-colors duration-200 no-underline"
                          onClick={() => setEducationDropdownOpen(false)}
                        >
                          Articles
                        </Link>
                        <Link
                          to="patient-stories"
                          className="block px-4 py-2 text-orange-300 hover:bg-violet-800 hover:text-orange-500 transition-colors duration-200 no-underline"
                          onClick={() => setEducationDropdownOpen(false)}
                        >
                          Patient Stories
                        </Link>
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/meditation"
                    className="text-orange-300 hover:text-orange-500 transition-colors duration-200 text-lg no-underline"
                  >
                    Meditation
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
                    <Link
                      to="/patient-dashboard"
                      className="flex items-center space-x-2"
                    >
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="w-10 h-10 rounded-full border-2 border-white"
                      />
                      <span className="text-orange-300 font-medium hover:text-orange-500 transition-colors duration-200 no-underline">
                        {user.displayName}
                      </span>
                    </Link>
                  )}
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
                    to="/about-us"
                    className="block text-orange-300 hover:text-orange-500 py-2 text-lg no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    to="/ContactUs"
                    className="block text-orange-300 hover:text-orange-500 py-2 text-lg no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    Contact
                  </Link>

                  <Link
                    to="/meditation"
                    className="block text-orange-300 hover:text-orange-500 py-2 text-lg no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    Meditation
                  </Link>
                  <Link
                    to="/start-screen"
                    className="block text-orange-300 hover:text-orange-500 py-2 text-lg no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    Questionnaire
                  </Link>
                  {/* Education Dropdown for Mobile */}
                  <div className="py-2">
                    <Link
                      to="/education-main"
                      className="block text-orange-300 hover:text-orange-500 py-2 text-lg no-underline"
                      onClick={() => setMenuOpen(false)}
                    >
                      Education
                    </Link>
                    <div className="ml-4 mt-2 space-y-2">
                      <Link
                        to="articles"
                        className="block text-orange-300 hover:text-orange-500 py-1 text-base no-underline"
                        onClick={() => setMenuOpen(false)}
                      >
                        Articles
                      </Link>
                      <Link
                        to="patient-stories"
                        className="block text-orange-300 hover:text-orange-500 py-1 text-base no-underline"
                        onClick={() => setMenuOpen(false)}
                      >
                        Patient Stories
                      </Link>
                    </div>
                  </div>
                  <Link
                    to="/splash-screen"
                    className="block text-orange-300 hover:text-orange-500 py-2 text-lg no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    TheraChat
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/about-us"
                    className="block text-orange-300 hover:text-orange-500 py-2 text-lg no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    to="/ContactUs"
                    className="block text-orange-300 hover:text-orange-500 py-2 text-lg no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    Contact
                  </Link>

                  {/* Education Dropdown for Mobile */}
                  <div className="py-2">
                    <Link
                      to="/education-main"
                      className="block text-orange-300 hover:text-orange-500py-2 text-lg no-underline"
                      onClick={() => setMenuOpen(false)}
                    >
                      Education
                    </Link>
                    <div className="ml-4 mt-2 space-y-2">
                      <Link
                        to="articles"
                        className="block text-orange-300 hover:text-orange-500 py-1 text-base no-underline"
                        onClick={() => setMenuOpen(false)}
                      >
                        Articles
                      </Link>
                      <Link
                        to="patient-stories"
                        className="block text-orange-300 hover:text-orange-500 py-1 text-base no-underline"
                        onClick={() => setMenuOpen(false)}
                      >
                        Patient Stories
                      </Link>
                    </div>
                    <Link
                      to="/meditation"
                      className="block text-orange-300 hover:text-orange-500 py-2 text-lg no-underline"
                      onClick={() => setMenuOpen(false)}
                    >
                      Meditation
                    </Link>
                  </div>
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
                        <Link
                          to="/patient-dashboard"
                          className="flex items-center space-x-2"
                          onClick={() => setMenuOpen(false)}
                        >
                          <img
                            src={user.photoURL}
                            alt={user.displayName}
                            className="w-10 h-10 rounded-full border-2 border-white"
                          />
                          <span className="text-orange-300 font-medium hover:text-orange-500 transition-colors duration-200">
                            {user.displayName}
                          </span>
                        </Link>
                      )}
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
