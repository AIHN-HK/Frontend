/**
 * Particles WebGL engine adapted from React Bits by David Haz.
 * Source: https://github.com/DavidHDev/react-bits
 * License: MIT + Commons Clause (see public/licenses/react-bits.txt)
 * AIHN: stripped React, no-dep, reduced-motion safe, ambient preset only.
 */
import type { ParticlesOptions } from './particles-engine.types';

const MAX_COUNT = 10000;
const MAX_BURSTS = 4;
const DEPTH = 10;
const FOCAL = 1 / Math.tan((7.5 * Math.PI) / 180);
const NEAR = 0.1;
const FAR = 100;
const INTRO_SECONDS = 1.8;
const BURST_SECONDS = 1.5;
const BURST_SPEED = 520;
const BURST_WIDTH = 46;

const PARTICLE_VERTEX = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aCorner;
layout(location = 1) in vec3 aPosition;
layout(location = 2) in vec4 aRandom;
layout(location = 3) in vec3 aColor;
uniform mat3 uRotation;
uniform vec3 uOffset;
uniform float uSpread;
uniform float uTime;
uniform float uCamera;
uniform float uAspect;
uniform vec2 uView;
uniform float uRatio;
uniform float uSize;
uniform float uRandomness;
uniform float uBlur;
uniform float uFocus;
uniform float uGlow;
uniform float uTwinkle;
uniform int uShape;
uniform int uDrift;
uniform float uTravel;
uniform vec4 uPointer;
uniform int uEffect;
uniform float uStrength;
uniform vec4 uBursts[${MAX_BURSTS}];
uniform int uBurstCount;
uniform float uReveal;
out vec2 vLocal;
out float vRadius;
out float vBlur;
out float vAlpha;
out float vHalo;
out float vSeed;
out vec3 vColor;

vec3 bob(vec4 r, float t) {
  return vec3(
    sin(t * r.z + 6.28 * r.w) * mix(0.1, 1.5, r.x),
    sin(t * r.y + 6.28 * r.x) * mix(0.1, 1.5, r.w),
    sin(t * r.w + 6.28 * r.y) * mix(0.1, 1.5, r.z)
  );
}

void main() {
  vec3 pos = aPosition * uSpread;
  pos.z *= ${DEPTH.toFixed(1)};
  vec3 wobble = bob(aRandom, uTime);
  vec3 world = uRotation * pos + uOffset + wobble;
  vec3 view = world - vec3(0.0, 0.0, uCamera);
  float ahead = -view.z;
  if (ahead < ${NEAR.toFixed(2)} || ahead > ${FAR.toFixed(1)}) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    return;
  }
  float edge = smoothstep(1.0, 4.0, ahead);
  vec2 ndc = vec2(view.x * ${FOCAL.toFixed(6)} / uAspect, view.y * ${FOCAL.toFixed(6)}) / ahead;
  vec2 screen = (ndc * 0.5 + 0.5) * uView;
  vec2 shift = vec2(0.0);
  float flash = 0.0;
  for (int i = 0; i < ${MAX_BURSTS}; i++) {
    if (i >= uBurstCount) break;
    vec4 burst = uBursts[i];
    vec2 delta = screen - burst.xy;
    float reach = length(delta);
    float wave = exp(-pow((reach - burst.z * ${BURST_SPEED.toFixed(1)}) / ${BURST_WIDTH.toFixed(1)}, 2.0));
    vec2 away = reach > 0.001 ? delta / reach : vec2(0.0);
    float fade = (1.0 - burst.z) * (1.0 - burst.z) * burst.w;
    shift += away * wave * fade * 56.0 * smoothstep(0.0, 30.0, reach);
    flash += wave * fade;
  }
  screen += shift;
  float diameter = uSize * (1.0 + uRandomness * (aRandom.x - 0.5)) / max(ahead, 1.0) * (1.0 + min(flash, 1.0) * 0.6);
  float device = diameter * uRatio;
  float radius = max(diameter, 1.0 / uRatio) * 0.5;
  float coverage = min(1.0, device * device);
  float blur = uBlur * max(uFocus - ahead, 0.0) / max(ahead, 1.0);
  float halo = uGlow > 0.0 ? radius * 2.5 + 2.0 : 0.0;
  float extent = radius + blur + halo + 1.5;
  float twinkle = 1.0 - uTwinkle * 0.6 * (0.5 + 0.5 * sin(uTime * (6.0 + aRandom.y * 14.0) + aRandom.w * 40.0));
  float far = smoothstep(${FAR.toFixed(1)}, ${(FAR * 0.9).toFixed(1)}, ahead);
  float focus = radius / (radius + blur);
  float reveal = clamp(uReveal * 1.6 - aRandom.z * 0.6, 0.0, 1.0);
  vLocal = aCorner * extent;
  vRadius = radius;
  vBlur = blur;
  vHalo = halo;
  vSeed = aRandom.y;
  vAlpha = min(1.0, coverage * twinkle * (1.0 + flash * 1.4)) * far * edge * max(focus, 0.35) * reveal * reveal;
  vColor = aColor;
  gl_Position = vec4((screen + aCorner * extent) / uView * 2.0 - 1.0, 0.0, 1.0);
}`;

const PARTICLE_FRAGMENT = `#version 300 es
precision highp float;
uniform int uShape;
uniform float uGlow;
uniform float uRatio;
uniform float uTime;
uniform float uSoft;
uniform float uShimmer;
uniform float uOpacity;
in vec2 vLocal;
in float vRadius;
in float vBlur;
in float vAlpha;
in float vHalo;
in float vSeed;
in vec3 vColor;
out vec4 outColor;

void main() {
  float soft = vBlur + 0.7 / uRatio + vRadius * uSoft;
  float d = length(vLocal);
  float shape = 1.0 - smoothstep(vRadius - soft, vRadius + soft, d);
  float halo = vHalo > 0.0 ? exp(-d / (vHalo * 0.35)) * uGlow * 0.4 : 0.0;
  float alpha = clamp(shape + halo * (1.0 - shape), 0.0, 1.0) * vAlpha * uOpacity;
  if (alpha < 0.002) discard;
  vec2 uv = vLocal / max(vRadius * 2.0, 0.0001) + 0.5;
  vec3 color = clamp(vColor + uShimmer * 0.2 * sin(uv.yxx + uTime + vSeed * 6.28), 0.0, 1.0);
  outColor = vec4(color * alpha, alpha);
}`;

const clampN = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

function linkProgram(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const v = compile(gl, gl.VERTEX_SHADER, vs);
  const f = compile(gl, gl.FRAGMENT_SHADER, fs);
  const p = gl.createProgram();
  if (!v || !f || !p) {
    if (v) gl.deleteShader(v);
    if (f) gl.deleteShader(f);
    if (p) gl.deleteProgram(p);
    return null;
  }
  gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
  gl.deleteShader(v); gl.deleteShader(f);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { gl.deleteProgram(p); return null; }
  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  const count = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(p, i);
    if (info) uniforms[info.name.replace('[0]', '')] = gl.getUniformLocation(p, info.name);
  }
  return { program: p, uniforms };
}

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function parseColor(value: string): [number, number, number] {
  const probe = document.createElement('canvas').getContext('2d');
  if (!probe) return [1, 1, 1];
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = '#fff';
  probe.fillStyle = value;
  probe.fillRect(0, 0, 1, 1);
  const px = probe.getImageData(0, 0, 1, 1).data;
  return [(px[0] ?? 0) / 255, (px[1] ?? 0) / 255, (px[2] ?? 0) / 255];
}

export function createParticlesEngine(
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  options: ParticlesOptions,
): (() => void) | undefined {
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
  if (!gl) return undefined;

  const dots = linkProgram(gl, PARTICLE_VERTEX, PARTICLE_FRAGMENT);
  if (!dots) { gl.getExtension('WEBGL_lose_context')?.loseContext(); return undefined; }

  const corners = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, corners);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  const positionBuffer = gl.createBuffer();
  const randomBuffer = gl.createBuffer();
  const colorBuffer = gl.createBuffer();
  const dotVao = gl.createVertexArray();
  gl.bindVertexArray(dotVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, corners);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const attach = (buf: WebGLBuffer | null, loc: number, width: number) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, width, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(loc, 1);
  };
  attach(positionBuffer, 1, 3);
  attach(randomBuffer, 2, 4);
  attach(colorBuffer, 3, 3);
  gl.bindVertexArray(null);

  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const count = clampN(options.count, 1, MAX_COUNT);
  const swatches = options.colors.map(parseColor);
  const next = seeded(42);
  const positions = new Float32Array(count * 3);
  const randoms = new Float32Array(count * 4);
  const tints = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    let x: number, y: number, z: number, len: number;
    do { x = next() * 2 - 1; y = next() * 2 - 1; z = next() * 2 - 1; len = x * x + y * y + z * z; } while (len > 1 || len === 0);
    const r = Math.cbrt(next());
    positions.set([x * r, y * r, z * r], i * 3);
    randoms.set([next(), next(), next(), next()], i * 4);
    tints.set(swatches[Math.floor(next() * swatches.length)] ?? [1, 1, 1], i * 3);
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, randomBuffer);   gl.bufferData(gl.ARRAY_BUFFER, randoms, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);    gl.bufferData(gl.ARRAY_BUFFER, tints, gl.STATIC_DRAW);

  const view = { width: 1, height: 1, ratio: 1 };
  type Burst = { x: number; y: number; age: number };
  const bursts: Burst[] = [];
  const pointer = { x: 0, y: 0, sx: 0, sy: 0, nx: 0, ny: 0, inside: false, active: 0 };
  const state = { clock: 0, spin: 0, reveal: reduce ? 1 : 0, offsetX: 0, offsetY: 0 };
  const packedBursts = new Float32Array(MAX_BURSTS * 4);
  let raf = 0, last = 0, visible = true;

  const locate = (event: PointerEvent) => {
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const wasInside = pointer.inside;
    pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
    pointer.x = x;
    pointer.y = rect.height - y;
    pointer.nx = (x / Math.max(1, rect.width)) * 2 - 1;
    pointer.ny = -((y / Math.max(1, rect.height)) * 2 - 1);
    if (pointer.inside && !wasInside) {
      pointer.sx = pointer.x;
      pointer.sy = pointer.y;
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    locate(event);
    wake();
  };

  const onPointerDown = (event: PointerEvent) => {
    locate(event);
    if (!pointer.inside || reduce || options.clickBurst === false) return;
    bursts.push({ x: pointer.x, y: pointer.y, age: 0 });
    if (bursts.length > MAX_BURSTS) bursts.shift();
    wake();
  };

  const onPointerLeave = () => {
    pointer.inside = false;
  };

  const rotationOf = () => {
    const elapsed = state.clock * 1000;
    const x = Math.sin(elapsed * 0.0002) * 0.1;
    const y = Math.cos(elapsed * 0.0005) * 0.15;
    const z = state.spin;
    const [sx, cx, sy, cy, sz, cz] = [Math.sin(x), Math.cos(x), Math.sin(y), Math.cos(y), Math.sin(z), Math.cos(z)];
    return [cy*cz+sy*sx*sz, cx*sz, -sy*cz+cy*sx*sz, -cy*sz+sy*sx*cz, cx*cz, sy*sz+cy*sx*cz, sy*cx, -sx, cy*cx];
  };

  const render = () => {
    const matrix = rotationOf();
    const camera = options.spread + 10;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const raw = dots.uniforms;
    const u = (k: string): WebGLUniformLocation | null => raw[k] ?? null;

    let burstCount = 0;
    for (let i = bursts.length - 1; i >= 0 && burstCount < MAX_BURSTS; i--) {
      packedBursts.set([bursts[i]!.x, bursts[i]!.y, bursts[i]!.age / BURST_SECONDS, 1], burstCount * 4);
      burstCount++;
    }
    const effectMode = options.hoverEffect === 'parallax' ? 0 : options.hoverEffect === 'attract' ? 2 : 1;

    gl.useProgram(dots.program);
    gl.bindVertexArray(dotVao);
    gl.uniformMatrix3fv(u('uRotation'), false, matrix);
    gl.uniform3f(u('uOffset'), state.offsetX, state.offsetY, 0);
    gl.uniform1f(u('uSpread'), options.spread);
    gl.uniform1f(u('uTime'), state.clock);
    gl.uniform1f(u('uCamera'), camera);
    gl.uniform1f(u('uAspect'), view.width / view.height);
    gl.uniform2f(u('uView'), view.width, view.height);
    gl.uniform1f(u('uRatio'), view.ratio);
    gl.uniform1f(u('uSize'), options.size);
    gl.uniform1f(u('uRandomness'), 1.0);
    gl.uniform1f(u('uBlur'), 0);
    gl.uniform1f(u('uFocus'), camera + 14);
    gl.uniform1f(u('uGlow'), options.glow);
    gl.uniform1f(u('uTwinkle'), options.twinkle);
    gl.uniform1i(u('uShape'), 0);
    gl.uniform1i(u('uDrift'), 0);
    gl.uniform1f(u('uTravel'), 0);
    gl.uniform4f(u('uPointer'), pointer.sx, pointer.sy, pointer.active, options.hoverRadius ?? 160);
    gl.uniform1i(u('uEffect'), effectMode);
    gl.uniform1f(u('uStrength'), options.hoverFactor ?? 1.2);
    gl.uniform4fv(u('uBursts'), packedBursts);
    gl.uniform1i(u('uBurstCount'), burstCount);
    gl.uniform1f(u('uReveal'), state.reveal);
    gl.uniform1f(u('uSoft'), 0);
    gl.uniform1f(u('uShimmer'), 1);
    gl.uniform1f(u('uOpacity'), options.opacity);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);
    gl.bindVertexArray(null);
  };

  const frame = (now: number) => {
    raf = 0;
    if (!visible || document.hidden) return;
    const dt = last ? clampN((now - last) / 1000, 0.0005, 0.05) : 1 / 60;
    last = now;
    const pace = dt * options.speed * (reduce ? 0 : 1);
    state.clock += pace;
    state.spin += pace * 0.6;
    if (!reduce && state.reveal < 1) state.reveal = Math.min(1, state.reveal + dt / INTRO_SECONDS);

    const engaged = pointer.inside && !reduce;
    const follow = 1 - Math.exp(-dt / 0.35);
    const parallax = engaged && options.hoverEffect === 'parallax' ? (options.hoverFactor ?? 1) : 0;
    state.offsetX += (-pointer.nx * parallax - state.offsetX) * follow;
    state.offsetY += (-pointer.ny * parallax - state.offsetY) * follow;
    pointer.sx += (pointer.x - pointer.sx) * (1 - Math.exp(-dt / 0.06));
    pointer.sy += (pointer.y - pointer.sy) * (1 - Math.exp(-dt / 0.06));
    pointer.active += ((engaged ? 1 : 0) - pointer.active) * (1 - Math.exp(-dt / 0.2));

    for (let i = bursts.length - 1; i >= 0; i--) {
      bursts[i]!.age += dt;
      if (bursts[i]!.age >= BURST_SECONDS) bursts.splice(i, 1);
    }

    render();
    raf = requestAnimationFrame(frame);
  };

  const wake = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); };

  const resize = () => {
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    view.width = w; view.height = h;
    canvas.width = Math.max(1, Math.round(w * ratio));
    canvas.height = Math.max(1, Math.round(h * ratio));
    view.ratio = canvas.width / w;
    render(); wake();
  };

  const onVisibility = () => { last = 0; wake(); };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  const intersection = new IntersectionObserver(entries => {
    visible = entries.some(e => e.isIntersecting);
    if (visible) { last = 0; wake(); }
  });
  intersection.observe(container);
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerdown', onPointerDown, { passive: true });
  document.documentElement.addEventListener('pointerleave', onPointerLeave);
  resize();

  return () => {
    cancelAnimationFrame(raf);
    resizeObserver.disconnect();
    intersection.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerdown', onPointerDown);
    document.documentElement.removeEventListener('pointerleave', onPointerLeave);
    gl.deleteProgram(dots.program);
    [corners, positionBuffer, randomBuffer, colorBuffer].forEach(b => gl.deleteBuffer(b));
    gl.deleteVertexArray(dotVao);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}
