'use client';

/* eslint-disable react/no-unknown-property */
import * as THREE from 'three';
import { useRef, useState, useEffect, memo } from 'react';
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber';
import {
  useFBO,
  MeshTransmissionMaterial,
  Preload,
} from '@react-three/drei';
import { damp3 } from 'maath/easing';

type Mode = 'lens' | 'bar' | 'cube';

interface FluidGlassProps {
  mode?: Mode;
  lensProps?: Record<string, number | undefined>;
  barProps?: Record<string, number | undefined>;
  cubeProps?: Record<string, number | undefined>;
  scale?: number;
  ior?: number;
  thickness?: number;
  transmission?: number;
  roughness?: number;
  chromaticAberration?: number;
  anisotropy?: number;
  children?: React.ReactNode;
}

const ModeWrapper = memo(function ModeWrapper({
  children,
  geometry,
  followPointer = true,
  lockToBottom = false,
  modeProps = {},
  ...props
}: {
  children: React.ReactNode;
  geometry: THREE.BufferGeometry;
  followPointer?: boolean;
  lockToBottom?: boolean;
  modeProps?: Record<string, number | undefined>;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const buffer = useFBO();
  const { viewport: vp } = useThree();
  const [scene] = useState(() => new THREE.Scene());

  useFrame((state, delta) => {
    const { gl, viewport, pointer, camera } = state;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);

    const destX = followPointer ? (pointer.x * v.width) / 2 : 0;
    const destY = lockToBottom ? -v.height / 2 + 0.2 : followPointer ? (pointer.y * v.height) / 2 : 0;
    if (ref.current) {
      damp3(ref.current.position, [destX, destY, 15], 0.15, delta);
    }

    gl.setRenderTarget(buffer);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    gl.setClearColor(0x050508, 1);
  });

  const { scale = 0.25, ior = 1.15, thickness = 5, anisotropy = 0.01, chromaticAberration = 0.1, transmission = 1, roughness = 0, ...extraMat } = modeProps;

  return (
    <>
      {createPortal(children, scene)}
      <mesh scale={[vp.width, vp.height, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} transparent />
      </mesh>
      <mesh ref={ref} scale={scale} rotation-x={Math.PI / 2} geometry={geometry} {...props}>
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          ior={ior}
          thickness={thickness}
          anisotropy={anisotropy}
          chromaticAberration={chromaticAberration}
          transmission={transmission}
          roughness={roughness}
          {...extraMat}
        />
      </mesh>
    </>
  );
});

function Lens({ modeProps, geometry, children, ...p }: { modeProps: Record<string, number | undefined>; geometry: THREE.BufferGeometry; children?: React.ReactNode }) {
  return (
    <ModeWrapper geometry={geometry} followPointer modeProps={modeProps} {...p}>
      {children}
    </ModeWrapper>
  );
}

function Cube({ modeProps, geometry, children, ...p }: { modeProps: Record<string, number | undefined>; geometry: THREE.BufferGeometry; children?: React.ReactNode }) {
  return (
    <ModeWrapper geometry={geometry} followPointer modeProps={modeProps} {...p}>
      {children}
    </ModeWrapper>
  );
}

function Bar({ modeProps = {}, geometry, children, ...p }: { modeProps: Record<string, number | undefined>; geometry: THREE.BufferGeometry; children?: React.ReactNode }) {
  const defaultMat = {
    transmission: 1,
    roughness: 0,
    thickness: 10,
    ior: 1.15,
  };
  return (
    <ModeWrapper
      geometry={geometry}
      lockToBottom
      followPointer={false}
      modeProps={{ ...defaultMat, ...modeProps }}
      {...p}
    >
      {children}
    </ModeWrapper>
  );
}

export default function FluidGlass({
  mode = 'lens',
  lensProps = {},
  barProps = {},
  cubeProps = {},
  scale = 0.25,
  ior = 1.15,
  thickness = 2,
  transmission = 1,
  roughness = 0,
  chromaticAberration = 0.05,
  anisotropy = 0.01,
  children,
}: FluidGlassProps) {
  const lensGeometry = useRef(new THREE.CylinderGeometry(1, 1, 0.2, 32)).current;
  const boxGeometry = useRef(new THREE.BoxGeometry(1, 1, 1)).current;

  const rawOverrides = mode === 'bar' ? barProps : mode === 'cube' ? cubeProps : lensProps;
  const modeProps = {
    scale,
    ior,
    thickness,
    transmission,
    roughness,
    chromaticAberration,
    anisotropy,
    ...rawOverrides,
  };

  const Wrapper = mode === 'bar' ? Bar : mode === 'cube' ? Cube : Lens;
  const geometry = mode === 'lens' ? lensGeometry : boxGeometry;

  return (
    <Canvas camera={{ position: [0, 0, 20], fov: 15 }} gl={{ alpha: true }}>
      <Wrapper modeProps={modeProps} geometry={geometry}>
        {children ?? null}
      </Wrapper>
      <Preload />
    </Canvas>
  );
}
