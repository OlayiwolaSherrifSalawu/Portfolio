"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Lightformer, RoundedBox } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { projects, type Project } from "@/lib/content";
import { drawScreen } from "@/lib/screens";

const INK = "#16203a";
const SPACING = 9;

type Shared = { active: number; tops: number[]; fadeNear: number; fadeFar: number };

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
        ? { p: v(mx, 0.2, z + 7.2), t: v(mx, 0.2, z), fog: [8, 13] }
        : { p: v(0, 0.15, z + 5.2), t: v(0, 0, z), fog: [6, 11] },
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
  const { camera, pointer } = useThree();

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
    // Distance fade (used instead of fog, which would paint devices paper-coloured over the CSS grid).
    const near = THREE.MathUtils.lerp(keys[i].fog[0], keys[i + 1].fog[0], f);
    const far = THREE.MathUtils.lerp(keys[i].fog[1], keys[i + 1].fog[1], f);
    shared.fadeNear = THREE.MathUtils.damp(shared.fadeNear, near, lambda, d);
    shared.fadeFar = THREE.MathUtils.damp(shared.fadeFar, far, lambda, d);
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

const shell = { color: "#1d2541", metalness: 0.55, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.25 };

/** Soft radial blob used as a shadow on the "paper" under each device. Shared by all devices. */
let shadowTex: THREE.CanvasTexture | null = null;
function getShadowTexture() {
  if (shadowTex) return shadowTex;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  shadowTex = new THREE.CanvasTexture(c);
  return shadowTex;
}

function Screen({ w, h, y = 0, z, tex, index, shared }: { w: number; h: number; y?: number; z: number; tex: THREE.Texture | null; index: number; shared: Shared }) {
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((_, dt) => {
    if (!mat.current) return;
    const on = shared.active === index + 1 || shared.active === 0 || shared.active > projects.length;
    const goal = on ? 1 : 0.7;
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

  const root = useRef<THREE.Group>(null);
  const shadowMat = useRef<THREE.MeshBasicMaterial>(null);
  const { camera } = useThree();

  // Fade the whole device by its distance from the camera.
  useFrame(() => {
    const g = root.current;
    if (!g) return;
    const dist = camera.position.distanceTo(pos);
    const span = Math.max(shared.fadeFar - shared.fadeNear, 0.001);
    const alpha = 1 - THREE.MathUtils.smoothstep(dist, shared.fadeNear, shared.fadeNear + span);
    g.visible = alpha > 0.01;
    if (!g.visible) return;
    const fading = alpha < 0.995;
    g.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.Material | undefined;
      if (!m || m === shadowMat.current) return;
      if (m.transparent !== fading) {
        m.transparent = fading;
        m.needsUpdate = true;
      }
      m.opacity = alpha;
    });
    if (shadowMat.current) shadowMat.current.opacity = 0.16 * alpha;
  });

  const shadowW = (project.device === "phone" ? 1.5 : 2.8) * scale;
  const shadowY = pos.y - (project.device === "phone" ? 1.35 : 1.5) * scale;

  return (
    <group ref={root}>
    <mesh position={[pos.x, shadowY, pos.z]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
      <planeGeometry args={[shadowW, shadowW * 0.45]} />
      <meshBasicMaterial ref={shadowMat} map={getShadowTexture()} color={INK} transparent opacity={0.16} depthWrite={false} />
    </mesh>
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
              <meshPhysicalMaterial {...shell} color="#2b3352" metalness={0.4} roughness={0.55} clearcoat={0} />
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
    </group>
  );
}

export default function Scene() {
  const shared = useRef<Shared>({ active: 0, tops: [], fadeNear: 10, fadeFar: 42 }).current;
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

  return (
    <Canvas
      dpr={mobile ? [1, 1.5] : [1, 1.75]}
      camera={{ fov: 35, position: [0, 0.6, 9.5], near: 0.1, far: 120 }}
      className="r3f"
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
      aria-hidden
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={1.2} />
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={2} position={[0, 6, -10]} scale={[12, 6, 1]} />
        <Lightformer intensity={1.4} position={[-6, 1, 0]} rotation-y={Math.PI / 2} scale={[30, 0.4, 1]} />
        <Lightformer intensity={1.4} position={[6, 1, 0]} rotation-y={-Math.PI / 2} scale={[30, 0.4, 1]} />
        <Lightformer intensity={0.6} color="#ffd9a8" position={[0, -4, 4]} scale={[10, 2, 1]} />
      </Environment>
      <CameraRig shared={shared} mobile={mobile} reduced={reduced} />
      {projects.map((p, i) => (
        <Device key={p.id} project={p} index={i} shared={shared} mobile={mobile} reduced={reduced} />
      ))}
    </Canvas>
  );
}
