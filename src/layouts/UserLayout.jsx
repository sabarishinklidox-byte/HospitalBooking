import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for internal navigation
import Navbar from '../components/Navbar.jsx';

export default function UserLayout({ children }) {
  const currentYear = new Date().getFullYear();

  // Define policy links for cleaner mapping
  const policyLinks = [
    { name: "Terms & Conditions", path: "/terms-and-conditions" },
    { name: "Privacy Policy", path: "/privacy-policy" },
    { name: "Cancellation Policy", path: "/cancellation-policy" },
    { name: "Refund Policy", path: "/refund-policy" },
    { name: "Pricing Policy", path: "/pricing-policy" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Reusable Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4 text-center">
          
          {/* Policy Links Navigation */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-2">
            {policyLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-sm text-gray-500 hover:text-[#0b3b5e] hover:underline transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Copyright Section */}
          <div className="text-gray-500 text-sm">
            &copy; {currentYear}{' '}
            <a 
              href="https://www.inklidox.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-bold text-[#0b3b5e] hover:text-[#0055aa] transition-colors"
            >
              Inklidox Technologies
            </a>
            . All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
