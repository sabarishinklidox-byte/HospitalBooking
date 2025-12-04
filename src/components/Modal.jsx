import React from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-[#003366]">{title}</h3>
          <button
            className="text-gray-500 hover:text-black text-2xl"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[80vh] overflow-y-auto pr-2">
          {children}
        </div>
      </div>
    </div>
  );
}
