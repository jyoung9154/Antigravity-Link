'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrthographicCamera, Environment, Text, ContactShadows, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Procedural Agent Component
function Agent({ isWorking, currentTask }: { isWorking: boolean, currentTask: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current || !leftArmRef.current || !rightArmRef.current) return;
    
    // Typing animation
    if (isWorking) {
      const time = clock.getElapsedTime();
      leftArmRef.current.rotation.x = -1.2 + Math.sin(time * 15) * 0.1;
      rightArmRef.current.rotation.x = -1.2 + Math.cos(time * 15) * 0.1;
      groupRef.current.position.y = Math.sin(time * 2) * 0.02;
    } else {
      leftArmRef.current.rotation.x = 0;
      rightArmRef.current.rotation.x = 0;
      groupRef.current.position.y = 0;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.8, 0]}>
      <Text 
        position={[0, 1.3, 0]} 
        fontSize={0.2} 
        color={isWorking ? '#4ade80' : 'white'}
        anchorX="center" 
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {isWorking ? currentTask || 'Working...' : 'Idle'}
      </Text>

      {/* Head */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#fcd5ce" />
      </mesh>
      
      {/* Body */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.4, 0.5, 0.2]} />
        <meshStandardMaterial color="#8b5cf6" />
      </mesh>

      {/* Left Arm */}
      <group position={[0.25, 0.4, 0]} ref={leftArmRef}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial color="#8b5cf6" />
        </mesh>
      </group>

      {/* Right Arm */}
      <group position={[-0.25, 0.4, 0]} ref={rightArmRef}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial color="#8b5cf6" />
        </mesh>
      </group>

      {/* Legs */}
      <mesh position={[0.1, -0.2, 0.15]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <boxGeometry args={[0.12, 0.4, 0.12]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[-0.1, -0.2, 0.15]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <boxGeometry args={[0.12, 0.4, 0.12]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
}

// Procedural Desk Component
function Desk() {
  return (
    <group position={[0, 0, 0.6]}>
      {/* Desk Top */}
      <mesh position={[0, 0.75, 0]} receiveShadow castShadow>
        <boxGeometry args={[1.4, 0.05, 0.7]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      {/* Legs */}
      <mesh position={[0.65, 0.375, -0.3]} castShadow><boxGeometry args={[0.05, 0.75, 0.05]} /><meshStandardMaterial color="#94a3b8" /></mesh>
      <mesh position={[-0.65, 0.375, -0.3]} castShadow><boxGeometry args={[0.05, 0.75, 0.05]} /><meshStandardMaterial color="#94a3b8" /></mesh>
      <mesh position={[0.65, 0.375, 0.3]} castShadow><boxGeometry args={[0.05, 0.75, 0.05]} /><meshStandardMaterial color="#94a3b8" /></mesh>
      <mesh position={[-0.65, 0.375, 0.3]} castShadow><boxGeometry args={[0.05, 0.75, 0.05]} /><meshStandardMaterial color="#94a3b8" /></mesh>
      
      {/* Monitor */}
      <mesh position={[0, 0.95, -0.1]} castShadow>
        <boxGeometry args={[0.7, 0.4, 0.05]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0, 0.8, -0.1]} castShadow>
        <boxGeometry args={[0.1, 0.2, 0.05]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
    </group>
  );
}

// Isometric Room Details
function Room() {
  return (
    <group position={[0, 0, 0]}>
      {/* Floor */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>
      
      {/* Left Wall */}
      <mesh position={[-4, 2, 0]} receiveShadow>
        <boxGeometry args={[0.2, 4, 8]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      
      {/* Back Wall */}
      <mesh position={[0, 2, -4]} receiveShadow>
        <boxGeometry args={[8, 4, 0.2]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      
      {/* Plant Prop */}
      <group position={[-3, 0, -3]}>
        <mesh position={[0, 0.4, 0]} castShadow><cylinderGeometry args={[0.3, 0.2, 0.8]} /><meshStandardMaterial color="#b45309" /></mesh>
        <mesh position={[0, 1.2, 0]} castShadow><sphereGeometry args={[0.6]} /><meshStandardMaterial color="#15803d" /></mesh>
      </group>
      
      {/* Bookshelf Prop */}
      <group position={[2.5, 1.5, -3.8]}>
        <mesh castShadow receiveShadow><boxGeometry args={[1.5, 3, 0.4]} /><meshStandardMaterial color="#78350f" /></mesh>
        {/* Books */}
        <mesh position={[-0.4, 0.2, 0.1]}><boxGeometry args={[0.1, 0.4, 0.3]} /><meshStandardMaterial color="#dc2626" /></mesh>
        <mesh position={[-0.2, 0.2, 0.1]}><boxGeometry args={[0.1, 0.4, 0.3]} /><meshStandardMaterial color="#2563eb" /></mesh>
        <mesh position={[0, 0.1, 0.1]} rotation={[0, 0, 0.2]}><boxGeometry args={[0.1, 0.4, 0.3]} /><meshStandardMaterial color="#16a34a" /></mesh>
      </group>

      {/* Rug */}
      <mesh position={[0, 0.01, 1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3, 2]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
    </group>
  );
}

export default function AgentOffice({ isWorking, currentTask }: { isWorking: boolean, currentTask: string }) {
  return (
    <div style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}>
      <Canvas shadows>
        {/* Isometric Camera Setup */}
        <OrthographicCamera makeDefault position={[10, 10, 10]} zoom={60} near={-10} far={50} />
        <OrbitControls target={[0, 0, 0]} enableZoom={true} enableRotate={true} />
        
        <color attach="background" args={['#0f172a']} />
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[5, 10, 5]} 
          intensity={1.2} 
          castShadow 
          shadow-mapSize={[1024, 1024]}
        />
        
        <Suspense fallback={null}>
          <Room />
          <group position={[0, 0.1, 1]}>
            <Agent isWorking={isWorking} currentTask={currentTask} />
            <Desk />
          </group>
          <ContactShadows position={[0, 0.02, 1]} opacity={0.6} scale={4} blur={1.5} far={4} color="#000000" />
        </Suspense>
      </Canvas>
    </div>
  );
}
