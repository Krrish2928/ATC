import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import ContrailTrail from './ContrailTrail'

/**
 * generateArc
 * Creates a QuadraticBezierCurve3 connecting two random points on the sphere.
 * The control point is pushed outwards to form a looping parabolic arc.
 */
function generateArc(radius) {
  // Select two random points on the sphere
  const start = new THREE.Vector3().setFromSphericalCoords(
    radius,
    Math.acos(2 * Math.random() - 1),
    Math.random() * Math.PI * 2
  )
  const end = new THREE.Vector3().setFromSphericalCoords(
    radius,
    Math.acos(2 * Math.random() - 1),
    Math.random() * Math.PI * 2
  )

  // Determine arc height based on distance so long flights arc higher
  const distance = start.distanceTo(end)
  const midHeight = radius + (distance * 0.2) // ~10-20% elevation based on coverage

  // Pushing the midpoint outwards from the center of the sphere
  const mid = new THREE.Vector3().copy(start).lerp(end, 0.5).normalize().multiplyScalar(midHeight)

  return new THREE.QuadraticBezierCurve3(start, mid, end)
}

/**
 * Airplane
 * Interpolates across a curved arc on the globe surface.
 */
export default function Airplane({ startDelay }) {
  const groupRef = useRef()
  const progressRef = useRef(-startDelay) // Handle stagger logic
  
  // Keep track of the current flight path mathematically
  const [curve, setCurve] = useState(() => generateArc(2.51)) // slightly above Earth radius 2.5
  
  // Random visuals per plane
  const [speed, setSpeed] = useState(() => 0.1 + Math.random() * 0.1) // 0.1 to 0.2 units/sec (slowed down later by delta)
  const trailColor = useMemo(() => (Math.random() > 0.8 ? '#ff9a40' : '#dcedff'), [])

  // Load the model
  let model
  let hasModel = true
  try {
    const { scene } = useGLTF('/models/airplane.glb')
    model = scene.clone()
  } catch {
    hasModel = false
  }

  useFrame((_, delta) => {
    progressRef.current += delta * speed * 0.2 // Slowed down mapping to 0->1 range realistically
    
    if (progressRef.current >= 1.0) {
      // Loop to new path
      progressRef.current = 0
      setCurve(generateArc(2.51))
      setSpeed(0.1 + Math.random() * 0.1)
    }

    if (groupRef.current && progressRef.current >= 0) {
      const t = progressRef.current
      const pos = curve.getPointAt(t)
      const tangent = curve.getTangentAt(t)
      
      groupRef.current.position.copy(pos)

      // Point the plane forward along the tangent smoothly
      const quaternion = new THREE.Quaternion()
      quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), tangent.normalize())
      
      // Roll plane gently based on curve
      groupRef.current.quaternion.copy(quaternion)
    }
  })

  // Visualize the arc track faintly
  const linePoints = useMemo(() => curve.getPoints(40), [curve])
  const lineGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(linePoints), [linePoints])

  const isVisible = progressRef.current >= 0

  return (
    <group>
      {/* Ghostly arc path always faintly visible */}
      <line geometry={lineGeometry}>
        <lineBasicMaterial color={trailColor} transparent opacity={0.1} depthWrite={false} />
      </line>

      {/* Plane mesh and dynamic trail */}
      {isVisible && (
        <group>
          <group ref={groupRef} scale={[0.012, 0.012, 0.012]}>
            {hasModel && model ? (
              <primitive object={model} />
            ) : (
              // Sleek fallback geometry
              <mesh rotation={[Math.PI / 4, 0, -Math.PI / 2]}>
                <coneGeometry args={[4, 15, 4]} />
                <meshStandardMaterial color="#ffffff" metalness={0.6} />
              </mesh>
            )}

            {/* Micro engine glow for airplanes to pop against the dark globe */}
            <group position={[-2.5, 0, 0]}>
               <pointLight color={trailColor} intensity={0.5} distance={2.0} />
            </group>
            
            <ContrailTrail target={groupRef} color={trailColor} />
          </group>
        </group>
      )}
    </group>
  )
}
