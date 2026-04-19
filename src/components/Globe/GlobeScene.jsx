import { Canvas } from '@react-three/fiber'
import { EffectComposer, Vignette } from '@react-three/postprocessing'
import { useEffect, useRef } from 'react'
import Earth from './Earth'
import Stars from './Stars'
import Lights from './Lights'
import CameraRig from './CameraRig'

/**
 * GlobeScene
 * Clean, cinematic space scene without hazy blooms.
 */
export default function GlobeScene({ isZoomed, setIsZoomed }) {
  const glRef = useRef(null)

  useEffect(() => {
    return () => {
      // PROPER CLEANUP: Dispose of the Three.js renderer to free up WebGL context for Mapbox
      try {
        if (glRef.current) {
          console.log("Forcing Three.js renderer disposal...")
          if (typeof glRef.current.dispose === 'function') {
            glRef.current.dispose();
          }
          if (typeof glRef.current.forceContextLoss === 'function') {
            glRef.current.forceContextLoss();
          }
          if (glRef.current.domElement && glRef.current.domElement.parentNode) {
            glRef.current.domElement.remove();
          }
        }
      } catch (err) {
        console.warn("Renderer cleanup failed (non-fatal):", err);
      }
    };
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 8.5], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: "high-performance" }} // enabled antialiasing for crisp edge
      style={{ background: '#000000', cursor: 'pointer' }}
      onCreated={({ gl }) => {
        glRef.current = gl
        window.__threeRenderer = gl // Global reference for App.jsx cleanup
      }}
    >
      <CameraRig isZoomed={isZoomed} />
      
      <Lights />
      <Stars />


      <group position={[2.0, 0, 0]}>
        <Earth onClick={() => setIsZoomed(!isZoomed)} />
      </group>

      <EffectComposer disableNormalPass>
        {/* Removed Bloom to keep scene strictly crisp and minimal */}
        <Vignette eskil={false} offset={0.1} darkness={0.9} />
      </EffectComposer>
    </Canvas>
  )
}
