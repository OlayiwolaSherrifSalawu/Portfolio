"use client";

import { useEffect, useRef } from "react";

/**
 * Graph paper drawn in a WebGL2 shader. Around the pointer the paper bends like liquid glass:
 * a fading trail of points pushes and swirls the grid, with a specular highlight and slight
 * colour fringing. If WebGL2 is unavailable the canvas hides and the CSS grid behind it shows.
 */

const MAX_POINTS = 24;
const LIFE_MS = 1600;

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uDpr;
uniform vec3 uPts[${MAX_POINTS}];
uniform int uCount;
out vec4 outColor;

const vec3 PAPER = vec3(0.961, 0.945, 0.910);
const vec3 BLUE = vec3(0.141, 0.282, 0.784);

float gridLine(vec2 p) {
  float s = 28.0 * uDpr;
  vec2 g = mod(p, s);
  g = min(g, s - g);
  float d = min(g.x, g.y);
  return 1.0 - smoothstep(0.0, uDpr, d);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 disp = vec2(0.0);
  float h = 0.0;
  float sig = 92.0 * uDpr;
  for (int i = 0; i < ${MAX_POINTS}; i++) {
    if (i >= uCount) break;
    vec3 q = uPts[i];
    vec2 d = p - q.xy;
    float life = 1.0 - q.z;
    float w = life * life * exp(-dot(d, d) / (2.0 * sig * sig));
    vec2 n = d / (length(d) + 1e-3);
    disp += (n * 0.55 + vec2(-n.y, n.x) * 0.45) * w * 28.0 * uDpr;
    h += w;
  }
  h = clamp(h, 0.0, 1.5);

  // Chromatic fringe: each channel samples the grid with slightly different refraction.
  vec3 lines = vec3(gridLine(p - disp * 1.08), gridLine(p - disp), gridLine(p - disp * 0.92));
  vec3 col = mix(PAPER, BLUE, lines * 0.09 * (1.0 + h * 2.5));

  // Glass shading from the slope of the liquid surface.
  vec2 grad = vec2(dFdx(h), dFdy(h)) / uDpr;
  vec3 nrm = normalize(vec3(-grad * 70.0, 1.0));
  vec3 L = normalize(vec3(-0.5, 0.6, 0.8));
  float spec = pow(max(dot(reflect(-L, nrm), vec3(0.0, 0.0, 1.0)), 0.0), 24.0);
  float shade = dot(nrm, L) - L.z;
  float k = min(h * 2.0, 1.0);
  col += spec * 0.38 * k;
  col += shade * 0.12;
  col = mix(col, col * vec3(0.97, 0.985, 1.03), min(h, 1.0) * 0.5);

  outColor = vec4(col, 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
  return s;
}

export default function LiquidBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { preserveDrawingBuffer: true, antialias: false, alpha: false });
    if (!gl) {
      canvas.style.display = "none";
      return;
    }

    let prog: WebGLProgram;
    try {
      prog = gl.createProgram()!;
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
    } catch {
      canvas.style.display = "none";
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uDpr = gl.getUniformLocation(prog, "uDpr");
    const uPts = gl.getUniformLocation(prog, "uPts");
    const uCount = gl.getUniformLocation(prog, "uCount");
    const data = new Float32Array(MAX_POINTS * 3);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pts: { x: number; y: number; t: number }[] = [];
    let dpr = 1;
    let dirty = true;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      dirty = true;
    };

    const add = (x: number, y: number) => {
      if (reduced.matches) return;
      const last = pts[pts.length - 1];
      if (last && Math.hypot(x - last.x, y - last.y) < 5) return;
      pts.push({ x, y, t: performance.now() });
      if (pts.length > MAX_POINTS) pts.shift();
      dirty = true;
    };
    const onMove = (e: PointerEvent) => add(e.clientX, e.clientY);
    // The magnifying glass pokes the paper as it glides.
    const onPoke = (e: Event) => {
      const d = (e as CustomEvent<{ x: number; y: number }>).detail;
      if (d) add(d.x, d.y);
    };

    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const now = performance.now();
      while (pts.length && now - pts[0].t > LIFE_MS) pts.shift();
      if (!dirty && pts.length === 0) return;
      pts.forEach((p, i) => {
        data[i * 3] = p.x * dpr;
        data[i * 3 + 1] = p.y * dpr;
        data[i * 3 + 2] = (now - p.t) / LIFE_MS;
      });
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uDpr, dpr);
      gl.uniform3fv(uPts, data);
      gl.uniform1i(uCount, pts.length);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      dirty = pts.length > 0;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("liquid:poke", onPoke);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("liquid:poke", onPoke);
    };
  }, []);

  return <canvas ref={ref} className="liquid" aria-hidden />;
}
