import * as THREE from 'three'

/**
 * NeonRingFrame
 * A subtle, super thin glowing cyan ring sitting stationary around the globe.
 */
export default function NeonRingFrame() {
  return (
    <mesh position={[0, 0, 0]}>
      {/* Thinner torus -> radius 3.2, tube 0.003 */}
      <torusGeometry args={[3.2, 0.003, 16, 100]} />
      <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
    </mesh>
  )
}
