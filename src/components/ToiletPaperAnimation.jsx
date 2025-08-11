import React from 'react';
import { motion } from 'framer-motion';

const ToiletPaperAnimation = ({ isRunning, elapsedTime }) => {
  // Calculate rotation based on elapsed time - ULTRA SMOOTH 60FPS
  const rotation = isRunning ? (elapsedTime * 0.036) % 360 : 0; // 1 rotation per 10 seconds (360/10000ms = 0.036)
  
  // Calculate paper length with realistic physics - smooth dispensing
  const paperLength = Math.min(elapsedTime * 0.02, 400); // 20cm per second
  const paperSway = isRunning ? Math.sin(elapsedTime * 0.001) * 3 : 0; // Slower sway
  const paperFloat = isRunning ? Math.sin(elapsedTime * 0.0015) * 2 : 0; // Slower float
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] relative perspective-1000">
      {/* ENHANCED status text with premium styling - MOVED TO TOP */}
      <motion.div
        className="text-center absolute -top-16 left-1/2 transform -translate-x-1/2 z-10 w-full"
        animate={{
          y: isRunning ? [0, -2, 0] : 0,
        }}
        transition={{
          duration: 4,
          repeat: isRunning ? Infinity : 0,
          ease: [0.25, 0.46, 0.45, 0.94],
          type: "tween"
        }}
      >
        <motion.p 
          className="text-2xl font-bold text-gray-800 mb-2"
          animate={{
            scale: isRunning ? [1, 1.01, 1] : 1,
          }}
          transition={{
            duration: 3,
            repeat: isRunning ? Infinity : 0,
            ease: "easeInOut",
            type: "tween"
          }}
        >
          {isRunning ? "🚽 Session in Progress" : "🧻 Ready to Roll?"}
        </motion.p>
        
        {isRunning && (
          <motion.div
            className="space-y-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "tween" }}
          >
            <motion.p 
              className="text-base text-gray-700 font-medium"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", type: "tween" }}
            >
              Paper unrolling... {Math.floor(paperLength / 8)}cm dispensed
            </motion.p>
            
            <motion.div
              className="flex items-center justify-center space-x-2 text-sm text-gray-600"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", type: "tween" }}
            >
              <span>💨</span>
              <span>Ultra-smooth 60fps animation</span>
              <span>💨</span>
            </motion.div>
          </motion.div>
        )}
        
        {!isRunning && (
          <motion.p 
            className="text-base text-gray-600 mt-2"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", type: "tween" }}
          >
            Experience the most realistic toilet paper animation ever created!
          </motion.p>
        )}
      </motion.div>
      {/* Enhanced realistic lighting effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-48 h-48 bg-gradient-radial from-yellow-50/40 via-yellow-100/20 to-transparent rounded-full blur-2xl" />
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-radial from-white/30 to-transparent rounded-full blur-xl" />
      </div>
      
      {/* Enhanced floating dust particles */}
      {isRunning && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-gray-200 rounded-full opacity-40"
              style={{
                width: `${0.5 + Math.random() * 1}px`,
                height: `${0.5 + Math.random() * 1}px`,
                left: `${10 + i * 4}%`,
                top: `${20 + (i % 4) * 15}%`,
              }}
              animate={{
                y: [-20, 25, -20],
                x: [-8, 8, -8],
                opacity: [0.1, 0.6, 0.1],
                scale: [0.2, 1.2, 0.2],
              }}
              transition={{
                duration: 4 + i * 0.15,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.08,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Main toilet paper roll - FRONT FACING VIEW */}
      <div className="relative transform-gpu">
        {/* Enhanced multiple shadow layers */}
        <div className="absolute top-4 left-4 w-40 h-40 bg-gray-600 rounded-full opacity-15 blur-xl" />
        <div className="absolute top-3 left-3 w-40 h-40 bg-gray-500 rounded-full opacity-20 blur-lg" />
        <div className="absolute top-2 left-2 w-40 h-40 bg-gray-400 rounded-full opacity-25 blur-md" />
        
        {/* FRONT-FACING Toilet paper roll - Much Larger */}
        <motion.div
          className="w-40 h-40 rounded-full relative overflow-hidden"
          style={{
            background: `
              radial-gradient(circle at center, 
                rgba(255,255,255,1) 0%,
                rgba(248,249,250,0.95) 15%,
                rgba(241,243,244,0.9) 30%,
                rgba(233,236,239,0.85) 45%,
                rgba(222,226,230,0.8) 60%,
                rgba(206,212,218,0.75) 75%,
                rgba(173,181,189,0.7) 90%,
                rgba(134,142,150,0.65) 100%
              ),
              conic-gradient(from 0deg at center,
                rgba(255,255,255,0.8) 0deg, rgba(240,240,240,0.6) 45deg,
                rgba(220,220,220,0.4) 90deg, rgba(240,240,240,0.6) 135deg,
                rgba(255,255,255,0.8) 180deg, rgba(240,240,240,0.6) 225deg,
                rgba(220,220,220,0.4) 270deg, rgba(240,240,240,0.6) 315deg,
                rgba(255,255,255,0.8) 360deg
              )
            `,
            boxShadow: `
              inset 0 0 30px rgba(0,0,0,0.15),
              inset 0 0 60px rgba(255,255,255,0.8),
              0 8px 20px rgba(0,0,0,0.12),
              0 4px 12px rgba(0,0,0,0.08)
            `,
            transform: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)',
          }}
          animate={{ 
            rotateZ: rotation,
            scale: isRunning ? [1, 1.015, 1] : 1,
          }}
          transition={{ 
            rotateZ: { 
              duration: 0.016, // 60fps smooth rotation
              ease: "linear",
              type: "tween"
            },
            scale: { 
              duration: 2, 
              repeat: isRunning ? Infinity : 0, 
              ease: "easeInOut",
              type: "tween"
            }
          }}
        >
          {/* Ultra-detailed concentric paper layers - PERFECT FRONT-FACING CIRCLES */}
          {[...Array(24)].map((_, i) => (
            <div
              key={`layer-${i}`}
              className="absolute rounded-full border opacity-20"
              style={{
                width: `${92 - i * 3.5}%`,
                height: `${92 - i * 3.5}%`,
                top: `${4 + i * 1.75}%`,
                left: `${4 + i * 1.75}%`,
                borderColor: i % 2 === 0 ? 'rgba(200,200,200,0.3)' : 'rgba(220,220,220,0.2)',
                borderWidth: '0.5px',
                background: `radial-gradient(circle at center, rgba(255,255,255,${0.1 - i * 0.003}) 0%, transparent 70%)`,
              }}
            />
          ))}
          
          {/* Realistic paper texture lines - PERFECT FRONT-FACING RADIAL PATTERN */}
          {[...Array(36)].map((_, i) => (
            <div
              key={`texture-${i}`}
              className="absolute opacity-15"
              style={{
                width: '1px',
                height: '45%',
                left: '50%',
                top: '5%',
                background: 'linear-gradient(to bottom, rgba(200,200,200,0.4) 0%, rgba(180,180,180,0.3) 50%, transparent 100%)',
                transform: `translateX(-0.5px) rotateZ(${i * 10}deg)`,
                transformOrigin: '0.5px 90px',
              }}
            />
          ))}
          
          {/* Enhanced perforated edge pattern */}
          {[...Array(36)].map((_, i) => (
            <div
              key={`perf-${i}`}
              className="absolute w-1 h-1 bg-gray-500 rounded-full opacity-50"
              style={{
                left: '50%',
                top: '50%',
                transform: `rotate(${i * 10}deg) translateY(-75px) translateX(-2px)`,
                transformOrigin: '2px 75px',
              }}
            />
          ))}
          
          {/* Paper edge highlight ring */}
          <div 
            className="absolute inset-2 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, rgba(255,255,255,0.8) 0deg, rgba(240,240,240,0.4) 90deg, rgba(255,255,255,0.8) 180deg, rgba(240,240,240,0.4) 270deg, rgba(255,255,255,0.8) 360deg)',
              boxShadow: 'inset 0 0 8px rgba(255,255,255,0.6)'
            }}
          />
          
          {/* Center cardboard tube - PERFECT FRONT-FACING CIRCLE */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full" 
            style={{
              background: `
                radial-gradient(circle at center, 
                  #a0845c 0%,
                  #8b7355 30%,
                  #6b5b47 60%,
                  #4a3f35 80%,
                  #2d2520 100%
                ),
                conic-gradient(from 0deg at center,
                  #8b7355 0deg, #a0845c 90deg, #6b5b47 180deg, #4a3f35 270deg, #8b7355 360deg
                )
              `,
              boxShadow: `
                inset 0 0 25px rgba(0,0,0,0.7),
                inset 0 0 15px rgba(160,132,92,0.2),
                0 2px 8px rgba(0,0,0,0.4)
              `,
              transform: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)'
            }}
          >
            {/* Tube inner ring details - FRONT-FACING */}
            <div className="absolute inset-2 rounded-full border border-amber-900/40" 
                 style={{
                   background: 'radial-gradient(circle at center, rgba(160,132,92,0.1) 0%, transparent 70%)'
                 }} />
            <div className="absolute inset-4 rounded-full border border-amber-800/30" />
            <div className="absolute inset-4 rounded-full border border-amber-800/20" />
            {/* Tube corrugation lines */}
            {[...Array(8)].map((_, i) => (
              <div
                key={`tube-line-${i}`}
                className="absolute w-full h-0.5 bg-amber-900/20"
                style={{
                  top: `${12.5 + i * 12.5}%`,
                  borderRadius: '50%',
                }}
              />
            ))}
          </div>
        </motion.div>
        
        {/* ULTRA-REALISTIC unrolling paper - FRONT VIEW */}
         {paperLength > 0 && (
           <motion.div
             className="absolute top-40 left-16 origin-top transform-gpu"
             style={{
               width: '8px',
               height: `${paperLength}px`,
               background: `
                 linear-gradient(90deg, 
                   rgba(255,255,255,0.95) 0%, 
                   rgba(248,249,250,1) 10%, 
                   rgba(255,255,255,1) 25%, 
                   rgba(250,251,252,1) 40%, 
                   rgba(255,255,255,1) 50%, 
                   rgba(250,251,252,1) 60%, 
                   rgba(255,255,255,1) 75%, 
                   rgba(248,249,250,1) 90%, 
                   rgba(255,255,255,0.95) 100%
                 )
               `,
               boxShadow: `
                 4px 0 8px rgba(0,0,0,0.12),
                 -2px 0 4px rgba(0,0,0,0.06),
                 inset 2px 0 2px rgba(255,255,255,0.9),
                 inset -2px 0 2px rgba(0,0,0,0.04),
                 0 0 0 0.5px rgba(240,240,240,0.8)
               `,
               transform: `translateX(${paperSway}px) translateY(${paperFloat}px) rotateY(1deg)`,
               borderRadius: '2px',
             }}
             initial={{ scaleY: 0, opacity: 0 }}
             animate={{ 
               scaleY: 1, 
               opacity: 1,
               x: paperSway,
               y: paperFloat,
             }}
             transition={{ 
               scaleY: { 
                 duration: 0.6, 
                 ease: [0.25, 0.46, 0.45, 0.94], // Custom bezier for smooth unroll
                 type: "tween"
               },
               opacity: { duration: 0.3, type: "tween" },
               x: { 
                 duration: 3, 
                 repeat: Infinity, 
                 repeatType: "reverse", 
                 ease: "easeInOut",
                 type: "tween"
               },
               y: { 
                 duration: 2.5, 
                 repeat: Infinity, 
                 repeatType: "reverse", 
                 ease: "easeInOut",
                 type: "tween"
               }
             }}
           >
             {/* Enhanced perforation pattern - MORE REALISTIC */}
             {[...Array(Math.floor(paperLength / 10))].map((_, i) => (
               <div
                 key={`perf-row-${i}`}
                 className="absolute left-0 w-full flex justify-between px-1"
                 style={{ top: `${i * 10}px` }}
               >
                 <div className="w-0.5 h-0.5 bg-gray-500 rounded-full opacity-60" />
                 <div className="w-0.5 h-0.5 bg-gray-500 rounded-full opacity-60" />
               </div>
             ))}
             
             {/* Micro perforation holes between main ones */}
             {[...Array(Math.floor(paperLength / 5))].map((_, i) => (
               <div
                 key={`micro-perf-${i}`}
                 className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 bg-gray-400 rounded-full opacity-40"
                 style={{ top: `${i * 5 + 2.5}px` }}
               />
             ))}
             
             {/* Enhanced paper fiber texture */}
             {[...Array(Math.floor(paperLength / 4))].map((_, i) => (
               <div
                 key={`fiber-${i}`}
                 className="absolute left-0 w-full opacity-15"
                 style={{ 
                   top: `${i * 4}px`,
                   height: '0.5px',
                   background: 'linear-gradient(90deg, transparent 0%, #d0d0d0 20%, #e8e8e8 50%, #d0d0d0 80%, transparent 100%)',
                 }}
               />
             ))}
             
             {/* Paper quilting pattern */}
             {[...Array(Math.floor(paperLength / 8))].map((_, i) => (
               <div
                 key={`quilt-${i}`}
                 className="absolute left-0 w-full opacity-10"
                 style={{ 
                   top: `${i * 8 + 4}px`,
                   height: '1px',
                   background: 'linear-gradient(90deg, rgba(200,200,200,0.3) 0%, rgba(220,220,220,0.6) 50%, rgba(200,200,200,0.3) 100%)',
                 }}
               />
             ))}
             
             {/* ULTRA-REALISTIC paper end with enhanced 3D curl */}
             <motion.div
               className="absolute -bottom-4 left-0 w-8 h-8 bg-white"
               style={{
                 background: `
                   linear-gradient(135deg, 
                     rgba(255,255,255,1) 0%, 
                     rgba(248,249,250,0.98) 25%, 
                     rgba(240,242,245,0.95) 50%, 
                     rgba(233,236,239,0.9) 75%, 
                     rgba(222,226,230,0.85) 100%
                   )
                 `,
                 boxShadow: `
                   0 4px 8px rgba(0,0,0,0.18),
                   0 2px 4px rgba(0,0,0,0.12),
                   inset 0 2px 4px rgba(255,255,255,0.9),
                   inset 0 -1px 2px rgba(0,0,0,0.05)
                 `,
                 transform: 'perspective(40px) rotateX(30deg) rotateY(-8deg) rotateZ(2deg)',
                 borderRadius: '3px 3px 6px 6px',
                 transformOrigin: 'top center',
               }}
               animate={{
                 rotateZ: isRunning ? [2, 12, -8, 2] : 2,
                 rotateX: isRunning ? [30, 35, 25, 30] : 30,
                 rotateY: isRunning ? [-8, -12, -4, -8] : -8,
               }}
               transition={{
                 duration: 4,
                 repeat: isRunning ? Infinity : 0,
                 ease: [0.25, 0.46, 0.45, 0.94],
                 type: "tween"
               }}
             >
               {/* Paper edge highlight - enhanced */}
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/60 via-white/90 to-white/60 rounded-full" />
               {/* Paper curl shadow */}
               <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-gray-300/20 via-gray-400/30 to-gray-300/20 rounded-full" />
             </motion.div>
           </motion.div>
         )}
        
        {/* Enhanced realistic floor reflection - LARGER */}
         <div 
           className="absolute top-44 left-4 w-32 h-8 opacity-12 blur-md"
           style={{
             background: 'radial-gradient(ellipse, #555555 0%, #777777 30%, transparent 70%)',
             transform: 'perspective(80px) rotateX(65deg) scaleY(0.25)',
           }}
         />
         
         {/* Secondary reflection for paper */}
         {paperLength > 0 && (
           <div 
             className="absolute left-16 opacity-8 blur-sm"
             style={{
               top: `${44 + paperLength * 0.1}px`,
               width: '6px',
               height: `${Math.min(paperLength * 0.3, 60)}px`,
               background: 'linear-gradient(to bottom, rgba(200,200,200,0.3) 0%, transparent 100%)',
               transform: 'perspective(60px) rotateX(70deg) scaleY(0.2)',
             }}
           />
         )}
       </div>
       

    </div>
  );
};

export default ToiletPaperAnimation;