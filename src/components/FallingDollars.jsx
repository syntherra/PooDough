import React, { useState, useEffect } from 'react'

const FallingDollars = ({ isActive }) => {
  const [dollars, setDollars] = useState([])

  useEffect(() => {
    if (!isActive) {
      setDollars([])
      return
    }

    const createDollar = () => {
      const id = Math.random().toString(36).substr(2, 9)
      const startX = -50 + Math.random() * (window.innerWidth + 100) // Ensure full width coverage
      const delay = Math.random() * 2000 // Random delay up to 2 seconds
      const duration = 8000 + Math.random() * 4000 // 8-12 seconds fall time
      const swayAmplitude = 30 + Math.random() * 40 // 30-70px sway
      const rotationSpeed = 0.5 + Math.random() * 1.5 // Rotation speed
      
      return {
        id,
        startX,
        delay,
        duration,
        swayAmplitude,
        rotationSpeed,
        createdAt: Date.now()
      }
    }

    // Create initial batch of dollars
    const initialDollars = Array.from({ length: 25 }, createDollar)
    setDollars(initialDollars)

    // Add new dollars periodically
    const interval = setInterval(() => {
      if (isActive) {
        setDollars(prev => {
          // Remove old dollars that have finished falling
          const now = Date.now()
          const activeDollars = prev.filter(dollar => 
            now - dollar.createdAt < dollar.duration + dollar.delay + 1000
          )
          
          // Add new dollar
          const newDollar = createDollar()
          return [...activeDollars, newDollar]
        })
      }
    }, 500) // New dollar every 500ms

    return () => clearInterval(interval)
  }, [isActive])

  if (!isActive) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {dollars.map((dollar) => (
        <div
          key={dollar.id}
          className="absolute text-green-500 text-2xl font-bold select-none"
          style={{
            left: `${dollar.startX}px`,
            top: '-50px',
            animation: `fall-${dollar.id} ${dollar.duration}ms linear ${dollar.delay}ms forwards`,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            opacity: 0.7
          }}
        >
          💵
        </div>
      ))}
      
      {/* Dynamic CSS animations for each dollar */}
      <style jsx>{`
        ${dollars.map(dollar => `
          @keyframes fall-${dollar.id} {
            0% {
              transform: translateY(-50px) translateX(0px) rotate(0deg);
              opacity: 0;
            }
            5% {
              opacity: 1;
            }
            25% {
              transform: translateY(${window.innerHeight * 0.25}px) translateX(${dollar.swayAmplitude * Math.sin(0.5)}px) rotate(${90 * dollar.rotationSpeed}deg);
            }
            50% {
              transform: translateY(${window.innerHeight * 0.5}px) translateX(${dollar.swayAmplitude * Math.sin(1)}px) rotate(${180 * dollar.rotationSpeed}deg);
            }
            75% {
              transform: translateY(${window.innerHeight * 0.75}px) translateX(${dollar.swayAmplitude * Math.sin(1.5)}px) rotate(${270 * dollar.rotationSpeed}deg);
            }
            95% {
              transform: translateY(${window.innerHeight + 50}px) translateX(${dollar.swayAmplitude * Math.sin(2)}px) rotate(${360 * dollar.rotationSpeed}deg);
              opacity: 1;
            }
            100% {
              transform: translateY(${window.innerHeight + 100}px) translateX(${dollar.swayAmplitude * Math.sin(2.1)}px) rotate(${360 * dollar.rotationSpeed}deg);
              opacity: 0;
            }
          }
        `).join('')}
      `}</style>
    </div>
  )
}

export default FallingDollars