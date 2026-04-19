import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * usePlaneRoutes
 * Generates 6 unique CatmullRomCurve3 paths for the airplane fleet:
 *   - 2 large circular orbits around the globe
 *   - 2 figure-eight paths
 *   - 2 fast cross-screen paths
 * Returns an array of route config objects.
 */
export function usePlaneRoutes() {
  const routes = useMemo(() => {
    // Helper: circle points on a tilted plane
    const circlePoints = (radius, tilt, yOffset, segments = 32) => {
      const pts = []
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const y = Math.sin(angle + tilt) * (radius * 0.2) + yOffset
        pts.push(new THREE.Vector3(x, y, z))
      }
      return pts
    }

    // Helper: figure-eight (lemniscate) points
    const figureEightPoints = (scale, plane, segments = 48) => {
      const pts = []
      for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI * 2
        const denom = 1 + Math.sin(t) * Math.sin(t)
        const x = (scale * Math.cos(t)) / denom
        const z = (scale * Math.sin(t) * Math.cos(t)) / denom
        const y = plane + Math.sin(t * 2) * 0.5
        pts.push(new THREE.Vector3(x, y, z))
      }
      return pts
    }

    // Helper: fast diagonal cross-screen path
    const crossPath = (fromX, fromZ, toX, toZ, yBase, segments = 6) => {
      const pts = []
      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        pts.push(new THREE.Vector3(
          THREE.MathUtils.lerp(fromX, toX, t) + Math.sin(t * Math.PI) * 1.5,
          yBase + Math.sin(t * Math.PI) * 0.8,
          THREE.MathUtils.lerp(fromZ, toZ, t)
        ))
      }
      return pts
    }

    return [
      // --- Plane 0: Large circular orbit, tilted 15°
      {
        id: 0,
        curve: new THREE.CatmullRomCurve3(circlePoints(5.5, 0.25, 0.4), true),
        speed: 0.00015,
        type: 'orbit',
        trailColor: '#a0c4ff',
        thrustColor: null,
        scale: 0.018,
      },

      // --- Plane 1: Large circular orbit, opposite direction, high
      {
        id: 1,
        curve: new THREE.CatmullRomCurve3(circlePoints(6.2, -0.3, -0.6).reverse(), true),
        speed: 0.00012,
        type: 'orbit',
        trailColor: '#b8d4ff',
        thrustColor: null,
        scale: 0.016,
      },

      // --- Plane 2: Figure-eight, upper hemisphere
      {
        id: 2,
        curve: new THREE.CatmullRomCurve3(figureEightPoints(5.0, 1.2), true),
        speed: 0.00018,
        type: 'figure8',
        trailColor: '#c8dfff',
        thrustColor: null,
        scale: 0.014,
      },

      // --- Plane 3: Figure-eight, lower hemisphere
      {
        id: 3,
        curve: new THREE.CatmullRomCurve3(figureEightPoints(4.5, -1.4), true),
        speed: 0.0002,
        type: 'figure8',
        trailColor: '#d4e8ff',
        thrustColor: null,
        scale: 0.014,
      },

      // --- Plane 4: Fast cross-screen — left to right
      {
        id: 4,
        curve: new THREE.CatmullRomCurve3(crossPath(-9, -2, 9, 3, 2.5), false),
        speed: 0.0012,
        type: 'fast',
        trailColor: '#ff8c42',
        thrustColor: '#ff4500',
        scale: 0.022,
        loop: false,
      },

      // --- Plane 5: Fast cross-screen — diagonal deep
      {
        id: 5,
        curve: new THREE.CatmullRomCurve3(crossPath(7, 4, -7, -3, -2.0), false),
        speed: 0.001,
        type: 'fast',
        trailColor: '#ffa060',
        thrustColor: '#ff6020',
        scale: 0.02,
        loop: false,
      },
    ]
  }, [])

  return routes
}
