import React, { useState, useEffect } from 'react';

const PoopClockTimer = ({ isRunning, elapsedTime }) => {
  const [animationFrame, setAnimationFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => prev + 1);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Calculate progress based on actual elapsed time in 60-second cycles
  // elapsedTime is already in seconds from TimerContext
  const secondsElapsed = elapsedTime ? elapsedTime % 60 : 0;
  const progress = isRunning && elapsedTime ? secondsElapsed / 60 : 0;
  const radius = 120;
  const centerX = 150;
  const centerY = 150;
  const strokeWidth = 8;
  
  // Calculate the circumference and dash offset for the loading ring
  const circumference = 2 * Math.PI * radius;
  // Start from full circumference (empty) and subtract progress to fill the circle
  const strokeDashoffset = circumference * (1 - progress);
  
  // Bouncing poop animation - limited range to stay above toilet bowl
  const bounceHeight = 20;
  const bounceSpeed = 0.2;
  const bounceOffset = -15; // Keep poop above center
  const poopY = centerY + bounceOffset + Math.sin(animationFrame * bounceSpeed) * bounceHeight;
  const poopScale = 1 + Math.sin(animationFrame * bounceSpeed) * 0.1;
  
  // Toilet bowl animation - slight wobble when poop bounces
  const toiletScale = 1 + Math.sin(animationFrame * bounceSpeed) * 0.02;

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className="relative">
        <svg width="300" height="300" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="#374151"
            strokeWidth={strokeWidth}
          />
          
          {/* Progress ring */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="#f97316"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300 ease-out"
          />
        </svg>
        
        {/* Bouncing poop emoji - behind toilet */}
        <div 
          className="absolute text-4xl transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: 'calc(50% - 16px)',
            top: `${(poopY / 300) * 100}%`,
            transform: `translate(-50%, -50%) scale(${poopScale})`,
            zIndex: 1
          }}
        >
          💩
        </div>
        
        {/* Central toilet emoji - in front */}
        <div 
          className="absolute text-8xl transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2
          }}
        >
          🚽
        </div>
        
        {/* 60-second completion celebration */}
        {isRunning && progress > 0.99 && progress < 0.02 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-2xl animate-pulse">
              ✨🎉✨
            </div>
          </div>
        )}
        

      </div>
    </div>
  );
};

export default PoopClockTimer