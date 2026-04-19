import { useMemo } from 'react'
import Airplane from './Airplane'

/*
 * AirplaneFleet
 * Generates an array of individual planes that construct their own paths on the globe.
 */
export default function AirplaneFleet() {
  const fleet = useMemo(() => {
    return Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      startDelay: Math.random() * 2, // stagger starts slightly to avoid uniformity
    }))
  }, [])

  return (
    <group name="airplane-fleet">
      {fleet.map((plane) => (
        <Airplane key={plane.id} startDelay={plane.startDelay} />
      ))}
    </group>
  )
}
