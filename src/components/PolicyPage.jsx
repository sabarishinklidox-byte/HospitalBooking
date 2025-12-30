// src/components/PolicyPage.jsx
import React from 'react';
import UserLayout from '../layouts/UserLayout'; // Adjust path to your UserLayout

export default function PolicyPage({ title, lastUpdated, children }) {
  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12">
          {/* Header */}
          <div className="border-b border-gray-100 pb-6 mb-8">
            <h1 className="text-3xl font-bold text-[#0b3b5e] mb-2">{title}</h1>
            <p className="text-sm text-gray-500">
              Last Updated: {lastUpdated || new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content Area - Styled for long text */}
          <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed space-y-6">
            {children}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
