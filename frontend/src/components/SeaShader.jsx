import { useEffect, useRef } from "react";

/**
 * SeaShader
 * ---------
 * Full-viewport fixed WebGL background that renders a painterly sea whose
 * mood is driven by a `scene` prop:
 *   - "home"    -> pre-dawn calm bay with gold horizon
 *   - "explore" -> open daylight sea, chart-room teal
 *   - "hunt"    -> stormy night, deep abyss
 *
 * The component:
 *   - Interpolates smoothly between scenes via an internal uScene uniform.
 *   - Respects prefers-reduced-motion (renders one still frame).
 *   - Pauses when document is hidden.
 *   - Falls back to a CSS gradient if WebGL isn't available.
 *   - Lives behind all content (zIndex: 0) and never blocks clicks.
 */

const SCENE_INDEX = { home: 0, explore: 1, hunt: 2 };

// Accepts a string key ("home"/"explore"/"hunt") OR a fractional number 0..2
// so the moment-of-day picker can drive the palette continuously.
function resolveScene(scene) {
  if (typeof scene === "number" && Number.isFinite(scene)) {
    return Math.max(0, Math.min(2, scene));
  }
  return SCENE_INDEX[scene] ?? 0;
}

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uScene;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f*f*(3.0 - 2.0*f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    s += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return s;
}

vec3 paletteTop(float s) {
  vec3 a = vec3(0.06, 0.14, 0.28);
  vec3 b = vec3(0.05, 0.22, 0.38);
  vec3 c = vec3(0.015, 0.03, 0.07);
  return s < 1.0 ? mix(a, b, s) : mix(b, c, s - 1.0);
}
vec3 paletteMid(float s) {
  vec3 a = vec3(0.52, 0.38, 0.26);
  vec3 b = vec3(0.30, 0.50, 0.58);
  vec3 c = vec3(0.06, 0.09, 0.16);
  return s < 1.0 ? mix(a, b, s) : mix(b, c, s - 1.0);
}
vec3 paletteBot(float s) {
  vec3 a = vec3(0.11, 0.19, 0.30);
  vec3 b = vec3(0.08, 0.28, 0.40);
  vec3 c = vec3(0.03, 0.05, 0.10);
  return s < 1.0 ? mix(a, b, s) : mix(b, c, s - 1.0);
}
vec3 accent(float s) {
  vec3 a = vec3(0.83, 0.66, 0.41);
  vec3 b = vec3(0.92, 0.79, 0.47);
  vec3 c = vec3(0.78, 0.35, 0.25);
  return s < 1.0 ? mix(a, b, s) : mix(b, c, s - 1.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  float aspect = uRes.x / max(uRes.y, 1.0);

  vec3 top = paletteTop(uScene);
  vec3 mid = paletteMid(uScene);
  vec3 bot = paletteBot(uScene);

  vec3 col = mix(top, mid, smoothstep(0.0, 0.55, uv.y));
  col = mix(col, bot, smoothstep(0.55, 1.0, uv.y));

  vec2 p = vec2(uv.x * aspect * 2.0, uv.y * 2.0);
  float t = uTime * 0.04;
  float n = fbm(p + vec2(t * 0.6, t * 0.2));
  float seaMask = smoothstep(0.35, 0.90, uv.y);
  col += (n - 0.5) * 0.16 * seaMask;

  float w1 = sin(uv.y * 14.0 + uTime * 0.30 + fbm(p * 0.55) * 4.0) * 0.5 + 0.5;
  float w2 = sin(uv.y * 26.0 - uTime * 0.45 + fbm(p * 1.10) * 3.0) * 0.5 + 0.5;
  float wave = smoothstep(0.42, 1.0, uv.y) * (w1 * 0.06 + w2 * 0.035);
  col += wave * vec3(0.18, 0.24, 0.32);

  vec2 sunPos = mix(vec2(0.72, 0.34), vec2(0.18, 0.26), step(1.5, uScene));
  sunPos = mix(sunPos, vec2(0.65, 0.30), clamp(uScene, 0.0, 1.0));
  float sunDist = length((uv - sunPos) * vec2(aspect, 1.0));
  float sun = exp(-sunDist * 6.5) * 0.55;
  col += accent(uScene) * sun * (1.0 - uScene * 0.30);

  float stormFlash = step(1.5, uScene) * smoothstep(0.0, 1.0, sin(uTime * 0.9 + fbm(p * 0.8) * 6.0)) * 0.12;
  col += stormFlash * vec3(0.9, 0.85, 0.95) * smoothstep(0.0, 0.5, uv.y);

  float sparkleZone = uv.y < 0.40 ? (uScene > 1.0 ? 1.0 : 0.35) : smoothstep(0.50, 1.0, uv.y) * 0.55;
  float starSeed = hash(floor(uv * vec2(220.0, 140.0) + vec2(uTime * 0.03, -uTime * 0.02)));
  float star = step(0.996, starSeed);
  col += star * 0.38 * sparkleZone;

  float vig = smoothstep(1.25, 0.30, distance(uv, vec2(0.5, 0.55)));
  col *= mix(0.72, 1.0, vig);

  // Gamma-ish polish
  col = pow(col, vec3(0.95));

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn("Shader compile error", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export function SeaShader({ scene = "home" }) {
  const canvasRef = useRef(null);
  const targetRef = useRef(resolveScene(scene));
  const currentRef = useRef(resolveScene(scene));
  const failedRef = useRef(false);

  // Update target when scene prop changes (smooth-interpolated inside RAF loop)
  useEffect(() => {
    targetRef.current = resolveScene(scene);
  }, [scene]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: "low-power" }) ||
      canvas.getContext("experimental-webgl");
    if (!gl) {
      failedRef.current = true;
      canvas.classList.add("sea-shader--fallback");
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) {
      failedRef.current = true;
      canvas.classList.add("sea-shader--fallback");
      return;
    }
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      failedRef.current = true;
      canvas.classList.add("sea-shader--fallback");
      return;
    }
    gl.useProgram(prog);

    // Fullscreen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uScene = gl.getUniformLocation(prog, "uScene");

    // DPR-aware sizing — cap at 1.5 to protect mid-range phones
    const DPR_CAP = Math.min(1.5, window.devicePixelRatio || 1);

    function resize() {
      const w = Math.floor(window.innerWidth * DPR_CAP);
      const h = Math.floor(window.innerHeight * DPR_CAP);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    }
    resize();
    window.addEventListener("resize", resize);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let start = performance.now();
    let paused = false;

    function frame(now) {
      // Smooth scene interpolation (spring-ish)
      const diff = targetRef.current - currentRef.current;
      currentRef.current += diff * 0.06;

      const t = (now - start) / 1000;
      gl.uniform1f(uTime, reduceMotion ? 0 : t);
      gl.uniform1f(uScene, currentRef.current);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!reduceMotion && !paused) {
        raf = requestAnimationFrame(frame);
      }
    }

    raf = requestAnimationFrame(frame);

    function onVis() {
      if (document.hidden) {
        paused = true;
        cancelAnimationFrame(raf);
      } else if (paused) {
        paused = false;
        start = performance.now() - (currentRef.current * 1000);
        raf = requestAnimationFrame(frame);
      }
    }
    document.addEventListener("visibilitychange", onVis);

    // Render one extra frame anytime scene changes (for reduced-motion users)
    let poke = null;
    if (reduceMotion) {
      poke = setInterval(() => requestAnimationFrame(frame), 200);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      if (poke) clearInterval(poke);
      gl.deleteBuffer(buf);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteProgram(prog);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="sea-shader"
      data-scene={scene}
      aria-hidden="true"
    />
  );
}

export default SeaShader;
