// Atmosphere glow shader using Fresnel effect
// Applied to a slightly-larger sphere with BackSide rendering + AdditiveBlending

export const atmosphereVertexShader = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const atmosphereFragmentShader = /* glsl */`
  uniform vec3 glowColor;
  uniform float intensity;
  uniform float power;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    // Fresnel: strongest at grazing angles (rim)
    vec3 viewDir = normalize(-vPosition);
    float fresnel = dot(viewDir, vNormal);
    fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
    fresnel = pow(fresnel, power);
    float alpha = fresnel * intensity;
    gl_FragColor = vec4(glowColor * fresnel, alpha);
  }
`

export const atmosphereUniforms = {
  glowColor: { value: null }, // set at component level
  intensity: { value: 1.6 },
  power: { value: 3.5 },
}

// Night-side city-lights blend shader (applied as a second pass on Earth)
export const nightBlendVertexShader = /* glsl */`
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldNormal;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const nightBlendFragmentShader = /* glsl */`
  uniform sampler2D dayTexture;
  uniform sampler2D nightTexture;
  uniform vec3 sunDirection;
  varying vec2 vUv;
  varying vec3 vWorldNormal;

  void main() {
    vec3 normal = normalize(vWorldNormal);
    float cosAngle = dot(normal, normalize(sunDirection));

    // Smooth day/night terminator blend
    float blend = smoothstep(-0.1, 0.3, cosAngle);

    vec4 dayColor   = texture2D(dayTexture, vUv);
    vec4 nightColor = texture2D(nightTexture, vUv);

    gl_FragColor = mix(nightColor, dayColor, blend);
  }
`
