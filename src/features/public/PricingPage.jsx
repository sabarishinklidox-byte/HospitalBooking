import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { ENDPOINTS } from '../../lib/endpoints';
import { FiCheck, FiX, FiArrowRight } from 'react-icons/fi';

gsap.registerPlugin(ScrollTrigger);

export default function PricingPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Animation Refs
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const cardsRef = useRef([]);
  const blobsRef = useRef([]);

  // Load Data
useEffect(() => {
  const loadPlans = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching plans from:', ENDPOINTS.PUBLIC.PLANS);
      const res = await api.get(ENDPOINTS.PUBLIC.PLANS);
      
      // LOGS FIRST
      console.log('📦 FULL API Response:', res);
      console.log('📋 res.data:', res.data);
      console.log('🔍 Type of res.data:', typeof res.data);
      console.log('📊 Is Array?', Array.isArray(res.data));
      
      // SAFE HANDLING - REPLACE THE BROKEN LINE
      let plansData = [];
      if (Array.isArray(res.data)) {
        plansData = res.data;
      } else if (res.data && Array.isArray(res.data.plans)) {
        plansData = res.data.plans;
      } else if (res.data && Array.isArray(res.data.data)) {
        plansData = res.data.data;
      } else {
        console.error('❌ No valid plans array found');
        setPlans([]);
        setLoading(false);
        return;
      }
      
      const filteredPlans = plansData
        .filter(p => p.isActive && !p.deletedAt)
        .sort((a, b) => Number(a.priceMonthly) - Number(b.priceMonthly));
      
      console.log('✅ Filtered plans:', filteredPlans);
      setPlans(filteredPlans);
      
    } catch (error) {
      console.error('💥 Plans load error:', error);
      toast.error('Failed to load pricing plans');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };
  loadPlans();
}, []);

  // ANIMATIONS
  useEffect(() => {
    if (!loading && plans.length > 0) {
      const ctx = gsap.context(() => {
        
        // 1. HERO ANIMATION (Parallax Fade Out)
        // Instead of pinning, we just scrub the animation as you scroll past
        gsap.to(heroRef.current, {
          yPercent: 30, // Moves down slightly slower than scroll (Parallax)
          opacity: 0,
          scale: 0.95,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "400px top", // Animation finishes after 400px scroll
            scrub: true,      // Smoothly links to scrollbar
          },
        });

        // 2. BACKGROUND BLOBS (Windmill Rotation)
        blobsRef.current.forEach((blob, i) => {
            if(blob) {
                gsap.to(blob, {
                    rotate: 360,
                    ease: "none",
                    scrollTrigger: {
                        trigger: document.body,
                        start: "top top",
                        end: "bottom bottom",
                        scrub: 2, // Slow rotation linked to scroll
                    }
                });
            }
        });

        // 3. CARDS ENTRANCE (Rise Up)
        cardsRef.current.forEach((card, i) => {
          if (card) {
            gsap.fromTo(
              card,
              { opacity: 0, y: 100 }, // Start lower
              {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: card,
                  start: "top 85%", // Triggers when top of card hits 85% of viewport
                  toggleActions: "play none none reverse",
                },
              }
            );
          }
        });

      }, containerRef);

      return () => ctx.revert();
    }
  }, [loading, plans]);

  const isRecommended = (index, total) => total === 3 && index === 1;

  return (
    <div
      ref={containerRef}
      className="min-h-screen relative overflow-x-hidden bg-white text-[#003366] font-sans"
    >

      {/* ---------------- BACKGROUND BLOBS ---------------- */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden h-full fixed">
        <div
          ref={el => blobsRef.current[0] = el}
          className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#003366] rounded-full blur-[120px] opacity-[0.04]"
        />
        <div
          ref={el => blobsRef.current[1] = el}
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#87CEEB] rounded-full blur-[100px] opacity-[0.15]"
        />
      </div>

      {/* ---------------- NAVBAR ---------------- */}
      <nav className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
          <div
            className="flex items-center gap-2 text-2xl font-extrabold cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 rounded-lg bg-[#003366] text-white flex items-center justify-center text-lg font-bold">D</div>
            <span className="group-hover:opacity-80 transition-opacity">
               DocBook<span className="text-[#87CEEB]"></span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button 
                onClick={() => navigate('/admin/login')}
                className="text-[#003366] font-semibold hover:text-[#00509E] transition-colors"
            >
                Login
            </button>
            <button
                onClick={() => navigate('/register')}
                className="px-6 py-2.5 rounded-xl font-bold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                style={{
                  background: "linear-gradient(135deg, #003366, #00509E)",
                }}
            >
                Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ---------------- HERO SECTION (Scrolls Naturally) ---------------- */}
      <section className="relative z-10 pt-20 pb-10">
        <div
          ref={heroRef}
          className="flex flex-col items-center justify-center text-center px-4"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#E6F0F8] text-[#003366] text-xs font-bold uppercase tracking-widest mb-8 border border-[#D1E3F3]">
            Pricing Plans
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight max-w-4xl mx-auto text-[#003366]">
            Pricing that grows with
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#003366] to-[#4A90E2]">
              your clinic.
            </span>
          </h1>

          <p className="text-xl text-slate-500 mb-12 max-w-xl mx-auto leading-relaxed">
            Simple, transparent pricing. No hidden fees. <br/>
    
          </p>
        </div>
      </section>

      {/* ---------------- CARDS SECTION ---------------- */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 pb-32"> 
        {loading ? (
           <div className="flex justify-center py-20">
             <div className="w-12 h-12 border-4 border-[#003366] border-t-transparent rounded-full animate-spin"></div>
           </div>
        ) : plans.length === 0 ? (
           <div className="text-center py-20 border border-dashed border-slate-300 rounded-2xl">
             <p className="text-slate-500">No active plans found.</p>
           </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-10 items-start">
            {plans.map((plan, i) => {
               const recommended = isRecommended(i, plans.length);
               
               return (
                <div
                  key={plan.id}
                  ref={el => cardsRef.current[i] = el}
                  className={`
                    relative flex flex-col p-8 rounded-[2rem] bg-white transition-all duration-300 group
                    ${recommended 
                       ? 'border-2 border-[#003366] shadow-2xl z-20 scale-105' 
                       : 'border border-gray-100 shadow-xl hover:shadow-2xl hover:border-[#87CEEB]'
                    }
                  `}
                >
                  {/* Badge */}
                  {recommended && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-[#003366] text-white text-xs font-bold px-6 py-2 rounded-full uppercase tracking-widest shadow-lg">
                            Most Popular
                        </span>
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-2 text-[#003366]">{plan.name}</h3>
                    <p className="text-slate-500 text-sm h-10 leading-snug">
                      {plan.isTrial ? "Perfect for testing the platform." : "Everything you need to scale."}
                    </p>
                  </div>

                  <div className="mb-8 pb-8 border-b border-gray-100">
                    <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-extrabold text-[#003366]">
                            {plan.currency === 'INR' ? '₹' : '$'}{Number(plan.priceMonthly)}
                        </span>
                        <span className="text-slate-400 font-semibold text-lg">/mo</span>
                    </div>
                  </div>

                  <div className="flex-grow mb-8">
                    <ul className="space-y-4">
                      <FeatureItem active={true} text={`${plan.maxDoctors} Doctors Allowed`} />
                      <FeatureItem active={true} text={`${plan.maxBookingsPerMonth} Bookings / Month`} />
                      <FeatureItem active={plan.enableGoogleReviews} text="Google Reviews" />
                      <FeatureItem active={plan.allowEmbedReviews} text="Website Embed Widget" />
                      <FeatureItem active={plan.allowOnlinePayments} text="Online Payments" />
                      <FeatureItem active={plan.enableAuditLogs} text="Admin Audit Logs" />
                      <FeatureItem active={plan.allowCustomBranding} text="Custom Branding" />
                    </ul>
                  </div>

                  <button
                    onClick={() => navigate(`/register?planId=${plan.id}`)}
                    className={`w-full py-4 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 ${
                        recommended
                          ? 'bg-[#003366] text-white hover:bg-[#002244]'
                          : 'bg-[#F0F7FF] text-[#003366] hover:bg-[#E0EEFF]'
                    }`}
                  >
                    {plan.isTrial ? 'Start Free Trial' : 'Get Started Now'}
                  </button>
                </div>
               );
            })}
          </div>
        )}
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className=''>
      
        
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-gray-100 text-center text-slate-400 text-xs">
            © {new Date().getFullYear()} INKLIDOX. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FeatureItem({ active, text }) {
  return (
    <li className={`flex items-center gap-3 text-sm transition-colors ${active ? 'text-slate-700' : 'text-slate-400 opacity-60'}`}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
        active ? 'bg-[#E8F5E9] text-[#4CAF50]' : 'bg-gray-100 text-slate-300'
      }`}>
        {active ? <FiCheck size={12} /> : <FiX size={12} />}
      </div>
      <span className={!active ? 'line-through decoration-slate-300' : ''}>
        {text}
      </span>
    </li>
  );
}
