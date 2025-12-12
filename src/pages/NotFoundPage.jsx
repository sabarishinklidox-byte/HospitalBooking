// src/pages/NotFoundPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [targetPos, setTargetPos] = useState(2); // 0..4 columns

  // very small “click the tooth” mini-game
  const handleHit = (pos) => {
    if (pos === targetPos) {
      setScore((s) => s + 1);
      setTargetPos(Math.floor(Math.random() * 5));
    } else {
      setScore((s) => Math.max(0, s - 1));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6">
      <h1 className="text-5xl font-extrabold mb-2">404</h1>
      <p className="text-sm text-slate-300 mb-6 text-center">
        Oops, this page got a cavity. Help fix the right tooth or go back home.
      </p>

      {/* Mini game grid */}
      <div className="bg-slate-800 rounded-2xl p-4 shadow-xl mb-4">
        <p className="text-xs text-slate-300 mb-2 text-center">
          Click the glowing tooth to score points.
        </p>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleHit(idx)}
              className={
                'h-14 w-14 rounded-xl flex items-center justify-center text-2xl transition ' +
                (idx === targetPos
                  ? 'bg-amber-300 text-slate-900 shadow-lg animate-pulse'
                  : 'bg-slate-700 hover:bg-slate-600')
              }
            >
              🦷
            </button>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-slate-200">
          Score: <span className="font-bold">{score}</span>
        </p>
      </div>

      <button
        onClick={() => navigate('/', { replace: true })}
        className="mt-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-sm font-semibold shadow"
      >
        ⬅ Go back to dashboard
      </button>
    </div>
  );
}
