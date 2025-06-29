// Navbar.js
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Menu, X, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isApprovedDoctor, setIsApprovedDoctor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const [isSignupInProgress, setIsSignupInProgress] = useState(false); // New state
  const dropdownRef = useRef(null);
  const auth = getAuth();
  const navigate = useNavigate();

  // When mobile menu opens, scrolling is disabled to prevent background interaction
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [menuOpen]);

  // Check if user is in signup process (detect signup pages)
  useEffect(() => {
    const currentPath = window.location.pathname;
    const signupPaths = ['/signup-landing', '/patient-signup', '/doctor-signup'];
    setIsSignupInProgress(signupPaths.includes(currentPath));
  }, []);

  // Check user type and status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Check if user is a patient
          const patientDocRef = doc(db, "patients", currentUser.email);
          const patientDocSnap = await getDoc(patientDocRef);

          // Check if user is a doctor
          const doctorDocRef = doc(db, "doctors", currentUser.email);
          const doctorDocSnap = await getDoc(doctorDocRef);

          // Check if user is an admin
          const adminDocRef = doc(db, "admin", currentUser.email);
          const adminDocSnap = await getDoc(adminDocRef);

          if (patientDocSnap.exists()) {
            setUserType("patient");
          } else if (doctorDocSnap.exists()) {
            setUserType("doctor");
            // Check if doctor is approved
            setIsApprovedDoctor(doctorDocSnap.data().STATUS === "approved");
          } else if (adminDocSnap.exists()) {
            setUserType("admin");
          } else {
            setUserType(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserType(null);
          setIsApprovedDoctor(false);
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

  // Handles the logout functionality
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserType(null);
      setIsApprovedDoctor(false);
      setMenuOpen(false);
      navigate("/login");
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

  // Get user's initials for avatar
  const getUserInitials = () => {
    if (user?.displayName) {
      const nameParts = user.displayName.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return user.displayName[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.displayName) {
      return user.displayName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return "User";
  };

  // Determine if we should show logged-in navigation
  // Only show if user is logged in, has a valid user type, and is NOT in signup process
  const isFullyLoggedIn = user && userType && !isSignupInProgress &&
    (userType === "patient" ||
      userType === "admin" ||
      (userType === "doctor" && isApprovedDoctor));

  // Render questionnaire link based on user type
  const renderQuestionnaireOrAlternative = () => {
    if (userType === "doctor") {
      return (
        <Link
          to="/manage-patients"
          className="text-gray-300 hover:text-orange-400 transition-colors duration-200 text-lg no-underline"
        >
          Manage Patients
        </Link>
      );
    } else if (userType === "patient") {
      return (
        <Link
          to="/start-screen"
          className="text-gray-300 hover:text-orange-400 transition-colors duration-200 text-lg no-underline"
        >
          Questionnaire
        </Link>
      );
    }
    // Admin gets no questionnaire/alternative link
    return null;
  };

  // Mobile version of questionnaire/alternative
  const renderMobileQuestionnaireOrAlternative = () => {
    if (userType === "doctor") {
      return (
        <Link
          to="/manage-patients"
          className="block text-gray-300 hover:text-orange-400 py-2 text-lg no-underline"
          onClick={() => setMenuOpen(false)}
        >
          Manage Patients
        </Link>
      );
    } else if (userType === "patient") {
      return (
        <Link
          to="/start-screen"
          className="block text-gray-300 hover:text-orange-400 py-2 text-lg no-underline"
          onClick={() => setMenuOpen(false)}
        >
          Questionnaire
        </Link>
      );
    }
    return null;
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-purple-700 via-violet-600 to-indigo-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link
              to="/"
              className="flex items-center space-x-2 sm:space-x-3 text-gray-300 hover:text-orange-400 transition-colors duration-200 no-underline"
              onClick={() => setMenuOpen(false)}
            >
              <img
                src="img/TheraMindLogo.jpg"
                alt="TheraMind Logo"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-1 border-purple-700"
              />
              <span className="text-xl sm:text-2xl font-bold">TheraMind</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden">
            <button
              className="text-gray-300 hover:text-orange-400 p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:justify-between lg:flex-1 lg:ml-8">
            {/* Nav Links */}
            <div className="flex items-center justify-center flex-1 space-x-8">
              {isFullyLoggedIn ? (
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

                  {renderQuestionnaireOrAlternative()}

                  <Link
                    to="/splash-screen"
                    className="text-gray-300 hover:text-orange-400 transition-colors duration-200 text-lg no-underline"
                  >
                    TheraChat
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
            {!isFullyLoggedIn ? (
              <div className="flex items-center space-x-4 ml-8">
                <Link
                  to="/signup-landing"
                  className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:from-fuchsia-600 hover:to-purple-600 shadow-md transition-colors duration-200 text-sm sm:text-base font-medium no-underline"
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors duration-200 text-sm sm:text-base font-medium no-underline"
                >
                  Login
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to={getDashboardLink()}
                  className="flex items-center space-x-2 no-underline"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-400 flex items-center justify-center text-white font-medium border-1 border-indigo-500">
                    {getUserInitials()}
                  </div>
                  <span className="text-gray-300 font-medium hover:text-orange-400 transition-colors duration-200 text-sm sm:text-base">
                    {getUserDisplayName()}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:from-fuchsia-600 hover:to-purple-600 transition-colors duration-200 font-medium text-sm sm:text-base"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`${menuOpen ? "opacity-50 visible" : "opacity-0 invisible"
          } fixed inset-0 bg-black transition-opacity duration-300 lg:hidden z-40`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <div
        className={`${menuOpen ? "translate-x-0" : "translate-x-full"
          } fixed top-0 right-0 h-full w-80 sm:w-96 bg-gradient-to-b from-purple-700 via-violet-600 to-indigo-700 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto z-50`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-purple-600">
          <div className="flex items-center space-x-2">
            <img
              src="img/TheraMindLogo.jpg"
              alt="TheraMind Logo"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-lg font-bold text-white">TheraMind</span>
          </div>
          <button
            className="text-gray-300 hover:text-orange-400 p-2"
            onClick={() => setMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu Content */}
        <div className="px-6 py-4 space-y-1">
          {isFullyLoggedIn ? (
            <>
              {/* User Profile Section */}
              <div className="mb-6 pb-4 border-b border-purple-600">
                <Link
                  to={getDashboardLink()}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-600 transition-colors duration-200 no-underline"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-400 flex items-center justify-center text-white font-medium border-2 border-indigo-500">
                    {getUserInitials()}
                  </div>
                  <div>
                    <div className="text-white font-medium text-base">
                      {getUserDisplayName()}
                    </div>
                    <div className="text-gray-300 text-sm capitalize">
                      {userType}
                    </div>
                  </div>
                </Link>
              </div>

              {/* Navigation Links */}
              <Link
                to="/about-us"
                className="block text-gray-300 hover:text-orange-400 hover:bg-purple-600 px-4 py-3 rounded-lg transition-colors duration-200 text-lg no-underline"
                onClick={() => setMenuOpen(false)}
              >
                About
              </Link>

              <Link
                to="/meditation"
                className="block text-gray-300 hover:text-orange-400 hover:bg-purple-600 px-4 py-3 rounded-lg transition-colors duration-200 text-lg no-underline"
                onClick={() => setMenuOpen(false)}
              >
                Meditation
              </Link>

              {renderMobileQuestionnaireOrAlternative() && (
                <div className="px-4 py-3">
                  {renderMobileQuestionnaireOrAlternative()}
                </div>
              )}

              <Link
                to="/splash-screen"
                className="block text-gray-300 hover:text-orange-400 hover:bg-purple-600 px-4 py-3 rounded-lg transition-colors duration-200 text-lg no-underline"
                onClick={() => setMenuOpen(false)}
              >
                TheraChat
              </Link>

              {/* Education Section */}
              <div className="py-2">
                <Link
                  to="/education-main"
                  className="block text-gray-300 hover:text-orange-400 hover:bg-purple-600 px-4 py-3 rounded-lg transition-colors duration-200 text-lg no-underline"
                  onClick={() => setMenuOpen(false)}
                >
                  Education
                </Link>
                <div className="ml-6 mt-1 space-y-1">
                  <Link
                    to="articles"
                    className="block text-gray-300 hover:text-orange-400 hover:bg-purple-600 px-4 py-2 rounded-lg transition-colors duration-200 text-base no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    Articles
                  </Link>
                  <Link
                    to="patient-stories"
                    className="block text-gray-300 hover:text-orange-400 hover:bg-purple-600 px-4 py-2 rounded-lg transition-colors duration-200 text-base no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    Patient Stories
                  </Link>
                </div>
              </div>

              {/* Logout Button */}
              <div className="pt-4 mt-6 border-t border-purple-600">
                <button
                  onClick={handleLogout}
                  className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:from-fuchsia-600 hover:to-purple-600 transition-colors duration-200 font-medium text-base"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Non-logged-in menu */}
              <Link
                to="/about-us"
                className="block text-gray-300 hover:text-orange-400 hover:bg-purple-600 px-4 py-3 rounded-lg transition-colors duration-200 text-lg no-underline"
                onClick={() => setMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/meditation"
                className="block text-gray-300 hover:text-orange-400 hover:bg-purple-600 px-4 py-3 rounded-lg transition-colors duration-200 text-lg no-underline"
                onClick={() => setMenuOpen(false)}
              >
                Meditation
              </Link>

              {/* Education Section */}
              <div className="py-2">
                <Link
                  to="/education-main"
                  className="block text-gray-300 hover:text-orange-400 hover:bg-purple-600 px-4 py-3 rounded-lg transition-colors duration-200 text-lg no-underline"
                  onClick={() => setMenuOpen(false)}
                >
                  Education
                </Link>
                <div className="ml-6 mt-1 space-y-1">
                  <Link
                    to="articles"
                    className="block text-gray-300 hover:text-orange-400 hover:bg-purple-600 px-4 py-2 rounded-lg transition-colors duration-200 text-base no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    Articles
                  </Link>
                  <Link
                    to="patient-stories"
                    className="block text-gray-300 hover:text-orange-400 hover:bg-purple-600 px-4 py-2 rounded-lg transition-colors duration-200 text-base no-underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    Patient Stories
                  </Link>
                </div>
              </div>

              <Link
                to="/contact-us"
                className="block text-gray-300 hover:text-orange-400 hover:bg-purple-600 px-4 py-3 rounded-lg transition-colors duration-200 text-lg no-underline"
                onClick={() => setMenuOpen(false)}
              >
                Contact
              </Link>

              {/* Auth Buttons */}
              <div className="space-y-3 pt-6 mt-6 border-t border-purple-600">
                <Link
                  to="/signup-landing"
                  className="block text-center bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:from-fuchsia-600 hover:to-purple-600 transition-colors duration-200 text-base font-medium no-underline"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className="block bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors duration-200 text-center font-medium no-underline"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;