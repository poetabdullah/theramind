// Navbar.js
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Menu, X, ChevronDown } from "lucide-react";

const Navbar = () => {
  const [user, setUser] = useState(null); // user object
  const [userType, setUserType] = useState(null); // "admin", "patient", "doctor", or null
  const [isApprovedDoctor, setIsApprovedDoctor] = useState(false); // for doctors with approved status
  const [loading, setLoading] = useState(true); // block render unless firebase checks auth state
  const [menuOpen, setMenuOpen] = useState(false); // checks if the menu is open
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false); // drop-down for education tile
  const dropdownRef = useRef(null);
  const auth = getAuth();

  // When mobile menu opens, scrolling is disabled to prevent background interaction
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

  // Check user type and status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check if user is a patient
        const patientDocRef = doc(db, "patients", currentUser.email);
        const patientDocSnap = await getDoc(patientDocRef);

        // Check if user is a doctor
        const doctorDocRef = doc(db, "doctors", currentUser.email);
        const doctorDocSnap = await getDoc(doctorDocRef);

        // Check if user is an admin
        const adminDocRef = doc(db, "admins", currentUser.email);
        const adminDocSnap = await getDoc(adminDocRef);

        if (patientDocSnap.exists()) {
          setUserType("patient");
        } else if (doctorDocSnap.exists()) {
          setUserType("doctor");
          // Check if doctor is approved
          setIsApprovedDoctor(doctorDocSnap.data().status === "approved");
        } else if (adminDocSnap.exists()) {
          setUserType("admin");
        } else {
          setUserType(null);
        }
      } else {
        setUserType(null);
        setIsApprovedDoctor(false);
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

  // Handles the logout functionality --> Exits the session (Calls Firebase signOut)
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserType(null);
      setIsApprovedDoctor(false);
      setMenuOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Get dashboard link based on user type
  const getDashboardLink = () => {
    switch (userType) {
      case "admin":
        return "/admin-dashboard";
      case "doctor":
        return "/doctor-dashboard";
      case "patient":
        return "/patient-dashboard";
      default:
        return "/";
    }
  };

  // Determine if we should render logged-in navigation
  const isLoggedIn = user && userType;

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-purple-700 via-violet-600 to-indigo-700 text-white shadow-lg">
      {/* Logo and website name remains same in all views */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center space-x-3 text-gray-300 hover:text-orange-400 transition-colors duration-200 no-underline"
              onClick={() => setMenuOpen(false)}
            >
              <img
                src="img/TheraMindLogo.jpg"
                alt="TheraMind Logo"
                className="w-12 h-12 rounded-full object-cover border-1 border-purple-700"
              />
              <span className="text-2xl font-bold">TheraMind</span>
            </Link>
          </div>

          {/* Menu Button (Mobile) or a hamburger */}
          <div className="flex lg:hidden">
            <button
              className="text-gray-300 hover:text-orange-400 p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:justify-between lg:flex-1 lg:ml-12">
            {/* Nav Links */}
            <div className="flex items-center justify-center flex-1 space-x-12">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/about-us"
                    className="text-gray-300 hover:text-orange-400 transition-colors duration-200 text-lg no-underline"
                  >
                    About
                  </Link>
                  <Link
                    to="/meditation"
                    className="text-gray-300 hover:text-orange-400 transition-colors duration-200 text-lg no-underline"
                  >
                    Meditation
                  </Link>

                  <Link
                    to="/start-screen"
                    className="text-gray-300 hover:text-orange-400 transition-colors duration-200 text-lg no-underline"
                  >
                    Questionnaire
                  </Link>
                  <Link
                    to="/splash-screen"
                    className="text-gray-300 hover:text-orange-400 transition-colors duration-200 text-lg no-underline"
                  >
                    TheraChat
                  </Link>

                  {/* Education Dropdown upon hover */}
                  <div
                    className="relative group"
                    ref={dropdownRef}
                    onMouseEnter={() => setEducationDropdownOpen(true)}
                    onMouseLeave={() => setEducationDropdownOpen(false)}
                  >
                    <Link
                      to="/education-main"
                      className="flex items-center text-gray-300 hover:text-orange-400 transition-colors duration-200 text-lg no-underline"
                    >
                      Education
                      <ChevronDown size={18} className="ml-1" />
                    </Link>

                    <div
                      className={`absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-violet-600 ring-1 ring-black ring-opacity-5 transition-all duration-200 ${educationDropdownOpen
                          ? "opacity-100 visible translate-y-0"
                          : "opacity-0 invisible -translate-y-2"
                        }`}
                    >
                      <div className="py-1">
                        <Link
                          to="articles"
                          className="block px-4 py-2 text-gray-300 hover:bg-violet-700 hover:text-orange-500 transition-colors duration-200 no-underline"
                          onClick={() => setEducationDropdownOpen(false)}
                        >
                          Articles
                        </Link>
                        <Link
                          to="patient-stories"
                          className="block px-4 py-2 text-gray-300 hover:bg-violet-700 hover:text-orange-500 transition-colors duration-200 no-underline"
                          onClick={() => setEducationDropdownOpen(false)}
                        >
                          Patient Stories
                        </Link>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/about-us"
                    className="text-gray-300 hover:text-orange-400 transition-colors duration-200 text-lg no-underline"
                  >
                    About
                  </Link>
                  <Link
                    to="/meditation"
                    className="text-gray-300 hover:text-orange-400 transition-colors duration-200 text-lg no-underline"
                  >
                    Meditation
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
                      className="flex items-center text-gray-300 hover:text-orange-400 transition-colors duration-200 text-lg no-underline"
                    >
                      Education
                      <ChevronDown size={18} className="ml-1" />
                    </Link>

                    <div
                      className={`absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-violet-600 ring-1 ring-black ring-opacity-5 transition-all duration-200 ${educationDropdownOpen
                          ? "opacity-100 visible translate-y-0"
                          : "opacity-0 invisible -translate-y-2"
                        }`}
                    >
                      <div className="py-1">
                        <Link
                          to="articles"
                          className="block px-4 py-2 text-gray-300 hover:bg-violet-700 hover:text-orange-500 transition-colors duration-200 no-underline"
                          onClick={() => setEducationDropdownOpen(false)}
                        >
                          Articles
                        </Link>
                        <Link
                          to="patient-stories"
                          className="block px-4 py-2 text-gray-300 hover:bg-violet-700 hover:text-orange-500 transition-colors duration-200 no-underline"
                          onClick={() => setEducationDropdownOpen(false)}
                        >
                          Patient Stories
                        </Link>
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/contact-us"
                    className="text-gray-300 hover:text-orange-400 transition-colors duration-200 text-lg no-underline"
                  >
                    Contact
                  </Link>
                </>
              )}
            </div>

            {/* Desktop Auth Buttons */}
            {!isLoggedIn ? (
              <div className="flex items-center space-x-4 ml-12">
                <Link
                  to="/signup-landing"
                  className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-6 py-2.5 rounded-lg hover:from-fuchsia-600 hover:to-purple-600 shadow-md transition-colors duration-200 text-base font-medium no-underline"
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
              <div className="flex items-center space-x-4">
                {user.photoURL && (
                  <Link
                    to={getDashboardLink()}
                    className="flex items-center space-x-2 no-underline"
                  >
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-10 h-10 rounded-full border-1 border-indigo-500"
                    />
                    <span className="text-gray-300 font-medium hover:text-orange-400 transition-colors duration-200">
                      {user.displayName}
                    </span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-6 py-2.5 rounded-lg hover:from-fuchsia-600 hover:to-purple-600 transition-colors duration-200 font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Overlay */}
          <div
            className={`${menuOpen ? "opacity-50 visible" : "opacity-0 invisible"
              } fixed inset-0 bg-black transition-opacity duration-300 lg:hidden`}
            onClick={() => setMenuOpen(false)}
          />

          {/* Mobile Menu Drawer */}
          <div
            className={`${menuOpen ? "translate-x-0" : "translate-x-full"
              } fixed top-0 right-0 h-full w-64 bg-gradient-to-b from-purple-700 via-violet-600 to-indigo-700 shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto z-50`}
          >
            <div className="flex justify-end p-4">
              <button
                className="text-gray-300 hover:text-orange-400 p-2"
                onClick={() => setMenuOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="px-4 py-2 space-y-6">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/about-us"
                    className="block text-gray-300 hover:text-orange-400 py-2 text-lg no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    About
                  </Link>

                  <Link
                    to="/meditation"
                    className="block text-gray-300 hover:text-orange-400 py-2 text-lg no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    Meditation
                  </Link>
                  <Link
                    to="/start-screen"
                    className="block text-gray-300 hover:text-orange-400 py-2 text-lg no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    Questionnaire
                  </Link>
                  <Link
                    to="/splash-screen"
                    className="block text-gray-300 hover:text-orange-400 py-2 text-lg no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    TheraChat
                  </Link>
                  {/* Education Dropdown for Mobile */}
                  <div className="py-2">
                    <Link
                      to="/education-main"
                      className="block text-gray-300 hover:text-orange-400 py-2 text-lg no-underline"
                      onClick={() => setMenuOpen(false)}
                    >
                      Education
                    </Link>
                    <div className="ml-4 mt-2 space-y-2">
                      <Link
                        to="articles"
                        className="block text-gray-300 hover:text-orange-400 py-1 text-base no-underline"
                        onClick={() => setMenuOpen(false)}
                      >
                        Articles
                      </Link>
                      <Link
                        to="patient-stories"
                        className="block text-gray-300 hover:text-orange-400 py-1 text-base no-underline"
                        onClick={() => setMenuOpen(false)}
                      >
                        Patient Stories
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/about-us"
                    className="block text-gray-300 hover:text-orange-400 py-2 text-lg no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    to="/meditation"
                    className="block text-gray-300 hover:text-orange-400 py-2 text-lg no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    Meditation
                  </Link>
                  {/* Education Dropdown for Mobile */}
                  <div className="py-2">
                    <Link
                      to="/education-main"
                      className="block text-gray-300 hover:text-orange-400 py-2 text-lg no-underline"
                      onClick={() => setMenuOpen(false)}
                    >
                      Education
                    </Link>
                    <div className="ml-4 mt-2 space-y-2">
                      <Link
                        to="articles"
                        className="block text-gray-300 hover:text-orange-400 py-1 text-base no-underline"
                        onClick={() => setMenuOpen(false)}
                      >
                        Articles
                      </Link>
                      <Link
                        to="patient-stories"
                        className="block text-gray-300 hover:text-orange-400 py-1 text-base no-underline"
                        onClick={() => setMenuOpen(false)}
                      >
                        Patient Stories
                      </Link>
                    </div>
                  </div>
                  <Link
                    to="/contact-us"
                    className="block text-gray-300 hover:text-orange-400 py-2 text-lg no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </>
              )}

              {!isLoggedIn ? (
                <div className="space-y-4 pt-6 pb-8">
                  <Link
                    to="/signup-landing"
                    className="block text-center bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-6 py-2.5 rounded-lg hover:from-fuchsia-600 hover:to-purple-600 transition-colors duration-200 text-base font-medium no-underline"
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
                <div className="pt-6 pb-8">
                  <div className="flex items-center space-x-4 mb-4">
                    {user.photoURL && (
                      <Link
                        to={getDashboardLink()}
                        className="flex items-center space-x-2"
                        onClick={() => setMenuOpen(false)}
                      >
                        <img
                          src={user.photoURL}
                          alt={user.displayName}
                          className="w-10 h-10 rounded-full border-1 border-indigo-500"
                        />
                        <span className="text-gray-300 font-medium hover:text-orange-500 transition-colors duration-200">
                          {user.displayName}
                        </span>
                      </Link>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-6 py-2.5 rounded-lg hover:from-fuchsia-600 hover:to-purple-600 transition-colors duration-200 font-medium"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;