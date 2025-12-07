import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const galleryRef = useRef(null);
  const planRef = useRef(null);
  const mapRef = useRef(null);
  const containerRef = useRef(null); // Ref for the main wrapper

  // Use useLayoutEffect for smoother GSAP initialization in React
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      
      // 1. Hero Text Parallax
      gsap.to(titleRef.current, {
        yPercent: 50,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      // 2. HORIZONTAL SCROLL GALLERY (STABILIZED)
      const sections = gsap.utils.toArray(".gallery-item");
      
      gsap.to(sections, {
        xPercent: -100 * (sections.length - 1), 
        ease: "none",
        scrollTrigger: {
          trigger: galleryRef.current,
          pin: true,
          scrub: 1,
          // Fixed pixel value ensures consistent speed regardless of screen height
          end: "+=3500", 
        }
      });

      // 3. Reveal Plans
      gsap.fromTo(".plan-card", 
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: planRef.current,
            start: "top 85%", // Triggers slightly earlier
            toggleActions: "play none none reverse" 
          }
        }
      );

      // 4. Reveal Map
      gsap.fromTo(mapRef.current,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: mapRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );

    }, containerRef); // Scope GSAP to this component

    return () => ctx.revert(); // Cleanup on unmount
  }, []);

  return (
    <div ref={containerRef} className="relative w-full overflow-x-hidden bg-gymBlack">
      
      {/* --- HERO SECTION --- */}
      <div ref={heroRef} className="relative h-screen flex items-center justify-center bg-gymBlack">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gymBlack via-transparent to-black/60 z-10"></div>

        <div ref={titleRef} className="relative z-20 text-center w-full px-4">
          <div className="inline-block px-4 py-1 border border-gymGold rounded-full mb-6">
            <span className="text-gymGold text-xs md:text-sm font-bold tracking-widest uppercase">
              Est. 2024 • Jangaon's #1 Rated Gym
            </span>
          </div>
          <h1 className="text-6xl md:text-[10rem] leading-none font-black uppercase tracking-tighter">
            <span className="block text-transparent" style={{ WebkitTextStroke: '2px white' }}>Forge</span>
            <span className="block text-white">Your</span>
            <span className="block text-transparent" style={{ WebkitTextStroke: '2px white' }}>Legacy</span>
          </h1>
          <p className="mt-8 text-lg text-gray-300 max-w-2xl mx-auto font-light">
            Welcome to <span className="text-gymGold font-bold">SWAMY GYM</span>. Where pain becomes power.
          </p>
          <div className="mt-12 animate-bounce">
            <p className="text-xs tracking-[0.3em] text-gray-500">SCROLL TO BEGIN</p>
            <div className="h-10 w-[1px] bg-gymGold mx-auto mt-2"></div>
          </div>
        </div>
      </div>

      {/* --- HORIZONTAL GALLERY SECTION (STABILIZED) --- */}
      {/* We use flex-nowrap and w-[400%] to ensure space exists, but GSAP handles the move */}
      <div ref={galleryRef} className="h-screen bg-gymBlack flex flex-nowrap overflow-hidden relative z-40">
        
        {/* Intro Slide */}
        <div className="gallery-item min-w-full w-screen h-screen flex-shrink-0 flex items-center justify-center bg-black relative border-r border-gray-800">
          <div className="text-center px-6">
             <h2 className="text-6xl md:text-8xl font-black text-white uppercase italic mb-4">
               Inside <br/><span className="text-gymGold">The Arena</span>
             </h2>
             <p className="text-gray-400 text-xl max-w-lg mx-auto"> Swipe to explore our world-class facility.</p>
             <div className="text-4xl mt-8 animate-pulse text-gymGold">→</div>
          </div>
        </div>

        {/* Image 1: Equipment */}
        <div className="gallery-item min-w-full w-screen h-screen flex-shrink-0 relative">
          <img 
            src="/IMG-20251207-WA0001.jpg" 
            alt="Gym Equipment" 
            className="w-full h-full object-cover opacity-80" 
          />
          <div className="absolute bottom-20 left-6 md:left-20 bg-black/50 p-4 rounded backdrop-blur-sm">
             <h3 className="text-4xl md:text-6xl font-black text-transparent stroke-text uppercase" style={{ WebkitTextStroke: '1px white' }}>Battle Ready</h3>
             <h3 className="text-4xl md:text-6xl font-black text-white uppercase">Equipment</h3>
          </div>
        </div>

        {/* Image 2: Action/Grind */}
        <div className="gallery-item min-w-full w-screen h-screen flex-shrink-0 relative">
          <img 
            src="/IMG-20251207-WA0003.jpg" 
            alt="The Grind" 
            className="w-full h-full object-cover opacity-80" 
          />
          <div className="absolute bottom-20 left-6 md:left-20 bg-black/50 p-4 rounded backdrop-blur-sm">
             <h3 className="text-4xl md:text-6xl font-black text-transparent stroke-text uppercase" style={{ WebkitTextStroke: '1px white' }}>Pure</h3>
             <h3 className="text-4xl md:text-6xl font-black text-white uppercase">Grind</h3>
          </div>
        </div>

        {/* Image 3: Achievements */}
        <div className="gallery-item min-w-full w-screen h-screen flex-shrink-0 relative">
          <img 
            src="/IMG-20251207-WA0002.jpg" 
            alt="Victory" 
            className="w-full h-full object-cover opacity-80" 
          />
          <div className="absolute bottom-20 left-6 md:left-20 bg-black/50 p-4 rounded backdrop-blur-sm">
             <h3 className="text-4xl md:text-6xl font-black text-transparent stroke-text uppercase" style={{ WebkitTextStroke: '1px white' }}>Our</h3>
             <h3 className="text-4xl md:text-6xl font-black text-white uppercase">Victories</h3>
          </div>
        </div>

      </div>

      {/* --- PRICING PLANS SECTION --- */}
      <div ref={planRef} className="min-h-screen bg-gymBlack py-24 px-6 relative z-30">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic">
            Membership <span className="text-gymGold">Plans</span>
          </h2>
          <div className="w-24 h-1 bg-gymGold mx-auto mt-4"></div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* SILVER */}
          <div className="plan-card bg-[#111] p-8 border border-gray-800 hover:border-gray-500 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gray-800 rounded-bl-full -mr-10 -mt-10 transition-all group-hover:bg-gray-600"></div>
            <h3 className="text-2xl font-bold text-gray-300 mb-2">SILVER</h3>
            <h4 className="text-4xl font-black text-white mb-6">₹1,500<span className="text-sm font-normal text-gray-500">/mo</span></h4>
            <ul className="space-y-4 text-gray-400 mb-8">
              <li>• Gym Access (6AM - 10PM)</li>
              <li>• Cardio Section</li>
              <li>• General Trainer Support</li>
            </ul>
            <button className="w-full py-3 border border-white text-white font-bold hover:bg-white hover:text-black transition-colors uppercase tracking-widest">Select Plan</button>
          </div>

          {/* GOLD */}
          <div className="plan-card bg-[#111] p-8 border-2 border-gymGold transform md:-translate-y-4 shadow-[0_0_30px_rgba(255,215,0,0.1)] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-20 h-20 bg-gymGold rounded-bl-full -mr-10 -mt-10"></div>
            <h3 className="text-2xl font-bold text-gymGold mb-2">GOLD</h3>
            <h4 className="text-4xl font-black text-white mb-6">₹3,000<span className="text-sm font-normal text-gray-500">/mo</span></h4>
            <ul className="space-y-4 text-gray-300 mb-8 font-medium">
              <li>• <span className="text-white">All Silver Features</span></li>
              <li>• Personal Diet Plan</li>
              <li>• Steam Bath (2x Month)</li>
            </ul>
            <button className="w-full py-3 bg-gymGold text-black font-black hover:bg-white transition-colors uppercase tracking-widest">Most Popular</button>
          </div>

          {/* PLATINUM */}
          <div className="plan-card bg-[#111] p-8 border border-gray-800 hover:border-gray-500 transition-all duration-300 group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-20 h-20 bg-gray-800 rounded-bl-full -mr-10 -mt-10 transition-all group-hover:bg-gray-600"></div>
            <h3 className="text-2xl font-bold text-blue-400 mb-2">PLATINUM</h3>
            <h4 className="text-4xl font-black text-white mb-6">₹8,000<span className="text-sm font-normal text-gray-500">/3mo</span></h4>
            <ul className="space-y-4 text-gray-400 mb-8">
              <li>• <span className="text-white">All Gold Features</span></li>
              <li>• Unlimited Steam/Sauna</li>
              <li>• Personal Trainer Assigned</li>
            </ul>
            <button className="w-full py-3 border border-white text-white font-bold hover:bg-white hover:text-black transition-colors uppercase tracking-widest">Select Plan</button>
          </div>
        </div>
      </div>

      {/* --- LOCATION / MAP SECTION --- */}
      <div className="bg-gymBlack pb-24 px-6 relative z-30">
        <div ref={mapRef} className="max-w-7xl mx-auto">
          
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic">
              Locate The <span className="text-gymGold">Arena</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-800">
            
            {/* Left: Contact Info */}
            <div className="bg-[#111] p-12 flex flex-col justify-center">
              <h3 className="text-3xl font-bold text-white mb-6">SWAMY GYM</h3>
              <div className="space-y-6 text-gray-400">
                <p className="flex items-start gap-4">
                  <span className="text-gymGold text-xl mt-1">📍</span> 
                  <span className="text-sm md:text-base">Shop No 2-34, near Akshaya Hotel,<br/>Kurumawada, Balaji Nagar,<br/>Jangaon, Telangana 506167</span>
                </p>
                <p className="flex items-center gap-4">
                  <span className="text-gymGold text-xl">📞</span> 
                  <span>+91 99087 70019</span>
                </p>
                <p className="flex items-center gap-4">
                  <span className="text-gymGold text-xl">✉️</span> 
                  <span>contact@swamygym.com</span>
                </p>
              </div>
              
              <a 
                href="https://www.google.com/maps/search/?api=1&query=Swamy+Gym+Jangaon" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-10 inline-block text-center py-4 px-8 bg-transparent border border-gymGold text-gymGold font-bold uppercase tracking-widest hover:bg-gymGold hover:text-black transition-all"
              >
                Open in Google Maps
              </a>
            </div>

            {/* Right: Map Embed (Color Version) */}
            <div className="h-[400px] w-full bg-gray-900 relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4176.66315510681!2d79.15930917556699!3d17.717973183226686!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb59c0b907240d%3A0x9bfc0e2d65aa4dfc!2sSWAMY%20FITNESS%20GYM!5e1!3m2!1sen!2sin!4v1765100352090!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                /* Filter is removed/commented out for original color */
                style={{ border: 0 }} 
                loading="lazy" 
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                title="Swamy Gym Location"
              ></iframe>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;