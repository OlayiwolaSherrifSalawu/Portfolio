"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ReactNode } from "react";
import LiquidBackground from "./LiquidBackground";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Fixed full-screen 3D backdrop. three.js and its render loop are the heaviest part of the page,
 * so the scene starts on the visitor's first interaction (move, scroll, touch, key) and fades in.
 * The page is complete and usable before that. Without WebGL it stays plain HTML.
 */
export default function SceneLoader() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (!hasWebGL()) return;
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      cleanup();
      setOk(true);
    };
    const events = ["pointermove", "pointerdown", "scroll", "keydown", "touchstart", "wheel"] as const;
    events.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
    function cleanup() {
      events.forEach((e) => window.removeEventListener(e, go));
    }
    return cleanup;
  }, []);
  return (
    <div className="stage" aria-hidden>
      <LiquidBackground />
      {ok && (
        <Boundary>
          <Scene />
        </Boundary>
      )}
    </div>
  );
}
