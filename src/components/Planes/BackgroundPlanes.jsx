import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Trail } from '@react-three/drei'
import * as THREE from 'three'

/*
 * PlaneMesh - Small 12-16px elegant airplane silhouette
 */
function PlaneMesh({ color = "#ffffff" }) {
  return (
    <group scale={0.5}>
       <mesh rotation={[Math.PI / 4, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.06, 0.4, 4]} />
          <meshBasicMaterial color={color} />
       </mesh>
       <mesh position={[-0.1, 0, 0]}>
          <boxGeometry args={[0.12, 0.01, 0.35]} />
          <meshBasicMaterial color={color} />
       </mesh>
    </group>
  )
}

/*
 * AnimatedBackgroundPlane - Sweeping gracefully across the backdrop
 */
function AnimatedBackgroundPlane({ id, startDelay, isOrange }) {
  const groupRef = useRef()
  const progressRef = useRef(-startDelay) 
  const routeRef = useRef(null)
  
  const trailColor = isOrange ? '#ff9a40' : '#e0f0ff'
  const planeColor = isOrange ? '#ffebd6' : '#ffffff'

  const generateCurve = () => {
    const signX = Math.random() > 0.5 ? 1 : -1
    const startX = signX * (15 + Math.random() * 5)
    const startY = (Math.random() - 0.5) * 15
    const endX = -signX * (15 + Math.random() * 5)
    const endY = (Math.random() - 0.5) * 15
    
    // Smooth, deep background SWEEP
    return new THREE.CubicBezierCurve3(
      new THREE.Vector3(startX, startY, -10 - Math.random() * 5), 
      new THREE.Vector3(startX * 0.4, startY + (Math.random() - 0.5) * 8, -10),
      new THREE.Vector3(endX * 0.4, endY + (Math.random() - 0.5) * 8, -10),
      new THREE.Vector3(endX, endY, -10 - Math.random() * 5)
    )
  }

  if (!routeRef.current) routeRef.current = generateCurve()

  const speed = useRef(0.02 + Math.random() * 0.02)

  useFrame((_, delta) => {
    progressRef.current += delta * speed.current
    
    if (progressRef.current >= 1.0) {
      progressRef.current = 0
      routeRef.current = generateCurve()
      speed.current = 0.02 + Math.random() * 0.02 
    }

    if (groupRef.current && progressRef.current >= 0) {
      const t = progressRef.current
      const pos = routeRef.current.getPoint(t)
      const tangent = routeRef.current.getTangent(t)
      
      groupRef.current.position.copy(pos)
      
      const quaternion = new THREE.Quaternion()
      quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), tangent.normalize())
      groupRef.current.quaternion.copy(quaternion)
    }
  })

  const isVisible = progressRef.current >= 0

  return (
    <group>
      {isVisible && (
        <Trail 
          width={0.4} 
          length={120} // Long graceful trail
          color={new THREE.Color(trailColor)} 
          attenuation={(t) => t * t} // Fades clearly out
          target={groupRef}
        >
          <group ref={groupRef}>
            <PlaneMesh color={planeColor} />
          </group>
        </Trail>
      )}
    </group>
  )
}

/*
 * BackgroundPlanes
 * 4–6 minimal planes floating gently through the starfield background.
 */
export default function BackgroundPlanes() {
  const planes = useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      startDelay: i * 2.5 + Math.random(), 
      isOrange: i === 0 
    }))
  }, [])

  return (
    <group>
      {planes.map(p => (
        <AnimatedBackgroundPlane key={p.id} id={p.id} startDelay={p.startDelay} isOrange={p.isOrange} />
      ))}
    </group>
  )
}
