import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTextures } from '../../hooks/useTextures'
import * as THREE from 'three'

/**
 * CloudLayer
 * A slightly larger independent sphere rendering the cloud textures.
 * Rotates slowly on its own.
 */
export default function CloudLayer() {
  const cloudsRef = useRef()
  const { cloudsMap } = useTextures()

  useFrame(() => {
    if (cloudsRef.current) {
      // Rotate clouds slightly faster/different than earth
      cloudsRef.current.rotation.y += 0.001
      cloudsRef.current.rotation.z += 0.0001
    }
  })

  // Fallback if texture fails
  if (!cloudsMap) return null

  return (
    <mesh ref={cloudsRef}>
      {/* Slightly larger than Earth radius (2.5) */}
      <sphereGeometry args={[2.52, 64, 64]} />
      <meshStandardMaterial
        map={cloudsMap}
        transparent={true}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}
