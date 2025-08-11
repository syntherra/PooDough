import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function RealisticToiletPaper({ isRunning, elapsedTime }) {
  const rollRef = useRef()
  const sheetRef = useRef()
  const tubeRef = useRef()
  
  // State for animation values (similar to vanilla Three.js approach)
  const sheetLength = useRef(0.01)
  const rollHeight = useRef(2)
  
  // Calculate animation speed based on running state
  const animationSpeed = isRunning ? 0.01 : 0
  
  // Animate the toilet paper (vanilla Three.js approach)
   useFrame((state) => {
     // Simulate unrolling animation when running
     if (isRunning && sheetLength.current < 3) {
       // Increase sheet length over time
       sheetLength.current += animationSpeed
       
       // Reduce roll height slightly to simulate unrolling
       rollHeight.current = Math.max(0.5, rollHeight.current - 0.002)
       
       // Update sheet geometry
       if (sheetRef.current) {
         sheetRef.current.geometry.dispose()
         sheetRef.current.geometry = new THREE.PlaneGeometry(1, sheetLength.current)
         sheetRef.current.position.y = -sheetLength.current / 2 - 1
       }
       
       // Update roll geometry
       if (rollRef.current) {
         rollRef.current.geometry.dispose()
         rollRef.current.geometry = new THREE.CylinderGeometry(
           0.5,
           0.5,
           rollHeight.current,
           32
         )
       }
     }
     
     // Add gentle swaying motion to the sheet
     if (sheetRef.current && isRunning) {
       sheetRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.05
     }
   })
  
  // Simple materials (vanilla Three.js approach)
  const rollMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({ color: 0xffffff })
  }, [])
  
  const sheetMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({ 
      color: 0xffffff, 
      side: THREE.DoubleSide 
    })
  }, [])
  
  return (
    <group>
      {/* Toilet Paper Roll */}
      <mesh ref={rollRef} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
        <primitive object={rollMaterial} />
      </mesh>
      
      {/* Hanging Paper Sheet */}
      <mesh ref={sheetRef} position={[0, -1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1, 0.01]} />
        <primitive object={sheetMaterial} />
      </mesh>

    </group>
  )
}



const ThreeToiletPaperAnimation = ({ isRunning, elapsedTime }) => {
  return (
    <div className="w-full h-96 relative">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        {/* Simple lighting */}
        <pointLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
        <ambientLight intensity={0.5} color="#888888" />
        
        {/* Realistic Toilet Paper Animation */}
        <RealisticToiletPaper isRunning={isRunning} elapsedTime={elapsedTime} />
      </Canvas>
    </div>
  )
}

export default ThreeToiletPaperAnimation