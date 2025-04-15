// Footer
import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-purple-700 via-violet-600 to-indigo-700 text-white py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
          <div>
            <h2 className="text-2xl font-bold mb-6">TheraMind</h2>
            <p className="text-gray-300 leading-relaxed">
              A comprehensive platform promoting mental health awareness and
              providing essential tools for self-care.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-6">Quick Links</h3>
            <nav className="space-y-4">
              <Link
                to="/"
                className="block text-gray-300 hover:text-orange-400 no-underline"
              >
                Home
              </Link>
              <Link
                to="/Meditation"
                className="block text-gray-300 hover:text-orange-400 no-underline"
              >
                Meditation
              </Link>
              <Link
                to="/start-screen"
                className="block text-gray-300 hover:text-orange-400 no-underline"
              >
                Assessment
              </Link>
              <Link
                to="/splash-screen"
                className="block text-gray-300 hover:text-orange-400 no-underline"
              >
                TheraChat
              </Link>
              <Link
                to="/contact-us"
                className="block text-gray-300 hover:text-orange-400 no-underline"
              >
                Contact
              </Link>
              <Link
                to="/about-us"
                className="block text-gray-300 hover:text-orange-400 no-underline"
              >
                About
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-6">Resources</h3>
            <nav className="space-y-4">
              <Link
                to="/education-main"
                className="block text-gray-300 hover:text-orange-400 no-underline"
              >
                Education
              </Link>
              <Link
                to="/articles"
                className="block text-gray-300 hover:text-orange-400 no-underline"
              >
                Articles
              </Link>
              <Link
                to="/patient-stories"
                className="block text-gray-300 hover:text-orange-400 no-underline"
              >
                Patient Stories
              </Link>
              <Link
                to="/testimonial"
                className="block text-gray-300 hover:text-orange-400 no-underline"
              >
                Testimonial
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-6">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="w-5 h-5" /> contact@theramind.com
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="w-5 h-5" /> +1 (234) 567-890
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="w-5 h-5" />{" "}
                <span>123 Wellness Street, Mind City, MC 12345</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-purple-600 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300">
            © 2025 TheraMind. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {/* X Logo */}
            <a
              href="https://twitter.com/AbdulaImran"
              className="text-gray-300 hover:text-orange-400"
              aria-label="X"
            >
              <svg
                width="24" // Adjusted width for consistency
                height="24" // Adjusted height for consistency
                viewBox="0 0 1200 1227"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" />
              </svg>
            </a>
            {/* Instagram Logo */}
            <a
              href="http://instagram.com/poet.abdullah/"
              className="text-gray-300 hover:text-orange-400"
              aria-label="Instagram"
            >
              <svg
                fill="currentColor"
                width="30"
                height="30"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
              >
                <path d="M17.34,5.46h0a1.2,1.2,0,1,0,1.2,1.2A1.2,1.2,0,0,0,17.34,5.46Zm4.6,2.42a7.59,7.59,0,0,0-.46-2.43,4.94,4.94,0,0,0-1.16-1.77,4.7,4.7,0,0,0-1.77-1.15,7.3,7.3,0,0,0-2.43-.47C15.06,2,14.72,2,12,2s-3.06,0-4.12.06a7.3,7.3,0,0,0-2.43.47A4.78,4.78,0,0,0,3.68,3.68,4.7,4.7,0,0,0,2.53,5.45a7.3,7.3,0,0,0-.47,2.43C2,8.94,2,9.28,2,12s0,3.06.06,4.12a7.3,7.3,0,0,0,.47,2.43,4.7,4.7,0,0,0,1.15,1.77,4.78,4.78,0,0,0,1.77,1.15,7.3,7.3,0,0,0,2.43.47C8.94,22,9.28,22,12,22s3.06,0,4.12-.06a7.3,7.3,0,0,0,2.43-.47,4.7,4.7,0,0,0,1.77-1.15,4.85,4.85,0,0,0,1.16-1.77,7.59,7.59,0,0,0,.46-2.43c0-1.06.06-1.4.06-4.12S22,8.94,21.94,7.88ZM20.14,16a5.61,5.61,0,0,1-.34,1.86,3.06,3.06,0,0,1-.75,1.15,3.19,3.19,0,0,1-1.15.75,5.61,5.61,0,0,1-1.86.34c-1,.05-1.37.06-4,.06s-3,0-4-.06A5.73,5.73,0,0,1,6.1,19.8,3.27,3.27,0,0,1,5,19.05a3,3,0,0,1-.74-1.15A5.54,5.54,0,0,1,3.86,16c0-1-.06-1.37-.06-4s0-3,.06-4A5.54,5.54,0,0,1,4.21,6.1,3,3,0,0,1,5,5,3.14,3.14,0,0,1,6.1,4.2,5.73,5.73,0,0,1,8,3.86c1,0,1.37-.06,4-.06s3,0,4,.06a5.61,5.61,0,0,1,1.86.34A3.06,3.06,0,0,1,19.05,5,3.06,3.06,0,0,1,19.8,6.1,5.61,5.61,0,0,1,20.14,8c.05,1,.06,1.37.06,4S20.19,15,20.14,16ZM12,6.87A5.13,5.13,0,1,0,17.14,12,5.12,5.12,0,0,0,12,6.87Zm0,8.62A3.49,3.49,0,1,1,15.49,12,3.49,3.49,0,0,1,12,15.49Z" />
              </svg>
            </a>

            {/* Facebook Logo */}
            <a
              href="https://www.facebook.com/abdullahimranarshad/"
              className="text-gray-300 hover:text-orange-400"
              aria-label="Facebook"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.373 0 12.073c0 5.898 4.305 10.815 9.938 11.924v-8.444H7.039v-3.48h2.899v-2.573c0-2.872 1.693-4.459 4.41-4.459 1.243 0 2.539.092 2.539.092v2.799h-1.428c-1.405 0-1.851.874-1.851 1.764v2.38h3.159l-1.235 3.48h-1.924v8.444C19.695 22.888 24 17.971 24 12.073z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
