/**
 * Lights
 * Core scene lighting.
 */
export default function Lights() {
  return (
    <>
      {/* Lower ambient to make the dark side shadows more dramatic */}
      <ambientLight intensity={0.15} />
      
      {/* Strong sun light for vivid lit side */}
      <directionalLight 
        position={[6, 4, 3]} 
        intensity={2.5} 
        color="#ffffff" 
      />
      
      {/* Soft blue rim/fill light for space cinematic feel */}
      <pointLight 
        position={[-5, 3, -5]} 
        intensity={1.2} 
        color="#4d9fff" 
      />

      {/* Secondary rim light for silhouette definition on the dark side */}
      <spotLight
        position={[-8, -5, -4]}
        intensity={1.0}
        color="#ffffff"
        angle={0.6}
        penumbra={1}
      />
    </>
  )
}
