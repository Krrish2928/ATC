import * as THREE from 'three'

/**
 * Atmosphere
 * A vibrant blue atmospheric glow and inner Fresnel rim shader.
 */
export default function Atmosphere() {
  const atmosphereVertexShader = `
    varying vec3 vNormal;
    varying vec3 vPositionW;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPositionW = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  const atmosphereFragmentShader = `
    varying vec3 vNormal;
    varying vec3 vPositionW;
    void main() {
      // Improved atmospheric halo calculation
      vec3 viewDirection = normalize(cameraPosition - vPositionW);
      float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 3.0);
      
      // Vibrant cinematic blue
      vec3 atmosphereColor = vec3(0.0, 0.27, 1.0); // #0044ff equivalent roughly
      gl_FragColor = vec4(atmosphereColor, 1.0) * intensity;
    }
  `

  const fresnelVertexShader = `
    varying vec3 vPositionW;
    varying vec3 vNormalW;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vPositionW = worldPosition.xyz;
      vNormalW = normalize(vec3(modelMatrix * vec4(normal, 0.0)));
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `

  const fresnelFragmentShader = `
    varying vec3 vPositionW;
    varying vec3 vNormalW;
    void main() {
      vec3 viewDirection = normalize(cameraPosition - vPositionW);
      float fresnelTerm = dot(viewDirection, vNormalW);
      fresnelTerm = clamp(1.0 - fresnelTerm, 0.0, 1.0);
      fresnelTerm = pow(fresnelTerm, 2.5); // slightly softer but vivid edge glow
      
      gl_FragColor = vec4(0.1, 0.5, 1.0, fresnelTerm * 0.9);
    }
  `

  return (
    <group>

      
      {/* Inner Fresnel Rim Glow */}
      <mesh>
        <sphereGeometry args={[2.51, 64, 64]} />
        <shaderMaterial
          vertexShader={fresnelVertexShader}
          fragmentShader={fresnelFragmentShader}
          blending={THREE.AdditiveBlending}
          transparent={true}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
