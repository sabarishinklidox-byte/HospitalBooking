// src/layouts/UserLayout.jsx
import React from 'react';
import Navbar from '../components/Navbar.jsx'; 

export default function UserLayout({ children }) {
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
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} <span className="font-bold text-[#0b3b5e]"   href="https://www.inklidox.com" target="_blank" rel="noopener noreferrer">Inklidox Technologies</span>. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
