// src/components/UpgradeNotice.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

function UpgradeNotice({ feature, planName }) {
  const navigate = useNavigate();

  const handleClick = () => {
    // For now, always send to admin billing page
    navigate('/admin/billing');
  };

  return (
    <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-semibold mb-1">Feature locked</p>
      <p className="mb-3">
        <span className="font-medium">{feature}</span> is not available on your
        current plan{planName ? ` (${planName})` : ''}. Please upgrade your plan
        to unlock this feature.
      </p>
      <button
        onClick={handleClick}
        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700"
      >
        View plans &amp; upgrade
      </button>
    </div>
  );
}

export default UpgradeNotice;
