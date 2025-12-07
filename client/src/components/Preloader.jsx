import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const Preloader = ({ setComplete }) => {
  const curtainRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // 1. Text fades in (Faster: 0.5s)
    tl.to(textRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.5, 
      ease: "power3.out"
    })
    // 2. Short pause (0.2s)
    .to({}, { duration: 0.2 }) 
    // 3. Slide the curtain UP (Faster: 0.8s)
    .to(curtainRef.current, {
      yPercent: -100,
      duration: 0.8,
      ease: "power4.inOut",
      onComplete: () => setComplete(true)
    });

  }, [setComplete]);

  return (
    <div 
      ref={curtainRef} 
      className="fixed inset-0 z-[9999] bg-gymBlack flex items-center justify-center"
    >
      <div className="overflow-hidden">
        <h1 
          ref={textRef} 
          className="text-6xl md:text-8xl font-black text-transparent stroke-text opacity-0 translate-y-10 uppercase tracking-tighter"
          style={{ WebkitTextStroke: '2px #FFD700', color: 'transparent' }} 
        >
          SWAMY GYM
        </h1>
      </div>
    </div>
  );
};

export default Preloader;