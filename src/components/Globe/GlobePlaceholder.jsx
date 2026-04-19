import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * GlobePlaceholder
 * Low-cost placeholder rendered while high-res textures are loading.
 * Features a dark base with a subtle pulsing digital glow.
 */
export default function GlobePlaceholder() {
  const meshRef = useRef()
  const glowRef = useRef()

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    if (meshRef.current) {
      // Subtle pulse to indicate loading is active
      const pulse = 0.98 + Math.sin(time * 2) * 0.02
      meshRef.current.scale.set(pulse, pulse, pulse)
    }
    if (glowRef.current) {
      glowRef.current.opacity = 0.3 + Math.sin(time * 3) * 0.1
    }
  })

  return (
    <group>
      {/* Dark Base Sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial color="#050a15" />
      </mesh>

      {/* Outer Glow Halo */}
      <mesh scale={[1.05, 1.05, 1.05]}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial 
          ref={glowRef}
          color="#3b82f6" 
          transparent 
          opacity={0.3} 
          side={THREE.BackSide} 
        />
      </mesh>

      {/* Digital Wireframe Overlay (Mental model of "Initializing") */}
      <mesh>
        <sphereGeometry args={[2.51, 32, 32]} />
        <meshBasicMaterial 
          color="#3b82f6" 
          wireframe 
          transparent 
          opacity={0.05} 
        />
      </mesh>
    </group>
  )
}
