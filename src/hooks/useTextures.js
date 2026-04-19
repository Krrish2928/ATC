import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import * as THREE from 'three'

/**
 * useTextures
 * Loads all Earth textures from /public/textures/.
 * Falls back gracefully to null if files don't exist.
 */
export function useTextures() {
  let dayMap = null
  let nightMap = null
  let normalMap = null
  let specularMap = null
  let cloudsMap = null

  // useLoader throws Promises for Suspense if textures are still loading
  const textures = useLoader(TextureLoader, [
    '/textures/earth_day.jpg',
    '/textures/earth_night.jpg',
    '/textures/earth_normal.jpg',
    '/textures/earth_specular.jpg',
    '/textures/clouds_alpha.jpg',
  ])
  ;[dayMap, nightMap, normalMap, specularMap, cloudsMap] = textures

  // Set color space for color textures
  if (dayMap) dayMap.colorSpace = THREE.SRGBColorSpace
  if (nightMap) nightMap.colorSpace = THREE.SRGBColorSpace

  return { dayMap, nightMap, normalMap, specularMap, cloudsMap }
}
