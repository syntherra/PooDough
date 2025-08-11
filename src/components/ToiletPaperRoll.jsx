import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion'

// 3D Toilet Paper Roll Component
function ToiletPaperRollMesh({ progress = 0, isAnimating = false }) {
  const rollRef = useRef()
  const paperRef = useRef()
  
  // Create the toilet paper roll geometry
  const rollGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(1.2, 1.2, 2, 32)
  }, [])
  
  // Create the unrolling paper geometry
  const paperGeometry = useMemo(() => {
    const length = progress * 5 // Paper length based on progress
    return new THREE.PlaneGeometry(0.1, length)
  }, [progress])
  
  // Animation loop
  useFrame((state) => {
    if (rollRef.current && isAnimating) {
      rollRef.current.rotation.z += 0.02
    }
    
    if (paperRef.current) {
      paperRef.current.position.y = -1 - (progress * 2.5)
      paperRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })
  
  return (
    <group>
      {/* Main toilet paper roll */}
      <mesh ref={rollRef} position={[0, 0, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 2, 32]} />
        <meshStandardMaterial 
          color="#f8f8f8" 
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Inner cardboard tube */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 2.1, 16]} />
        <meshStandardMaterial 
          color="#8b4513" 
          roughness={0.8}
          metalness={0.0}
        />
      </mesh>
      
      {/* Unrolling paper */}
      {progress > 0 && (
        <mesh ref={paperRef} position={[1.3, -1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[0.1, progress * 5]} />
          <meshStandardMaterial 
            color="#ffffff" 
            side={THREE.DoubleSide}
            transparent
            opacity={0.9}
          />
        </mesh>
      )}
      
      {/* Perforated lines on the paper */}
      {progress > 0.1 && (
        <group>
          {Array.from({ length: Math.floor(progress * 10) }, (_, i) => (
            <mesh key={i} position={[1.35, -1 - (i * 0.5), 0]}>
              <boxGeometry args={[0.05, 0.02, 0.001]} />
              <meshStandardMaterial color="#cccccc" />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}

// Main component
function ToiletPaperRoll({ progress = 0, isRunning = false, className = '' }) {
  return (
    <motion.div 
      className={`w-full h-64 ${className}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Canvas
        camera={{ position: [4, 2, 4], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={0.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-5, 5, 5]} intensity={0.3} color="#ffa500" />
        
        {/* 3D Toilet Paper Roll */}
        <ToiletPaperRollMesh progress={progress} isAnimating={isRunning} />
        
        {/* Progress text */}
        <Text
          position={[0, -3, 0]}
          fontSize={0.5}
          color="#f59532"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Poppins-Bold.woff"
        >
          {Math.round(progress * 100)}%
        </Text>
        
        {/* Controls for desktop */}
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}
          autoRotate={isRunning}
          autoRotateSpeed={2}
        />
      </Canvas>
      
      {/* Floating particles effect */}
      {isRunning && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 6 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary-400 rounded-full opacity-60"
              initial={{ 
                x: Math.random() * 100 + '%',
                y: '100%',
                scale: 0
              }}
              animate={{
                y: '-20%',
                scale: [0, 1, 0],
                x: Math.random() * 100 + '%'
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeOut'
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default ToiletPaperRoll