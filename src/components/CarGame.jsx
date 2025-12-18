import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { X, CarFront, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const CAR_WIDTH = 40;
const CAR_HEIGHT = 70;
const MAX_SPEED = 10;
const ACCELERATION = 0.2;
const FRICTION = 0.92;
const TURN_SPEED = 3.5;

const CarGame = ({ onUpdate }) => {
  const [isMobile, setIsMobile] = useState(false);
  const platformTuning = useMemo(() => {
    if (typeof navigator === 'undefined') {
      return { accel: 1, max: 1, frictionPower: 1 };
    }
    const ua = navigator.userAgent;
    const isSafari = /Safari/i.test(ua) && !/Chrome/i.test(ua);
    if (isSafari) {
      return { accel: 1.35, max: 1.2, frictionPower: 0.7 };
    }
    return { accel: 1, max: 1, frictionPower: 1 };
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const carRef = useRef(null);
  const skidLayerRef = useRef(null);
  const skidMarksRef = useRef([]);
  // Initial position state only
  const [initialPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight - 150 });
  
  // Velocity state for lights (optimized)
  const [lightState, setLightState] = useState('idle'); // 'idle', 'forward', 'reverse', 'braking'
  const [hasMoved, setHasMoved] = useState(false);
  const [isHonking, setIsHonking] = useState(false); // New state for honking
  
  // Refs for game loop to avoid closure staleness
  const gameState = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight - 150,
    rotation: 0,
    velocity: 0,
    driftFactor: 0, // New drift factor
    keys: {}
  });
  const requestRef = useRef();
  const skidTimerRef = useRef(0); // Timer to limit skid mark creation rate
  const lastFrameTimeRef = useRef(performance.now());

  useEffect(() => {
    if (isMobile) return;
    const layer = document.createElement('div');
    layer.style.position = 'fixed';
    layer.style.inset = '0';
    layer.style.pointerEvents = 'none';
    layer.style.zIndex = '95';
    layer.style.mixBlendMode = 'multiply';
    document.body.appendChild(layer);
    skidLayerRef.current = layer;

    return () => {
      skidMarksRef.current.forEach((mark) => mark.node.remove());
      skidMarksRef.current = [];
      if (skidLayerRef.current?.parentNode) {
        skidLayerRef.current.parentNode.removeChild(skidLayerRef.current);
      }
      skidLayerRef.current = null;
    };
  }, [isMobile]);

  const createSkidMark = useCallback((x, y, rotation, opacity = 0.5) => {
    if (!skidLayerRef.current) return;
    const mark = document.createElement('div');
    mark.style.position = 'absolute';
    mark.style.width = '5px';
    mark.style.height = '14px';
    mark.style.borderRadius = '999px';
    mark.style.background = 'linear-gradient(180deg, rgba(20,20,20,0.6), rgba(20,20,20,0.15))';
    mark.style.boxShadow = '0 6px 16px rgba(20,20,20,0.2)';
    mark.style.opacity = '0';
    mark.style.transform = `translate(${x}px, ${y - window.scrollY}px) rotate(${rotation}deg)`;
    mark.style.transition = 'opacity 0.18s ease-out';
    skidLayerRef.current.appendChild(mark);

    const markObj = { node: mark, x, y, rotation };
    skidMarksRef.current.push(markObj);

    requestAnimationFrame(() => {
      mark.style.opacity = `${opacity}`;
    });

    setTimeout(() => {
      mark.style.transition = 'opacity 1s ease-out';
      mark.style.opacity = '0';
      setTimeout(() => {
        mark.remove();
        skidMarksRef.current = skidMarksRef.current.filter((item) => item !== markObj);
      }, 1000);
    }, 2000);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    // Force scroll to top and disable browser scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    
    // Double check scroll position after a brief delay to handle some browser quirks
    setTimeout(() => window.scrollTo(0, 0), 50);

    // Disable smooth scrolling on html to prevent fighting with game loop
    const html = document.documentElement;
    const originalScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';

    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
        gameState.current.keys[e.key] = true;
        setHasMoved(true);
        
        if (e.key === ' ') {
            setIsHonking(true);
        }
      }
    };
    const handleKeyUp = (e) => {
      gameState.current.keys[e.key] = false;
      if (e.key === ' ') {
        setIsHonking(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);

    const updateGame = (timestamp) => {
      const state = gameState.current;
      const previous = lastFrameTimeRef.current ?? timestamp;
      const deltaMs = Math.max(0, timestamp - previous);
      const frameFactor = Math.min(2.5, deltaMs / (1000 / 60) || 1);
      lastFrameTimeRef.current = timestamp;
      
      // Handling Input
      const adjustedMaxSpeed = MAX_SPEED * platformTuning.max;
      const adjustedAcceleration = ACCELERATION * platformTuning.accel;
      if (state.keys['ArrowUp'] || state.keys['w'] || state.keys['W']) {
        state.velocity = Math.min(state.velocity + adjustedAcceleration * frameFactor, adjustedMaxSpeed);
      } else if (state.keys['ArrowDown'] || state.keys['s'] || state.keys['S']) {
        state.velocity = Math.max(state.velocity - adjustedAcceleration * frameFactor, -adjustedMaxSpeed / 2);
      } else {
        state.velocity *= Math.pow(FRICTION, frameFactor * platformTuning.frictionPower);
      }

      // Drifting Logic
      const isTurning = state.keys['ArrowLeft'] || state.keys['a'] || state.keys['A'] || state.keys['ArrowRight'] || state.keys['d'] || state.keys['D'];
      const isDrifting = Math.abs(state.velocity) > 5 && isTurning;
      
      if (isDrifting) {
        state.driftFactor = Math.min(state.driftFactor + 0.1, 1.5); // Increase drift
      } else {
        state.driftFactor = Math.max(state.driftFactor - 0.1, 0); // Decrease drift
      }

      if (Math.abs(state.velocity) > 0.1) {
        const turnMultiplier = 1 + (state.driftFactor * 0.5); // Turn faster when drifting
        const rotationDelta = TURN_SPEED * frameFactor * Math.sign(state.velocity) * turnMultiplier;
        if (state.keys['ArrowLeft'] || state.keys['a'] || state.keys['A']) {
          state.rotation -= rotationDelta;
        }
        if (state.keys['ArrowRight'] || state.keys['d'] || state.keys['D']) {
          state.rotation += rotationDelta;
        }
      }

      // Skid Marks
      if (state.driftFactor > 0.5 && Math.abs(state.velocity) > 4) {
        skidTimerRef.current++;
        if (skidTimerRef.current % 3 === 0) { // Create mark every 3 frames
        // Calculate rear wheel positions based on rotation using world coordinates
        const rad = state.rotation * Math.PI / 180;
        const rearX = state.x + CAR_WIDTH / 2;
        const rearY = state.y + CAR_HEIGHT;
            
            // Offset for left and right wheels
            const wheelOffset = 15;
            const leftX = rearX - Math.cos(rad) * wheelOffset;
            const leftY = rearY - Math.sin(rad) * wheelOffset;
            const rightX = rearX + Math.cos(rad) * wheelOffset;
            const rightY = rearY + Math.sin(rad) * wheelOffset;

            createSkidMark(leftX, leftY, state.rotation, state.driftFactor * 0.4);
            createSkidMark(rightX, rightY, state.rotation, state.driftFactor * 0.4);
        }
      }

      // Update Position
      // Add some "slide" when drifting by modifying the movement vector slightly
      const moveAngle = state.rotation - (state.driftFactor * 10 * (state.keys['ArrowLeft'] ? -1 : 1));
      
      state.x += Math.sin(moveAngle * Math.PI / 180) * state.velocity * frameFactor;
      state.y -= Math.cos(moveAngle * Math.PI / 180) * state.velocity * frameFactor;

      // Boundary checks (bounce X)
      if (state.x < 0) { state.x = 0; state.velocity *= -0.5; }
      if (state.x > window.innerWidth - CAR_WIDTH) { state.x = window.innerWidth - CAR_WIDTH; state.velocity *= -0.5; }
      
      // Vertical Bounds (Document Height)
      const maxDocHeight = document.documentElement.scrollHeight;
      if (state.y < 0) { state.y = 0; }
      if (state.y > maxDocHeight - CAR_HEIGHT) { state.y = maxDocHeight - CAR_HEIGHT; }

      // Scroll Logic (Camera Follow)
      // Only follow if the car is moving significantly to allow manual scrolling
      if (Math.abs(state.velocity) > 0.5) {
        const screenY = state.y - window.scrollY;
        const dy = -Math.cos(state.rotation * Math.PI / 180) * state.velocity;
        
        // Smaller margins as requested (15% instead of 30%)
        const MARGIN_TOP = window.innerHeight * 0.15; 
        const MARGIN_BOTTOM = window.innerHeight * 0.85; 

        if (screenY < MARGIN_TOP) {
          const dist = MARGIN_TOP - screenY;
          const correction = Math.min(dist * 0.1, 15);
          let scrollAmount = dy - correction;
          
          // Only scroll upward when truly needed
          if (scrollAmount < 0) {
            const nextScroll = Math.max(window.scrollY + scrollAmount, 0);
            window.scrollTo(0, nextScroll);
          }
        } else if (screenY > MARGIN_BOTTOM) {
          const dist = screenY - MARGIN_BOTTOM;
          const correction = Math.min(dist * 0.1, 15);
          let scrollAmount = dy + correction;

          // Only scroll downward when we actually need to push the car back into view
          if (scrollAmount > 0) {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const nextScroll = Math.min(window.scrollY + scrollAmount, maxScroll);
            window.scrollTo(0, nextScroll);
          }
        }
      }

      // Call onUpdate callback
      if (onUpdate) {
        onUpdate({
            x: state.x,
            y: state.y - window.scrollY,
            velocity: state.velocity,
            rotation: state.rotation
        });
      }

      // Direct DOM update for performance (no React render)
      if (carRef.current) {
        // Use screen coordinates for fixed positioning to prevent scroll jitter
        const currentScreenY = state.y - window.scrollY;
        // Add shake effect when honking
        const shakeX = state.keys[' '] ? (Math.random() - 0.5) * 4 : 0;
        const shakeY = state.keys[' '] ? (Math.random() - 0.5) * 4 : 0;
        
        carRef.current.style.transform = `translate(${state.x + shakeX}px, ${currentScreenY + shakeY}px) rotate(${state.rotation}deg) ${state.keys[' '] ? 'scale(1.1)' : 'scale(1)'}`;
      }

      skidMarksRef.current.forEach((mark) => {
        mark.node.style.transform = `translate(${mark.x}px, ${mark.y - window.scrollY}px) rotate(${mark.rotation}deg)`;
      });

      // Optimized Light State Updates
      let newLightState = 'idle';
      if (state.velocity > 0.5) newLightState = 'forward';
      else if (state.velocity < -0.5) newLightState = 'reverse';
      else if (state.velocity < 0) newLightState = 'braking'; // Slow reverse or braking
      
      // Only update React state if light state changes
      setLightState(prev => {
        if (prev !== newLightState) return newLightState;
        return prev;
      });

      requestRef.current = requestAnimationFrame(updateGame);
    };

    lastFrameTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(updateGame);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(requestRef.current);
      html.style.scrollBehavior = originalScrollBehavior;
    };
  }, [onUpdate, isMobile, createSkidMark, platformTuning]);

  if (isMobile) return null;

  return (
    <>
      {/* The Car - Fixed position for smooth movement independent of scroll */}
      <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden h-full w-full">
        <div 
          ref={carRef}
          className="absolute shadow-2xl pointer-events-none"
          style={{
            // Initial render at screen coordinates
            transform: `translate(${initialPosition.x}px, ${window.innerHeight - 150}px) rotate(0deg)`,
            width: CAR_WIDTH,
            height: CAR_HEIGHT,
            willChange: 'transform'
          }}
        >
          {/* Car Body */}
          <div className="relative w-full h-full">
            {/* Wheels */}
            <div className="absolute -left-1 top-2 w-1.5 h-4 bg-black rounded-l-sm"></div>
            <div className="absolute -right-1 top-2 w-1.5 h-4 bg-black rounded-r-sm"></div>
            <div className="absolute -left-1 bottom-2 w-1.5 h-4 bg-black rounded-l-sm"></div>
            <div className="absolute -right-1 bottom-2 w-1.5 h-4 bg-black rounded-r-sm"></div>
            
            {/* Chassis */}
            <div className="absolute inset-0 bg-blue-600 rounded-lg shadow-lg border-2 border-blue-800 overflow-hidden">
              {/* Racing Stripes */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-2 bg-white/90"></div>
              
              {/* Windshield */}
              <div className="absolute top-4 left-1 right-1 h-5 bg-sky-900/80 rounded-sm"></div>
              {/* Rear Window */}
              <div className="absolute bottom-2 left-1 right-1 h-3 bg-sky-900/80 rounded-sm"></div>
              
              {/* Headlights */}
              <div className={`absolute top-0 left-1 w-2 h-3 bg-yellow-200 rounded-b-sm blur-[1px] ${lightState === 'forward' ? 'animate-pulse' : ''}`}></div>
              <div className={`absolute top-0 right-1 w-2 h-3 bg-yellow-200 rounded-b-sm blur-[1px] ${lightState === 'forward' ? 'animate-pulse' : ''}`}></div>
              
              {/* Taillights (Always on dim) */}
              <div className="absolute bottom-0 left-1 w-2 h-1.5 bg-red-600 rounded-t-sm shadow-[0_0_5px_red]"></div>
              <div className="absolute bottom-0 right-1 w-2 h-1.5 bg-red-600 rounded-t-sm shadow-[0_0_5px_red]"></div>

              {/* Brake Lights / Reverse Lights (Brighter) */}
              {(lightState === 'reverse' || lightState === 'braking') && (
                <>
                  <div className="absolute bottom-0 left-1 w-2 h-1.5 bg-red-500 rounded-t-sm shadow-[0_0_15px_red] z-10"></div>
                  <div className="absolute bottom-0 right-1 w-2 h-1.5 bg-red-500 rounded-t-sm shadow-[0_0_15px_red] z-10"></div>
                </>
              )}
            </div>
          </div>
          
          {/* Headlight Beams (only when moving forward) */}
          {lightState === 'forward' && (
            <>
              <div className="absolute top-0 left-1 w-8 h-32 -translate-y-full bg-gradient-to-t from-yellow-200/30 to-transparent blur-md -z-10"></div>
              <div className="absolute top-0 right-1 w-8 h-32 -translate-y-full bg-gradient-to-t from-yellow-200/30 to-transparent blur-md -z-10"></div>
            </>
          )}

          {/* Taillight Beams (only when reversing) */}
          {lightState === 'reverse' && (
            <>
              <div className="absolute bottom-0 left-1 w-6 h-16 translate-y-full bg-gradient-to-b from-red-500/30 to-transparent blur-md -z-10"></div>
              <div className="absolute bottom-0 right-1 w-6 h-16 translate-y-full bg-gradient-to-b from-red-500/30 to-transparent blur-md -z-10"></div>
            </>
          )}

          {/* Honk Visual */}
          {isHonking && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-20">
              <span className="text-xs font-bold text-white bg-red-600 px-2 py-1 rounded-full shadow-lg animate-bounce">
                TOET! 🔊
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Control Hint - Positioned absolutely to stick to the page */}
      {!hasMoved && (
        <div className="absolute inset-0 z-[101] pointer-events-none overflow-hidden h-full w-full">
          <div 
            className="absolute left-0 top-0 pointer-events-none"
            style={{
              transform: `translate(${initialPosition.x + CAR_WIDTH + 12}px, ${initialPosition.y + CAR_HEIGHT / 2 - 30}px)`
            }}
          >
            <div className="transform -translate-y-1/2">
              <div className="animate-bounce-horizontal">
                <div className="bg-white/90 backdrop-blur px-3 py-2 rounded-xl shadow-xl border border-white/50 flex flex-col items-center gap-1 relative">
                  <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Bestuur mij! 🚗</span>
                  
                  {/* Arrow Keys Visual */}
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-6 h-6 bg-slate-100 rounded border border-slate-300 flex items-center justify-center shadow-sm">
                      <ArrowUp className="w-3 h-3 text-slate-600" />
                    </div>
                    <div className="flex gap-0.5">
                      <div className="w-6 h-6 bg-slate-100 rounded border border-slate-300 flex items-center justify-center shadow-sm">
                        <ArrowLeft className="w-3 h-3 text-slate-600" />
                      </div>
                      <div className="w-6 h-6 bg-slate-100 rounded border border-slate-300 flex items-center justify-center shadow-sm">
                        <ArrowDown className="w-3 h-3 text-slate-600" />
                      </div>
                      <div className="w-6 h-6 bg-slate-100 rounded border border-slate-300 flex items-center justify-center shadow-sm">
                        <ArrowRight className="w-3 h-3 text-slate-600" />
                      </div>
                    </div>
                  </div>

                  {/* Speech Bubble Tail - Pointing Left */}
                  <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 w-3 h-3 bg-white/90 backdrop-blur border-l border-b border-white/50"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CarGame;
