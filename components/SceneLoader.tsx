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

/** Fixed full-screen 3D backdrop. If WebGL isn't available, the page still works as plain HTML. */
export default function SceneLoader() {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(hasWebGL()), []);
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
