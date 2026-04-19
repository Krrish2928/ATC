import { Trail } from '@react-three/drei'
import * as THREE from 'three'

/**
 * ContrailTrail
 * Creates a glowing contrail behind the airplane.
 */
export default function ContrailTrail({ target, color }) {
  return (
    <Trail
      width={1.2} // width of trail
      length={20} // length of trail points
      color={new THREE.Color(color || '#ffffff')}
      attenuation={(t) => t * t} // fade out towards end
      target={target} // attaches to airplane
      local={false} // keep trail in world space
    >
      <meshBasicMaterial 
        color={new THREE.Color(color || '#ffffff')} 
        transparent 
        opacity={0.4} 
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </Trail>
  )
}
