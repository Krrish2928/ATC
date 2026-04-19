import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * CameraRig
 * Smoothly interpolates the camera's position based on the zoomed state.
 * Targets a surface-level view when zoomed in.
 */
export default function CameraRig({ isZoomed }) {
  const { camera } = useThree()
  
  // Starting position: overview.
  const startPos = useRef(new THREE.Vector3(0, 0, 8.5))
  // Zoomed position: pushed to the right to line up with offset globe, right above clouds
  const zoomedPos = useRef(new THREE.Vector3(2.0, 0, 2.7)) // Z=2.7 sits safely out of cloud intersection

  useFrame((state, delta) => {
    // Determine the target coordinate based on state
    const target = isZoomed ? zoomedPos.current : startPos.current
    
    // Smooth, cinematic dampening (GSAP-like easing) using smoothstep-like lerping
    camera.position.lerp(target, 4.0 * delta)
    
    // As camera plunges in, we might want to also ensure it mathematically looks exactly at the center
    // However, since we're pointing straight down the Z axis, keeping rotation default is fine
    camera.lookAt(target.x, target.y, 0)
  })

  return null
}
