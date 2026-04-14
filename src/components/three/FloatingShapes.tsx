import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

const AnimatedSphere = ({ position, color }: { position: [number, number, number]; color: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <icosahedronGeometry args={[1.2, 4]} />
        <MeshDistortMaterial
          color={color}
          roughness={0.3}
          metalness={0.6}
          distort={0.3}
          speed={1.5}
        />
      </mesh>
    </Float>
  );
};

export const FloatingShapes = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 50 }}
      className="absolute inset-0"
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color="#D4B483" />
      
      <AnimatedSphere position={[3, 1.5, -2]} color="#C2A78D" />
    </Canvas>
  );
};
