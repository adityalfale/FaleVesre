"use client";

import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import * as THREE from "three";

interface BorewellSceneProps {
  isPumping: boolean;
  waterDepth: number; // depth to water in meters (e.g. 12 to 25m)
  waterColumn: number; // water column height in meters
  totalExtracted: number;
  pumpingRate: number;
  showLayers: boolean;
  onHoverComponent: (name: string | null) => void;
}

// 3D Pump and Water flow elements
function PumpAssembly({ isPumping, waterDepth }: { isPumping: boolean; waterDepth: number }) {
  const motorRef = useRef<THREE.Group>(null);
  const waterFlowRef = useRef<THREE.Points>(null);

  // Water particles inside discharge pipe
  const particleCount = 60;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = 0; // x
    positions[i * 3 + 1] = -7 + (i / particleCount) * 8.5; // y from pump to surface
    positions[i * 3 + 2] = 0.1; // z inside pipe
  }

  useFrame((_, delta) => {
    if (isPumping && motorRef.current) {
      motorRef.current.rotation.y += delta * 12;
    }

    if (isPumping && waterFlowRef.current) {
      const posAttr = waterFlowRef.current.geometry.attributes.position;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        arr[i * 3 + 1] += delta * 4; // move upward
        if (arr[i * 3 + 1] > 1.8) {
          arr[i * 3 + 1] = -7.5; // loop back from bottom pump
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Pumping Riser Pipe (Blue vertical pipe inside borewell) */}
      <mesh position={[0.1, -2.8, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 9.4, 16]} />
        <meshStandardMaterial color="#1769AA" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Upward Water Flowing Particles */}
      {isPumping && (
        <points ref={waterFlowRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particleCount}
              array={positions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial color="#22B8CF" size={0.09} transparent opacity={0.9} />
        </points>
      )}

      {/* Submersible Pump Unit at bottom */}
      <group position={[0.1, -7.2, 0]}>
        {/* Pump Housing */}
        <mesh>
          <cylinderGeometry args={[0.22, 0.22, 1.2, 24]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Rotating Impeller Motor Visual */}
        <group ref={motorRef} position={[0, 0, 0]}>
          <mesh rotation={[0, 0, 0]}>
            <boxGeometry args={[0.3, 0.1, 0.3]} />
            <meshStandardMaterial color="#E9A23B" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>

        {/* Intake Strainer Mesh */}
        <mesh position={[0, -0.65, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.3, 16]} />
          <meshStandardMaterial color="#0f172a" wireframe />
        </mesh>
      </group>

      {/* Sensor Probe & Cable */}
      <group position={[-0.15, 0, 0]}>
        {/* Cable */}
        <mesh position={[0, -2.5, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 8.8, 8]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.5} />
        </mesh>
        {/* Hydrostatic Pressure Transducer Sensor Body */}
        <mesh position={[0, -6.8, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.45, 16]} />
          <meshStandardMaterial color="#10b981" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
}

// Underground Cross-Section with Geological Strata
function GeologicalCrossSection({
  waterDepth,
  showLayers,
  onHover,
}: {
  waterDepth: number;
  showLayers: boolean;
  onHover: (name: string | null) => void;
}) {
  // Convert real water depth (e.g. 12m to 20m) into 3D y coordinate (-0.8 to -5.5)
  // Depth increases downward: depth=12m -> y=-2.0; depth=18m -> y=-4.5
  const waterTableY = -0.5 - (waterDepth - 10) * 0.35;
  const waterColumnHeight = Math.max(0.5, 8.0 - Math.abs(waterTableY));

  return (
    <group>
      {/* 1. Ground Surface (Lawn & Pavement) */}
      <mesh
        position={[0, 1.0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={() => onHover("Ground Surface Reference (Depth = 0.0m)")}
        onPointerOut={() => onHover(null)}
      >
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.8} />
      </mesh>

      {/* Surface Building (Residential Villa representation) */}
      <group position={[-4, 1.7, -1]}>
        <mesh>
          <boxGeometry args={[2.5, 1.4, 2.0]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
        {/* Roof */}
        <mesh position={[0, 1.0, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[2.2, 0.8, 4]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.6} />
        </mesh>
      </group>

      {/* Surface Borewell Wellhead Structure */}
      <group position={[0, 1.25, 0]}>
        <mesh
          onPointerOver={() => onHover("Wellhead Collar & Flow Meter")}
          onPointerOut={() => onHover(null)}
        >
          <cylinderGeometry args={[0.5, 0.55, 0.5, 24]} />
          <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Control Box */}
        <mesh position={[0.7, 0.2, 0]}>
          <boxGeometry args={[0.35, 0.5, 0.25]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
      </group>

      {/* Ground Level Zero Reference Line */}
      <group position={[-6.2, 1.0, 0]}>
        <mesh>
          <boxGeometry args={[0.1, 0.04, 0.1]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <Text position={[-0.8, 0, 0]} fontSize={0.25} color="#ef4444" anchorX="right">
          0.0m Ground Ref
        </Text>
      </group>

      {/* 2. Underground Geological Layers */}
      {showLayers && (
        <group position={[0, -3.5, -0.6]}>
          {/* Layer 1: Topsoil / Humus (0 to -1.5 in y) */}
          <mesh
            position={[0, 3.8, 0]}
            onPointerOver={() => onHover("Layer 1: Humus & Organic Topsoil (0m - 4m)")}
            onPointerOut={() => onHover(null)}
          >
            <boxGeometry args={[13.8, 1.4, 3.0]} />
            <meshStandardMaterial color="#4a2e18" roughness={0.9} />
          </mesh>

          {/* Layer 2: Clay Impermeable Strata (-1.5 to -3.2 in y) */}
          <mesh
            position={[0, 2.3, 0]}
            onPointerOver={() => onHover("Layer 2: Dense Silty Clay Strata (4m - 12m)")}
            onPointerOut={() => onHover(null)}
          >
            <boxGeometry args={[13.8, 1.6, 3.0]} />
            <meshStandardMaterial color="#854d0e" roughness={0.8} />
          </mesh>

          {/* Layer 3: Porous Sand & Gravel Layer */}
          <mesh
            position={[0, 0.6, 0]}
            onPointerOver={() => onHover("Layer 3: Semi-Confined Sand & Silt (12m - 24m)")}
            onPointerOut={() => onHover(null)}
          >
            <boxGeometry args={[13.8, 1.8, 3.0]} />
            <meshStandardMaterial color="#b45309" roughness={0.8} />
          </mesh>

          {/* Layer 4: Hard Fractured Bedrock */}
          <mesh
            position={[0, -1.3, 0]}
            onPointerOver={() => onHover("Layer 4: Weathered Granite Bedrock (24m - 40m)")}
            onPointerOut={() => onHover(null)}
          >
            <boxGeometry args={[13.8, 2.0, 3.0]} />
            <meshStandardMaterial color="#334155" roughness={0.9} />
          </mesh>

          {/* Layer 5: Deep Saturated Aquifer Zone */}
          <mesh
            position={[0, -3.3, 0]}
            onPointerOver={() => onHover("Layer 5: Deep Confined Fractured Aquifer (>40m)")}
            onPointerOut={() => onHover(null)}
          >
            <boxGeometry args={[13.8, 2.0, 3.0]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
        </group>
      )}

      {/* 3. Borewell Vertical Cylindrical Casing Pipe */}
      <mesh
        position={[0, -3.6, 0]}
        onPointerOver={() => onHover("Slotted Steel Borewell Casing (Dia 165mm)")}
        onPointerOut={() => onHover(null)}
      >
        <cylinderGeometry args={[0.38, 0.38, 9.2, 32, 1, true]} />
        <meshStandardMaterial
          color="#94a3b8"
          metalness={0.6}
          roughness={0.3}
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 4. Water Column Inside the Borewell */}
      {/* Positioned from waterTableY down to bottom (-8.0) */}
      <mesh
        position={[0, waterTableY - waterColumnHeight / 2, 0]}
        onPointerOver={() => onHover(`Borewell Water Column: ${waterColumnHeight.toFixed(1)}m`)}
        onPointerOut={() => onHover(null)}
      >
        <cylinderGeometry args={[0.35, 0.35, waterColumnHeight, 32]} />
        <meshStandardMaterial
          color="#0284c7"
          transparent
          opacity={0.7}
          roughness={0.1}
        />
      </mesh>

      {/* 5. Animated Groundwater Table Plane (Cone of Depression) */}
      <group position={[0, waterTableY, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[13.5, 2.8]} />
          <meshStandardMaterial
            color="#38bdf8"
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Dynamic Water Table Marker & Measurement Indicator */}
        <group position={[-5.8, 0, 0.2]}>
          <mesh>
            <boxGeometry args={[0.6, 0.05, 0.1]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          <Text
            position={[-0.8, 0, 0]}
            fontSize={0.24}
            color="#0284c7"
            anchorX="right"
          >
            {`Water Table: -${waterDepth.toFixed(1)}m`}
          </Text>
        </group>
      </group>
    </group>
  );
}

export function BorewellScene({
  isPumping,
  waterDepth,
  waterColumn,
  totalExtracted,
  pumpingRate,
  showLayers,
  onHoverComponent,
}: BorewellSceneProps) {
  const controlsRef = useRef<any>(null);

  return (
    <div className="relative w-full h-[520px] rounded-xl overflow-hidden bg-gradient-to-b from-sky-100 via-slate-100 to-slate-200 border border-slate-200 shadow-inner">
      <Canvas
        camera={{ position: [0, 1.5, 11], fov: 48 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 20, 15]} intensity={1.2} castShadow />
        <pointLight position={[-10, -5, -5]} intensity={0.4} />

        {/* Geological Strata & Borewell */}
        <GeologicalCrossSection
          waterDepth={waterDepth}
          showLayers={showLayers}
          onHover={onHoverComponent}
        />

        {/* Pump Assembly & Flow Particles */}
        <PumpAssembly isPumping={isPumping} waterDepth={waterDepth} />

        {/* Orbit Camera Controls */}
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2 + 0.15} // don't go too far under bottom
          minDistance={4}
          maxDistance={18}
          target={[0, -2.5, 0]}
        />
      </Canvas>

      {/* Camera Reset Button overlay */}
      <div className="absolute bottom-4 right-4 z-20 flex gap-2">
        <button
          onClick={() => {
            if (controlsRef.current) {
              controlsRef.current.reset();
            }
          }}
          className="px-2.5 py-1.5 rounded-lg bg-navy-900/80 hover:bg-navy-900 text-white text-[11px] font-semibold backdrop-blur shadow-md transition-colors"
        >
          Reset Camera
        </button>
      </div>
    </div>
  );
}

