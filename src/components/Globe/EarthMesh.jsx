import * as THREE from 'three'
import { useTextures } from '../../hooks/useTextures'

/**
 * EarthMesh
 * Photorealistic earth core using MeshStandardMaterial (PBR).
 * Optimized for a clean, NASA-style appearance.
 */
export default function EarthMesh() {
  const { dayMap, specularMap, normalMap } = useTextures()

  return (
    <mesh>
      <sphereGeometry args={[2.5, 64, 64]} />
      <meshStandardMaterial
        map={dayMap}
        normalMap={normalMap} 
        normalScale={new THREE.Vector2(0.05, 0.05)} // bumpScale equivalent
        roughnessMap={specularMap} // oceans are smooth (dark in spec map), land is rough
        roughness={0.4}
        metalnessMap={specularMap} // oceans have higher specular reflectivity
        metalness={0.1}
      />
    </mesh>
  )
}
