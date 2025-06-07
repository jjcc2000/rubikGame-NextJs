// components/Cube.tsx
"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";

export type FaceName = "front" | "back" | "left" | "right" | "top" | "bottom";

const FACE_COLORS: Record<FaceName, string> = {
  front: "red",
  back: "orange",
  left: "blue",
  right: "green",
  top: "white",
  bottom: "yellow",
};

function useDragRotation(onRotate: (start: THREE.Vector2, end: THREE.Vector2, hit: THREE.Intersection) => void) {
  const { gl, camera, scene } = useThree();
  const [dragStart, setDragStart] = useState<THREE.Vector2 | null>(null);
  const [hitObject, setHitObject] = useState<THREE.Intersection | null>(null);

  useEffect(() => {
    const raycaster = new THREE.Raycaster();

    const handlePointerDown = (e: MouseEvent) => {
      const bounds = gl.domElement.getBoundingClientRect();
      const x = ((e.clientX - bounds.left) / bounds.width) * 2 - 1;
      const y = -((e.clientY - bounds.top) / bounds.height) * 2 + 1;
      const pointer = new THREE.Vector2(x, y);
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
        setDragStart(pointer);
        setHitObject(intersects[0]);
      }
    };

    const handlePointerUp = (e: MouseEvent) => {
      if (!dragStart || !hitObject) return;
      const bounds = gl.domElement.getBoundingClientRect();
      const x = ((e.clientX - bounds.left) / bounds.width) * 2 - 1;
      const y = -((e.clientY - bounds.top) / bounds.height) * 2 + 1;
      const end = new THREE.Vector2(x, y);
      onRotate(dragStart, end, hitObject);
      setDragStart(null);
      setHitObject(null);
    };

    gl.domElement.addEventListener("pointerdown", handlePointerDown);
    gl.domElement.addEventListener("pointerup", handlePointerUp);

    return () => {
      gl.domElement.removeEventListener("pointerdown", handlePointerDown);
      gl.domElement.removeEventListener("pointerup", handlePointerUp);
    };
  }, [gl, camera, scene, dragStart, hitObject, onRotate]);
}

function createInitialFaceMap(x: number, y: number, z: number): Record<FaceName, string> {
  const faceMap: Record<FaceName, string> = {
    front: z === 1 ? FACE_COLORS.front : "black",
    back: z === -1 ? FACE_COLORS.back : "black",
    left: x === -1 ? FACE_COLORS.left : "black",
    right: x === 1 ? FACE_COLORS.right : "black",
    top: y === 1 ? FACE_COLORS.top : "black",
    bottom: y === -1 ? FACE_COLORS.bottom : "black",
  };
  return faceMap;
}

function ColoredBox({ position, faceMap }: { position: [number, number, number]; faceMap: Record<FaceName, string> }) {
  const materials = [
    new THREE.MeshBasicMaterial({ color: faceMap.right }),
    new THREE.MeshBasicMaterial({ color: faceMap.left }),
    new THREE.MeshBasicMaterial({ color: faceMap.top }),
    new THREE.MeshBasicMaterial({ color: faceMap.bottom }),
    new THREE.MeshBasicMaterial({ color: faceMap.front }),
    new THREE.MeshBasicMaterial({ color: faceMap.back }),
  ];

  return (
    <mesh position={position}>
      <boxGeometry args={[0.95, 0.95, 0.95]} />
      {materials.map((material, i) => (
        <primitive key={i} attach={`material-${i}`} object={material} />
      ))}
    </mesh>
  );
}

function CubeGroup() {
  const cubeRef = useRef<THREE.Group>(null);
  const [rotating, setRotating] = useState(false);
  const [cubies, setCubies] = useState(() => {
    const offset = [-1, 0, 1];
    return offset.flatMap((x) =>
      offset.flatMap((y) =>
        offset.map((z) => ({
          position: [x, y, z] as [number, number, number],
          faceMap: createInitialFaceMap(x, y, z),
        }))
      )
    );
  });

  useDragRotation((start, end, hit) => {
    if (rotating || !cubeRef.current) return;

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "up" : "down";

    const normal = hit.face?.normal.clone().applyMatrix3(new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld));
    if (!normal) return;

    const axis = new THREE.Vector3(
      Math.abs(normal.x) > 0.9 ? 1 : 0,
      Math.abs(normal.y) > 0.9 ? 1 : 0,
      Math.abs(normal.z) > 0.9 ? 1 : 0
    );

    const hitPos = hit.object.parent?.position;
    if (!hitPos) return;

    const layerCoord = Math.round(hitPos[axis.x ? "x" : axis.y ? "y" : "z"]);

    const layerGroup = new THREE.Group();
    const rotatingCubies: any[] = [];

    cubeRef.current.children.forEach((child, index) => {
      if (Math.round(child.position[axis.x ? "x" : axis.y ? "y" : "z"]) === layerCoord) {
        layerGroup.add(child);
        rotatingCubies.push(index);
      }
    });

    cubeRef.current.add(layerGroup);

    const angle = Math.PI / 2 * (direction === "left" || direction === "down" ? 1 : -1);
    let current = 0;
    const step = angle / 20;
    setRotating(true);

    const animate = () => {
      if (current < Math.abs(angle)) {
        layerGroup.rotateOnWorldAxis(axis, step * Math.sign(angle));
        current += Math.abs(step);
        requestAnimationFrame(animate);
      } else {
        setRotating(false);
        while (layerGroup.children.length > 0) {
          cubeRef.current!.add(layerGroup.children[0]);
        }
        cubeRef.current!.remove(layerGroup);

        // Update face colors (example: top layer only)
        if (axis.y === 1 && layerCoord === 1) {
          setCubies((prev) => {
            const newCubies = [...prev];
            for (const idx of rotatingCubies) {
              const cubie = { ...newCubies[idx] };
              cubie.faceMap = {
                front: newCubies[idx].faceMap.left,
                right: newCubies[idx].faceMap.front,
                back: newCubies[idx].faceMap.right,
                left: newCubies[idx].faceMap.back,
                top: newCubies[idx].faceMap.top,
                bottom: newCubies[idx].faceMap.bottom,
              };
              newCubies[idx] = cubie;
            }
            return newCubies;
          });
        }
      }
    };
    animate();
  });

  return (
    <group ref={cubeRef}>
      {cubies.map((c, i) => (
        <ColoredBox key={i} position={c.position} faceMap={c.faceMap} />
      ))}
    </group>
  );
}

export default function Cube() {
  return (
    <Canvas camera={{ position: [5, 5, 5] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
      <CubeGroup />
      <OrbitControls />
    </Canvas>
  );
}
