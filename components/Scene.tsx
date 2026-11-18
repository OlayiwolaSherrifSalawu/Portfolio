"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Lightformer, RoundedBox, Sparkles } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { projects, type Project } from "@/lib/content";
import { drawScreen } from "@/lib/screens";

const BG = "#0a0a0a";
const SPACING = 9;

type Shared = { active: number; tops: number[] };

/** Where each device sits. Text goes on the opposite side on desktop. */
function layout(i: number, mobile: boolean) {
  const side = i % 2 === 0 ? 1 : -1;
  const z = -i * SPACING;
  // Staggered left/right so the camera never flies through a device on its way to the next one.
  if (mobile) return { pos: new THREE.Vector3(side * 1.2, 1.15, z), rotY: 0, side };
  return { pos: new THREE.Vector3(side * 1.55, 0, z), rotY: -side * 0.28, side };
}

type Key = { p: THREE.Vector3; t: THREE.Vector3; fog: [number, number] };

function keyframes(mobile: boolean): Key[] {
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const last = -(projects.length - 1) * SPACING;
  const mid = last / 2;
  const wide: [number, number] = [8, 48];
  const k: Key[] = [];
  // Hero: looking down the line of floating devices, which sit to the right of the name.
  k.push(
    mobile
      ? { p: v(0, 0.6, 12), t: v(0, -1.6, -8), fog: [8, 40] }
      : { p: v(0, 0.6, 9.5), t: v(-3.4, 0, -8), fog: [8, 40] },
  );
  // One stop per project. Tight fog so only the device in focus reads clearly.
  projects.forEach((_, i) => {
    const z = -i * SPACING;
    const mx = layout(i, true).pos.x;
    k.push(
      mobile
        ? { p: v(mx, 0.2, z + 7.2), t: v(mx, 0.2, z), fog: [7.5, 16] }
        : { p: v(0, 0.15, z + 5.2), t: v(0, 0, z), fog: [5.5, 14] },
    );
  });
  // Stellar: from the side, the row of devices stretches across the right of the screen.
  k.push({ p: v(mobile ? 6 : 9, 3, mid + 4), t: v(mobile ? 0 : -2, 0.5, mid), fog: wide });
  // About: from above, aimed left of the row so devices sit right of the text.
  k.push({ p: v(2, 11, 9), t: v(mobile ? 0 : -4.5, 0, mid), fog: wide });
  // Contact: pull back to see everything at once.
  k.push({ p: v(0, 6, mobile ? 18 : 14), t: v(mobile ? 0 : -3.5, -1.5, mid), fog: wide });
  return k;
}

function CameraRig({ shared, mobile, reduced }: { shared: Shared; mobile: boolean; reduced: boolean }) {
  const keys = useMemo(() => keyframes(mobile), [mobile]);
  const goalP = useRef(new THREE.Vector3());
  const goalT = useRef(new THREE.Vector3());
  const look = useRef(keys[0].t.clone());
  const { camera, pointer, scene } = useThree();

  useFrame((_, dt) => {
    const tops = shared.tops;
    if (tops.length < keys.length) return;
    const y = window.scrollY;
    let i = 0;
    while (i < keys.length - 2 && y >= tops[i + 1]) i++;
    const span = tops[i + 1] - tops[i] || 1;
    let f = Math.min(Math.max((y - tops[i]) / span, 0), 1);
    shared.active = Math.round(i + f);
    f = f * f * (3 - 2 * f);
    goalP.current.lerpVectors(keys[i].p, keys[i + 1].p, f);
    goalT.current.lerpVectors(keys[i].t, keys[i + 1].t, f);
    if (!reduced) {
      goalP.current.x += pointer.x * 0.25;
      goalP.current.y += pointer.y * 0.15;
    }
    const d = Math.min(dt, 0.1);
    const lambda = reduced ? 30 : 3.5;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, goalP.current.x, lambda, d);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, goalP.current.y, lambda, d);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, goalP.current.z, lambda, d);
    look.current.x = THREE.MathUtils.damp(look.current.x, goalT.current.x, lambda, d);
    look.current.y = THREE.MathUtils.damp(look.current.y, goalT.current.y, lambda, d);
    look.current.z = THREE.MathUtils.damp(look.current.z, goalT.current.z, lambda, d);
    camera.lookAt(look.current);
    const fog = scene.fog as THREE.Fog | null;
    if (fog) {
      const near = THREE.MathUtils.lerp(keys[i].fog[0], keys[i + 1].fog[0], f);
      const far = THREE.MathUtils.lerp(keys[i].fog[1], keys[i + 1].fog[1], f);
      fog.near = THREE.MathUtils.damp(fog.near, near, lambda, d);
      fog.far = THREE.MathUtils.damp(fog.far, far, lambda, d);
    }
  });
  return null;
}

function useScreenTexture(project: Project) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let texture: THREE.Texture;
    let cancelled = false;
    if (project.screenshot) {
      texture = new THREE.TextureLoader().load(project.screenshot, () => !cancelled && setTex(texture));
    } else {
      const canvas = document.createElement("canvas");
      drawScreen(project.id, canvas, project.device);
      texture = new THREE.CanvasTexture(canvas);
      setTex(texture);
    }
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return () => {
      cancelled = true;
      texture.dispose();
    };
  }, [project]);
  return tex;
}

const shell = { color: "#1b1b1e", metalness: 0.75, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.2 };

function Screen({ w, h, y = 0, z, tex, index, shared }: { w: number; h: number; y?: number; z: number; tex: THREE.Texture | null; index: number; shared: Shared }) {
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((_, dt) => {
    if (!mat.current) return;
    const on = shared.active === index + 1 || shared.active === 0 || shared.active > projects.length;
    const goal = on ? 1 : 0.45;
    const c = mat.current.color;
    c.setScalar(THREE.MathUtils.damp(c.r, goal, 4, Math.min(dt, 0.05)));
  });
  return (
    <mesh position={[0, y, z]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial key={tex ? tex.uuid : "blank"} ref={mat} map={tex} toneMapped={false} color={tex ? "#ffffff" : "#111"} />
    </mesh>
  );
}

function Device({ project, index, shared, mobile, reduced }: { project: Project; index: number; shared: Shared; mobile: boolean; reduced: boolean }) {
  const tex = useScreenTexture(project);
  const { pos, rotY } = layout(index, mobile);
  const scale = { phone: mobile ? 0.68 : 1, laptop: mobile ? 0.5 : 0.72, monitor: mobile ? 0.55 : 0.85 }[project.device];

  const go = () => {
    const top = shared.tops[index + 1];
    if (top !== undefined) window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <Float position={pos} speed={reduced ? 0 : 1.3} rotationIntensity={reduced ? 0 : 0.25} floatIntensity={reduced ? 0 : 0.6}>
      <group
        rotation={[0, rotY, 0]}
        scale={scale}
        onClick={go}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        {project.device === "phone" && (
          <>
            <RoundedBox args={[0.98, 2, 0.09]} radius={0.04} smoothness={6}>
              <meshPhysicalMaterial {...shell} />
            </RoundedBox>
            <Screen w={0.9} h={1.92} z={0.047} tex={tex} index={index} shared={shared} />
            <RoundedBox args={[0.24, 0.055, 0.01]} radius={0.02} position={[0, 0.9, 0.05]}>
              <meshBasicMaterial color="#000" />
            </RoundedBox>
          </>
        )}
        {project.device === "laptop" && (
          <group rotation={[0.14, 0, 0]} position={[0, 0.15, 0]}>
            <group position={[0, -0.75, 0]} rotation={[-0.22, 0, 0]}>
              <RoundedBox args={[2.3, 1.5, 0.05]} radius={0.02} position={[0, 0.75, 0]}>
                <meshPhysicalMaterial {...shell} />
              </RoundedBox>
              <Screen w={2.16} h={1.36} y={0.75} z={0.028} tex={tex} index={index} shared={shared} />
            </group>
            <RoundedBox args={[2.3, 0.06, 1.5]} radius={0.02} position={[0, -0.78, 0.72]}>
              <meshPhysicalMaterial {...shell} color="#2a2a2e" metalness={0.5} roughness={0.6} clearcoat={0} />
            </RoundedBox>
          </group>
        )}
        {project.device === "monitor" && (
          <>
            <RoundedBox args={[2.42, 1.52, 0.06]} radius={0.02}>
              <meshPhysicalMaterial {...shell} />
            </RoundedBox>
            <Screen w={2.28} h={1.38} z={0.033} tex={tex} index={index} shared={shared} />
            <mesh position={[0, -1.05, -0.08]}>
              <boxGeometry args={[0.14, 0.6, 0.06]} />
              <meshPhysicalMaterial {...shell} />
            </mesh>
            <RoundedBox args={[0.9, 0.04, 0.5]} radius={0.015} position={[0, -1.36, 0]}>
              <meshPhysicalMaterial {...shell} />
            </RoundedBox>
          </>
        )}
      </group>
    </Float>
  );
}

export default function Scene() {
  const shared = useRef<Shared>({ active: 0, tops: [] }).current;
  const [mobile, setMobile] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const measure = () => {
      shared.tops = Array.from(document.querySelectorAll<HTMLElement>("[data-stop]")).map(
        (el) => el.getBoundingClientRect().top + window.scrollY,
      );
      setMobile(window.innerWidth < 768);
    };
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onMq = () => setReduced(mq.matches);
    mq.addEventListener("change", onMq);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      mq.removeEventListener("change", onMq);
    };
  }, [shared]);

  const mid = -((projects.length - 1) * SPACING) / 2;

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ fov: 35, position: [0, 0.6, 9.5], near: 0.1, far: 120 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      aria-hidden
    >
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 10, 42]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 5, 4]} intensity={1.2} />
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2} position={[0, 6, -10]} scale={[12, 6, 1]} />
        <Lightformer intensity={1.4} position={[-6, 1, 0]} rotation-y={Math.PI / 2} scale={[30, 0.4, 1]} />
        <Lightformer intensity={1.4} position={[6, 1, 0]} rotation-y={-Math.PI / 2} scale={[30, 0.4, 1]} />
        <Lightformer intensity={0.6} color="#ffd9a8" position={[0, -4, 4]} scale={[10, 2, 1]} />
      </Environment>
      <CameraRig shared={shared} mobile={mobile} reduced={reduced} />
      {projects.map((p, i) => (
        <Device key={p.id} project={p} index={i} shared={shared} mobile={mobile} reduced={reduced} />
      ))}
      <Sparkles
        count={mobile ? 80 : 160}
        scale={[14, 8, 44]}
        position={[0, 0, mid]}
        size={2}
        speed={reduced ? 0 : 0.25}
        opacity={0.35}
        color="#fcf9f3"
      />
    </Canvas>
  );
}
