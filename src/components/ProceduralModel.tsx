"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Stylised procedural placeholder for the six products that have no real frame
 * sequence yet (BUILD_BRIEF §2, §8.1). Deliberately abstract — a wireframe
 * massing study, not a pretend render of a product that does not exist.
 *
 * three.js survives only here; the hero is a 2D canvas blitting real frames.
 */
type Bar = { x: number; y: number; z: number; w: number; h: number; d: number };

/** Pure LCG — kept outside the component so nothing is mutated during render. */
function makeBars(seed: number): Bar[] {
  const bars: Bar[] = [];
  let state = (seed * 9301 + 49297) % 233280;
  const next = () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
  for (let i = 0; i < 7; i++) {
    bars.push({
      x: (next() - 0.5) * 2.6,
      y: (next() - 0.5) * 1.4,
      z: (next() - 0.5) * 1.6,
      w: 0.25 + next() * 1.5,
      h: 0.08 + next() * 0.3,
      d: 0.08 + next() * 0.4,
    });
  }
  return bars;
}

function Massing({ seed }: { seed: number }) {
  const group = useRef<THREE.Group>(null);

  // deterministic pseudo-random so each product keeps a stable silhouette
  const bars = useMemo(() => makeBars(seed), [seed]);

  useFrame((state, delta) => {
    if (!group.current) return;
    // slow and eased — never a spinning showreel
    group.current.rotation.y += delta * 0.12;
  });

  return (
    <group ref={group}>
      {bars.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z]}>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshBasicMaterial color="#2a323d" wireframe />
        </mesh>
      ))}
      <mesh>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color="#5a5852" wireframe />
      </mesh>
    </group>
  );
}

export default function ProceduralModel({
  seed,
  ariaLabel,
}: {
  seed: string;
  ariaLabel: string;
}) {
  const n = useMemo(() => parseInt(seed, 10) || 1, [seed]);

  return (
    <div className="absolute inset-0 bg-void" role="img" aria-label={ariaLabel}>
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0.6, 4.2], fov: 42 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false }}
          onCreated={({ gl }) => gl.setClearColor("#060606")}
        >
          <Massing seed={n} />
        </Canvas>
      </Suspense>
      <p className="pointer-events-none absolute bottom-5 left-0 right-0 text-center">
        <span className="t-label text-ink-faint">Placeholder model — assets pending</span>
      </p>
    </div>
  );
}
