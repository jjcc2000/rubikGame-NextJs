"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function Cubie({ position, colorMap }: { position: [number, number, number]; colorMap: Record<string, string> }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const faces = Object.entries(colorMap).map(([face, color]) => {
    const material = new THREE.MeshBasicMaterial({ color });
    return material;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.95, 0.95, 0.95]} />
      {faces.length > 0 ? <meshStandardMaterial attach="material" color="white" /> : null}
    </mesh>
  );
}

export default function Cube() {
  const cubies = [];
  const offset = [-1, 0, 1];

  for (let x of offset) {
    for (let y of offset) {
      for (let z of offset) {
        cubies.push(
          <Cubie
            key={`${x}-${y}-${z}`}
            position={[x, y, z]}
            colorMap={{ front: "#ff3d3d" }} // placeholder, all faces red
          />
        );
      }
    }
  }

  return (
    <Canvas camera={{ position: [5, 5, 5] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
      <group>{cubies}</group>
      <OrbitControls />
    </Canvas>
  );
}
