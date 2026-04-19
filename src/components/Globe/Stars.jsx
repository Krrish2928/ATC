import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Satellite
 * Simple animated satellite model: small body with solar panels.
 */
function Satellite({ index }) {
  const ref = useRef()
  
  // Randomize initial settings based on index to ensure diversity
  const { speed, direction, startPos } = useMemo(() => {
    const dir = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize()
    
    return {
      speed: 0.5 + Math.random() * 0.8,
      direction: dir,
      startPos: new THREE.Vector3(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
        -30 - Math.random() * 20
      )
    }
  }, [index])

  useFrame((state, delta) => {
    if (!ref.current) return
    
    // Smooth linear movement
    ref.current.position.addScaledVector(direction, speed * delta)
    
    // Loop back logic: if too far in any direction, wrap around
    const bounds = 60
    if (Math.abs(ref.current.position.x) > bounds) ref.current.position.x *= -0.95
    if (Math.abs(ref.current.position.y) > bounds) ref.current.position.y *= -0.95
    if (Math.abs(ref.current.position.z) > bounds + 40) ref.current.position.z = -30
    
    // Suble wobble/rotation
    ref.current.rotation.x += delta * 0.2
    ref.current.rotation.y += delta * 0.1
  })

  return (
    <group ref={ref} position={startPos} scale={[0.15, 0.15, 0.15]}>
      {/* Central rectangular body - Neutral Grey/White */}
      <mesh>
        <boxGeometry args={[1.2, 0.8, 0.8]} />
        <meshStandardMaterial color="#f0f0f0" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Solar Panel Wing Left - Deep Blue */}
      <mesh position={[-1.6, 0, 0]}>
        <boxGeometry args={[2.0, 0.6, 0.05]} />
        <meshStandardMaterial color="#1a4a8a" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Solar Panel Wing Right - Deep Blue */}
      <mesh position={[1.6, 0, 0]}>
        <boxGeometry args={[2.0, 0.6, 0.05]} />
        <meshStandardMaterial color="#1a4a8a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Tiny antenna for detail */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>
    </group>
  )
}

/**
 * Stars
 * High-fidelity deep space starfield with 2500+ stars.
 * Features varied sizes, realistic color tints, and subtle shimmering.
 */
export default function Stars() {
  const count = 2500
  
  const { positions, colors, sizes, twinkleSpeeds } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const sz = new Float32Array(count)
    const tnk = new Float32Array(count)
    
    const colorOptions = [
      new THREE.Color('#ffffff'), // Pure White
      new THREE.Color('#c8d8ff'), // Blue Tint
      new THREE.Color('#fff5e0'), // Warm White
    ]

    for (let i = 0; i < count; i++) {
      // Distribute randomly across a large sphere
      const r = 40 + Math.random() * 60
      const theta = 2 * Math.PI * Math.random()
      const phi = Math.acos(2 * Math.random() - 1)
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)

      // Color variation
      const color = colorOptions[Math.floor(Math.random() * colorOptions.length)]
      col[i * 3] = color.r
      col[i * 3 + 1] = color.g
      col[i * 3 + 2] = color.b

      // Size variation (0.1 to 2.5) - 5% are bigger foreground stars
      const isForeground = Math.random() > 0.95
      sz[i] = isForeground ? (1.5 + Math.random() * 1.0) : (0.1 + Math.random() * 0.8)

      // Twinkle speed
      tnk[i] = 0.5 + Math.random() * 2.0
    }
    return { positions: pos, colors: col, sizes: sz, twinkleSpeeds: tnk }
  }, [count])

  const starMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      transparent: true,
      vertexShader: `
        attribute float aSize;
        attribute vec3 aColor;
        attribute float aTwinkleSpeed;
        varying vec3 vColor;
        varying float vTwinkle;
        uniform float uTime;

        void main() {
          vColor = aColor;
          // Calculate twinkle factor based on time and random speed
          vTwinkle = 0.6 + 0.4 * sin(uTime * aTwinkleSpeed + float(gl_VertexID));
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vTwinkle;

        void main() {
          // Circular particle shape
          float dist = distance(gl_PointCoord, vec2(0.5));
          if (dist > 0.5) discard;
          
          float alpha = smoothstep(0.5, 0.2, dist) * vTwinkle;
          gl_FragColor = vec4(vColor, alpha * 0.8);
        }
      `,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  }, [])

  useFrame((state) => {
    if (starMaterial) {
      starMaterial.uniforms.uTime.value = state.clock.getElapsedTime()
    }
  })

  return (
    <group>
      <points material={starMaterial}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-aColor" count={count} array={colors} itemSize={3} />
          <bufferAttribute attach="attributes-aSize" count={count} array={sizes} itemSize={1} />
          <bufferAttribute attach="attributes-aTwinkleSpeed" count={count} array={twinkleSpeeds} itemSize={1} />
        </bufferGeometry>
      </points>
      
      {/* 5 Animated Satellites */}
      <Satellite index={0} />
      <Satellite index={1} />
      <Satellite index={2} />
      <Satellite index={3} />
      <Satellite index={4} />
      <Satellite index={5} />
    </group>
  )
}


