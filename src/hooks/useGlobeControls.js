import { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * useGlobeControls
 * Custom pointer-event drag handler for the globe.
 * Rotates the globe on drag with smooth inertia on release.
 * Supports mouse and touch.
 */
export function useGlobeControls(meshRef) {
  const { gl, camera } = useThree()
  const isDragging = useRef(false)
  const previousPointer = useRef({ x: 0, y: 0 })
  const velocity = useRef({ x: 0, y: 0 })
  const raycaster = useRef(new THREE.Raycaster()).current

  useEffect(() => {
    const canvas = gl.domElement

    const getPointerPos = (e) => {
      // Handle both mouse and touch
      if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY }
      }
      return { x: e.clientX, y: e.clientY }
    }

    const onPointerDown = (e) => {
      // ONLY start dragging if hovered precisely over the globe
      const rect = canvas.getBoundingClientRect()
      const pos = getPointerPos(e)
      
      const x = ((pos.x - rect.left) / rect.width) * 2 - 1
      const y = -((pos.y - rect.top) / rect.height) * 2 + 1
      
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera)
      if (meshRef.current) {
        const intersects = raycaster.intersectObject(meshRef.current, true)
        if (intersects.length === 0) return // Exit if not intersecting globe
      }

      isDragging.current = true
      previousPointer.current = { x: pos.x, y: pos.y }
      velocity.current = { x: 0, y: 0 }
      document.body.style.cursor = 'grabbing'
    }

    const onPointerMove = (e) => {
      if (!isDragging.current || !meshRef.current) return
      
      // Prevent scrolling while dragging globe on mobile
      if (e.touches) e.preventDefault()

      const pos = getPointerPos(e)
      const dx = pos.x - previousPointer.current.x
      const dy = pos.y - previousPointer.current.y
      previousPointer.current = { x: pos.x, y: pos.y }

      const sensitivity = 0.004

      // Build rotation quaternions
      const qY = new THREE.Quaternion()
      const qX = new THREE.Quaternion()
      qY.setFromAxisAngle(new THREE.Vector3(0, 1, 0), dx * sensitivity)
      qX.setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy * sensitivity)

      meshRef.current.quaternion.premultiply(qY)
      meshRef.current.quaternion.premultiply(qX)

      // Track velocity for inertia
      velocity.current = {
        x: dx * sensitivity * 0.6,
        y: dy * sensitivity * 0.6,
      }
    }

    const onPointerUp = () => {
      if (isDragging.current) {
        isDragging.current = false
        document.body.style.cursor = 'auto'
      }
    }

    // pointer events cover mouse. touch events explicitly for mobile.
    canvas.addEventListener('mousedown', onPointerDown)
    canvas.addEventListener('mousemove', onPointerMove)
    canvas.addEventListener('mouseup', onPointerUp)
    canvas.addEventListener('mouseleave', onPointerUp)
    
    // Touch events
    canvas.addEventListener('touchstart', onPointerDown, { passive: false })
    canvas.addEventListener('touchmove', onPointerMove, { passive: false })
    canvas.addEventListener('touchend', onPointerUp)
    canvas.addEventListener('touchcancel', onPointerUp)

    document.body.style.cursor = 'auto'

    return () => {
      canvas.removeEventListener('mousedown', onPointerDown)
      canvas.removeEventListener('mousemove', onPointerMove)
      canvas.removeEventListener('mouseup', onPointerUp)
      canvas.removeEventListener('mouseleave', onPointerUp)
      
      canvas.removeEventListener('touchstart', onPointerDown)
      canvas.removeEventListener('touchmove', onPointerMove)
      canvas.removeEventListener('touchend', onPointerUp)
      canvas.removeEventListener('touchcancel', onPointerUp)
      document.body.style.cursor = 'auto'
    }
  }, [gl, camera, meshRef, raycaster])

  // Apply inertia decay each frame — call this in useFrame
  const applyInertia = () => {
    if (!isDragging.current && meshRef.current) {
      const damping = 0.95 // very smooth glide
      velocity.current.x *= damping
      velocity.current.y *= damping

      if (Math.abs(velocity.current.x) > 0.0001 || Math.abs(velocity.current.y) > 0.0001) {
        const qY = new THREE.Quaternion()
        const qX = new THREE.Quaternion()
        qY.setFromAxisAngle(new THREE.Vector3(0, 1, 0), velocity.current.x)
        qX.setFromAxisAngle(new THREE.Vector3(1, 0, 0), velocity.current.y)
        meshRef.current.quaternion.premultiply(qY)
        meshRef.current.quaternion.premultiply(qX)
      }
    }
  }

  return { isDragging, applyInertia }
}
