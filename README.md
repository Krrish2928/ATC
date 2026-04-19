# ATC Platform

A premium Air Traffic Control (ATC) 3D web platform built with React, Vite, Three.js, and React Three Fiber.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Add Assets to `public` Folder**
   You need to add certain textures and models for the full experience. The code is structured to fallback gracefully if they are missing, but the premium look requires them.

   **Textures (`public/textures/`):**
   - Place the following textures inside `/public/textures/`:
     - `earth_day.jpg`
     - `earth_night.jpg`
     - `earth_normal.jpg`
     - `earth_specular.jpg`
     - `clouds_alpha.jpg`
   - **Where to get them:**
     - Solar System Scope: [https://www.solarsystemscope.com/textures/](https://www.solarsystemscope.com/textures/) 
     - Search online for standard 4K or 8K Earth PBR texture sets.

   **Models (`public/models/`):**
   - Place a 3D model inside `/public/models/`:
     - `airplane.glb`
   - **Where to get them:**
     - Sketchfab (Search for "Free Commercial Airplane glTF").
     - NASA 3D Resources.
     - Ensure the model faces the positive X axis for correct orientation, or adjust the initial rotation in `src/components/Planes/Airplane.jsx`. 

3. **Run Dev Server**
   ```bash
   npm run dev
   ```

## Features Complete:
- Phase 1 Intro Animation: Fading point cloud stars, volumetric cloud puffs, and a diagonal animated jet using a CatmullRomCurve3 and Trail effect.
- Phase 2 Main Landing Page: Beautiful 3D Earth using `MeshStandardMaterial` injected with custom GLSL for a Day/Night dynamic terminator blend.
- Independent Cloud layer and Atmosphere glowing halo (Fresnel shader).
- Auto-rotation and velocity-based pointer-drag inertia (custom hook).
- 6 Independent Airplane paths (CatmullRom curves): Orbits, Figure-8s, Fast flybys.
- Trails and engine thrust lights.
- Post-processing: Bloom pass and vignette overlay.
- Minimal frosted glass UI overlays.
- 100% generated from scratch React + Vite boilerplate.
