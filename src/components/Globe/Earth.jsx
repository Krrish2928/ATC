import { useRef, useState, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGlobeControls } from '../../hooks/useGlobeControls'
import EarthMesh from './EarthMesh'
import CloudLayer from './CloudLayer'
import GlobePlaceholder from './GlobePlaceholder'

/**
 * Earth
 * Group component that combines the core Earth mesh, clouds, atmosphere,
 * and the airplane fleet. Handles interactions and idle auto-drift.
 */
export default function Earth({ onClick }) {
  const groupRef = useRef()
  const { applyInertia, isDragging } = useGlobeControls(groupRef)
  const [hovered, setHovered] = useState(false)

  // Apply inertia decay + idle rotation every frame
  useFrame((_, delta) => {
    applyInertia()
    
    // Slow gentle elegant drift when user isn't dragging
    if (!isDragging.current && groupRef.current) {
      const baseDrift = 0.05
      const hoverSpeedMultiplier = hovered ? 2.5 : 1.0 // speed up slightly on hover
      groupRef.current.rotation.y += baseDrift * delta * hoverSpeedMultiplier
    }
  })

  // Set the cursor grab to signal interactivity
  const handlePointerOver = (e) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = 'grab'
  }
  const handlePointerOut = (e) => {
    setHovered(false)
    if (!isDragging.current) document.body.style.cursor = 'auto'
  }

  return (
    <group 
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={(e) => { e.stopPropagation(); onClick && onClick() }}
    >
      <Suspense fallback={<GlobePlaceholder />}>
        <EarthMesh isHovered={hovered} />
        <CloudLayer />
      </Suspense>
    </group>
  )
}
