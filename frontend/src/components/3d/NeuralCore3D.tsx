import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface NeuralCore3DProps {
  quantumCoherence: number;
  isOverclocked: boolean;
  isAnomaly: boolean;
  activeAgentsCount: number;
}

export const NeuralCore3D: React.FC<NeuralCore3DProps> = ({
  quantumCoherence,
  isOverclocked,
  isAnomaly,
  activeAgentsCount,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Neural Node Swarm (Particles)
    const particleCount = 220;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const nodeCoords: THREE.Vector3[] = [];

    // Distribute particles in a spherical-ellipsoid neural cloud
    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 6.8;

      const sinPhi = Math.sin(phi);
      const x = r * sinPhi * Math.cos(theta);
      const y = r * sinPhi * Math.sin(theta) * 0.85; // Slight brain hemisphere squish
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      nodeCoords.push(new THREE.Vector3(x, y, z));

      // Initial color (cyan neon)
      colors[i * 3] = 0.0;
      colors[i * 3 + 1] = 0.95;
      colors[i * 3 + 2] = 1.0;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.28,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Synaptic Connection Lines
    const lineIndices: number[] = [];
    const maxDistance = 3.2;

    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        if (nodeCoords[i].distanceTo(nodeCoords[j]) < maxDistance) {
          lineIndices.push(i, j);
        }
      }
    }

    const linesGeometry = new THREE.BufferGeometry();
    linesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    linesGeometry.setIndex(lineIndices);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
    });

    const lineSegments = new THREE.LineSegments(linesGeometry, lineMaterial);
    scene.add(lineSegments);

    // Outer Holographic Orbital Rings
    const ringGeometry = new THREE.TorusGeometry(8.5, 0.03, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x7928ca,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      wireframe: true,
    });

    const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(10.2, 0.02, 16, 100), ringMaterial.clone());
    ring2.rotation.x = Math.PI / 2.8;

    scene.add(ring1);
    scene.add(ring2);

    // Dynamic Central Core Sphere
    const coreSphereGeo = new THREE.IcosahedronGeometry(2.2, 2);
    const coreSphereMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const coreSphere = new THREE.Mesh(coreSphereGeo, coreSphereMat);
    scene.add(coreSphere);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = currentMount.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
      mouseY = -((e.clientY - rect.top) / height - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const speedMultiplier = isOverclocked ? 2.2 : 1.0;

      // Rotate neural cloud
      particles.rotation.y = elapsedTime * 0.12 * speedMultiplier + mouseX * 0.4;
      particles.rotation.x = elapsedTime * 0.06 * speedMultiplier + mouseY * 0.2;
      lineSegments.rotation.copy(particles.rotation);

      // Rotate orbital rings
      ring1.rotation.z = elapsedTime * 0.25;
      ring1.rotation.y = elapsedTime * 0.15;
      ring2.rotation.y = -elapsedTime * 0.2;
      ring2.rotation.x = Math.PI / 3 + Math.sin(elapsedTime * 0.5) * 0.15;

      // Pulse central core
      const pulse = 1 + Math.sin(elapsedTime * 3.5 * speedMultiplier) * 0.08;
      coreSphere.scale.set(pulse, pulse, pulse);
      coreSphere.rotation.y = -elapsedTime * 0.4;

      // Dynamic color reaction to anomaly / coherence
      if (isAnomaly) {
        lineMaterial.color.setHex(0xff3366); // Alert Crimson
        particleMaterial.opacity = 0.95;
        lineMaterial.opacity = 0.35;
        coreSphereMat.color.setHex(0xffaa00);
      } else if (isOverclocked) {
        lineMaterial.color.setHex(0x9d4edd); // Violet Overclock
        lineMaterial.opacity = 0.28;
        coreSphereMat.color.setHex(0x00f3ff);
      } else {
        lineMaterial.color.setHex(0x00f3ff); // Standard Cyan
        lineMaterial.opacity = 0.18;
        coreSphereMat.color.setHex(0x00ff88);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!currentMount) return;
      const newW = currentMount.clientWidth;
      const newH = currentMount.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      particleGeometry.dispose();
      linesGeometry.dispose();
      ringGeometry.dispose();
      coreSphereGeo.dispose();
    };
  }, [isAnomaly, isOverclocked, quantumCoherence, activeAgentsCount]);

  return (
    <div className="relative w-full h-full min-h-[380px] flex items-center justify-center overflow-hidden rounded-xl border border-synapse-border bg-synapse-card/40 backdrop-blur-md shadow-cyber">
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Cyberpunk HUD Overlay Annotations */}
      <div className="absolute top-3 left-4 flex flex-col gap-1 pointer-events-none z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full animate-ping bg-synapse-cyan" />
          <span className="text-[10px] font-mono tracking-widest text-synapse-cyan uppercase">
            3D HOLOGRAPHIC SYNAPSE MESH // VER 2.4
          </span>
        </div>
        <span className="text-xs font-mono text-gray-400">
          NODES: 220 | SUBSPACE TENSORS: ACTIVE
        </span>
      </div>

      <div className="absolute bottom-3 right-4 flex items-center gap-4 pointer-events-none z-10 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-gray-300">
          <span className="text-synapse-cyan">GHZ:</span>
          <span>{isOverclocked ? '8.44 GHz (TURBO)' : '3.82 GHz'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-synapse-emerald">STABILITY:</span>
          <span className={isAnomaly ? 'text-synapse-danger font-bold animate-pulse' : 'text-synapse-emerald'}>
            {quantumCoherence.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};
