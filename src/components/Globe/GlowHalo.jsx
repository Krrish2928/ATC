import * as THREE from 'three'

/**
 * GlowHalo
 * A simple sprite/billboard sitting behind the Earth to give an outer atmospheric soft glow.
 */
export default function GlowHalo() {
  return (
    <sprite scale={[7.5, 7.5, 1]} position={[0, 0, -1]}>
      <spriteMaterial
        color="#4d9fff"
        transparent={true}
        opacity={0.15}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        map={createRadialGradient()}
      />
    </sprite>
  )
}

function createRadialGradient() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const context = canvas.getContext('2d')
  const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)')
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 256, 256)
  return new THREE.CanvasTexture(canvas)
}
