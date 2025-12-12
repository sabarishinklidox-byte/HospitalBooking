import React from 'react';

export default function Loader({ fullScreen = true }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Animated Spinner */}
      <div className="relative w-12 h-12">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-[#003366] rounded-full border-t-transparent animate-spin"></div>
      </div>
      
      {/* Optional Text */}
      <p className="text-sm font-medium text-gray-500 animate-pulse">
        Loading...
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center w-full">
        {content}
      </div>
    );
  }

  return content;
}
