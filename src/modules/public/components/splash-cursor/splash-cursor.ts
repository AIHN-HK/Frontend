/**
 * React Bits Splash Cursor by David Haz, adapted for AIHN's bounded homepage opening.
 * Source: https://github.com/DavidHDev/react-bits/tree/main/src/ts-default/Animations/SplashCursor
 * License: public/licenses/react-bits.txt (MIT + Commons Clause).
 * AIHN: low resolution, 30 fps, slow simulation, mouse-only scoped events, no bursts.
 */
type RGB = [number, number, number];

type Uniforms = Record<string, WebGLUniformLocation | null>;

interface Format {
  internal: number;
  format: number;
}

interface Target {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelX: number;
  texelY: number;
  attach: (unit: number) => number;
}

interface DoubleTarget {
  read: Target;
  write: Target;
  width: number;
  height: number;
  texelX: number;
  texelY: number;
  swap: () => void;
}

interface Pointer {
  x: number;
  y: number;
  px: number;
  py: number;
  ready: boolean;
  moved: boolean;
  offset: number;
}

const QUALITY = { low: { sim: 64, dye: 512, iterations: 10 } };

const VERTEX = `#version 300 es
precision highp float;
in vec2 aPosition;
uniform vec2 texelSize;
out vec2 vUv;
out vec2 vL;
out vec2 vR;
out vec2 vT;
out vec2 vB;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const HEADER = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 outColor;
`;

const SHADERS: Record<string, string> = {
  copy: `uniform sampler2D uTexture;
void main() {
  outColor = texture(uTexture, vUv);
}`,
  clear: `uniform sampler2D uTexture;
uniform float value;
void main() {
  outColor = value * texture(uTexture, vUv);
}`,
  splat: `uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 pointA;
uniform vec2 pointB;
uniform float radius;
void main() {
  vec2 scale = vec2(aspectRatio, 1.0);
  vec2 pa = (vUv - pointA) * scale;
  vec2 ba = (pointB - pointA) * scale;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-9), 0.0, 1.0);
  vec2 d = pa - ba * h;
  vec3 base = texture(uTarget, vUv).xyz;
  outColor = vec4(base + exp(-dot(d, d) / radius) * color, 1.0);
}`,
  advection: `uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;
void main() {
  vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize;
  outColor = texture(uSource, coord) / (1.0 + dissipation * dt);
}`,
  divergence: `uniform sampler2D uVelocity;
void main() {
  float L = texture(uVelocity, vL).x;
  float R = texture(uVelocity, vR).x;
  float T = texture(uVelocity, vT).y;
  float B = texture(uVelocity, vB).y;
  vec2 C = texture(uVelocity, vUv).xy;
  if (vL.x < 0.0) L = -C.x;
  if (vR.x > 1.0) R = -C.x;
  if (vT.y > 1.0) T = -C.y;
  if (vB.y < 0.0) B = -C.y;
  outColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`,
  curl: `uniform sampler2D uVelocity;
void main() {
  float L = texture(uVelocity, vL).y;
  float R = texture(uVelocity, vR).y;
  float T = texture(uVelocity, vT).x;
  float B = texture(uVelocity, vB).x;
  outColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`,
  vorticity: `uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;
void main() {
  float L = texture(uCurl, vL).x;
  float R = texture(uCurl, vR).x;
  float T = texture(uCurl, vT).x;
  float B = texture(uCurl, vB).x;
  float C = texture(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C;
  force.y *= -1.0;
  vec2 velocity = texture(uVelocity, vUv).xy + force * dt;
  outColor = vec4(clamp(velocity, -1000.0, 1000.0), 0.0, 1.0);
}`,
  pressure: `uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main() {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  float divergence = texture(uDivergence, vUv).x;
  outColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
}`,
  gradient: `uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main() {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  vec2 velocity = texture(uVelocity, vUv).xy - vec2(R - L, T - B);
  outColor = vec4(velocity, 0.0, 1.0);
}`,
  display: `uniform sampler2D uTexture;
uniform sampler2D uBloom;
uniform vec2 texelSize;
uniform float shading;
uniform float bloom;
uniform float light;
float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}
void main() {
  vec3 c = texture(uTexture, vUv).rgb;
  if (shading > 0.0) {
    float dx = length(texture(uTexture, vR).rgb) - length(texture(uTexture, vL).rgb);
    float dy = length(texture(uTexture, vT).rgb) - length(texture(uTexture, vB).rgb);
    vec3 n = normalize(vec3(dx, dy, length(texelSize)));
    c *= mix(1.0, clamp(n.z + 0.7, 0.7, 1.0), shading);
  }
  if (bloom > 0.0) {
    c += max(texture(uBloom, vUv).rgb, 0.0) * bloom;
  }
  c = max(c, 0.0);
  float peak = max(c.r, max(c.g, c.b));
  float grain = (hash(gl_FragCoord.xy) - 0.5) / 255.0 * smoothstep(0.0, 0.03, peak);
  if (light > 0.5) {
    vec3 transmit = exp(-2.4 * c);
    float low = min(transmit.r, min(transmit.g, transmit.b));
    float alpha = clamp(1.0 - low + grain, 0.0, 1.0);
    outColor = vec4(min(transmit - low, vec3(alpha)), alpha);
  } else {
    c = max(c + grain, 0.0);
    float alpha = clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0);
    outColor = vec4(min(c, vec3(alpha)), alpha);
  }
}`
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const parseColor = (value: string): RGB => {
  let hex = String(value).replace('#', '').trim();
  if (hex.length === 3) hex = [...hex].map(char => char + char).join('');
  const number = parseInt(hex.slice(0, 6), 16);
  if (Number.isNaN(number)) return [1, 1, 1];
  return [((number >> 16) & 255) / 255, ((number >> 8) & 255) / 255, (number & 255) / 255];
};

const settings = {
  palette: ['#4034b8', '#9877ec', '#61b8ee', '#7255c4', '#df85ba'].map(parseColor),
  colorSpeed: 0.16, intensity: 2, size: 0.65, force: 0.5,
  swirl: 2, trail: 1.4, momentum: 0.85, shading: 0.15,
  quality: 'low' as const, light: false, contained: true,
};

export function createSplashCursor(canvas: HTMLCanvasElement, scope: HTMLElement, initialPointer?: Pick<PointerEvent, 'clientX' | 'clientY' | 'pointerId'>) {
  const colorEpoch = performance.now();
    const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false
  });
  if (!gl) return undefined;
  gl.getExtension('EXT_color_buffer_float');
  gl.getExtension('EXT_color_buffer_half_float');

  const renderable = (internal: number, format: number) => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, 4, 4, 0, format, gl.HALF_FLOAT, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    const complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(fbo);
    gl.deleteTexture(texture);
    return complete;
  };
  const rgba: Format = { internal: gl.RGBA16F, format: gl.RGBA };
  if (!renderable(rgba.internal, rgba.format)) return undefined;
  const rg: Format = renderable(gl.RG16F, gl.RG) ? { internal: gl.RG16F, format: gl.RG } : rgba;
  const r: Format = renderable(gl.R16F, gl.RED) ? { internal: gl.R16F, format: gl.RED } : rg;

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type) as WebGLShader;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  };
  const vertex = compile(gl.VERTEX_SHADER, VERTEX);
  const programs: Record<string, { program: WebGLProgram; uniforms: Uniforms }> = {};
  let broken = false;
  Object.entries(SHADERS).forEach(([name, body]) => {
    const fragment = compile(gl.FRAGMENT_SHADER, HEADER + body);
    const program = gl.createProgram() as WebGLProgram;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.bindAttribLocation(program, 0, 'aPosition');
    gl.linkProgram(program);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) broken = true;
    const uniforms: Uniforms = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const info = gl.getActiveUniform(program, i);
      if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);
    }
    programs[name] = { program, uniforms };
  });
  gl.deleteShader(vertex);

  const buffer = gl.createBuffer();
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const targets = new Set<Target>();
  let disposed = false;
  let lost = false;

  const release = () => {
    if (gl.isContextLost()) return;
    targets.forEach(target => {
      gl.deleteFramebuffer(target.fbo);
      gl.deleteTexture(target.texture);
    });
    targets.clear();
    Object.values(programs).forEach(item => gl.deleteProgram(item.program));
    gl.deleteBuffer(buffer);
    gl.deleteVertexArray(vao);
  };

  if (broken) {
    release();
    return undefined;
  }

  const bindProgram = (name: string) => {
    const item = programs[name];
    if (!item) throw new Error(`Missing splash shader: ${name}`);
    gl.useProgram(item.program);
    return item.uniforms;
  };

  const blit = (target: Target | null) => {
    if (target) {
      gl.viewport(0, 0, target.width, target.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    } else {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const createTarget = (width: number, height: number, format: Format, filter: number): Target => {
    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture() as WebGLTexture;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, format.internal, width, height, 0, format.format, gl.HALF_FLOAT, null);
    const fbo = gl.createFramebuffer() as WebGLFramebuffer;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const target = {
      texture,
      fbo,
      width,
      height,
      texelX: 1 / width,
      texelY: 1 / height,
      attach: (unit: number) => {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return unit;
      }
    };
    targets.add(target);
    return target;
  };

  const destroyTarget = (target: Target | null) => {
    if (!target) return;
    gl.deleteFramebuffer(target.fbo);
    gl.deleteTexture(target.texture);
    targets.delete(target);
  };

  const reshape = (target: Target, width: number, height: number, format: Format) => {
    gl.bindTexture(gl.TEXTURE_2D, target.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, format.internal, width, height, 0, format.format, gl.HALF_FLOAT, null);
    target.width = width;
    target.height = height;
    target.texelX = 1 / width;
    target.texelY = 1 / height;
  };

  const createDouble = (width: number, height: number, format: Format, filter: number) => {
    const pair: DoubleTarget = {
      read: createTarget(width, height, format, filter),
      write: createTarget(width, height, format, filter),
      width,
      height,
      texelX: 1 / width,
      texelY: 1 / height,
      swap: () => {
        const current = pair.read;
        pair.read = pair.write;
        pair.write = current;
      }
    };
    return pair;
  };

  const resizeDouble = (
    pair: DoubleTarget,
    width: number,
    height: number,
    format: Format,
    filter: number,
    keep: boolean
  ) => {
    if (keep) {
      const next = createTarget(width, height, format, filter);
      const u = bindProgram('copy');
      gl.uniform1i(u.uTexture ?? null, pair.read.attach(0));
      blit(next);
      destroyTarget(pair.read);
      pair.read = next;
    } else {
      reshape(pair.read, width, height, format);
    }
    reshape(pair.write, width, height, format);
    pair.width = width;
    pair.height = height;
    pair.texelX = 1 / width;
    pair.texelY = 1 / height;
  };

  const resolution = (base: number) => {
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    const aspect = Math.max(width, height) / Math.max(1, Math.min(width, height));
    const short = Math.round(base);
    const long = Math.round(base * aspect);
    return width > height ? { width: long, height: short } : { width: short, height: long };
  };

  const fit = () => {
    const ratio = Math.min(1, 1440 / canvas.clientWidth, 900 / canvas.clientHeight);
    const width = Math.max(1, Math.floor(canvas.clientWidth * ratio));
    const height = Math.max(1, Math.floor(canvas.clientHeight * ratio));
    if (canvas.width === width && canvas.height === height) return;
    canvas.width = width;
    canvas.height = height;
  };

  const sizes = () => {
    const q = QUALITY[settings.quality];
    const shortSide = Math.min(gl.drawingBufferWidth, gl.drawingBufferHeight);
    return { sim: resolution(q.sim), ink: resolution(Math.max(q.sim, Math.min(q.dye, shortSide))) };
  };

  fit();
  const initial = sizes();
  const dye = createDouble(initial.ink.width, initial.ink.height, rgba, gl.LINEAR);
  const velocity = createDouble(initial.sim.width, initial.sim.height, rg, gl.LINEAR);
  const pressure = createDouble(initial.sim.width, initial.sim.height, r, gl.NEAREST);
  const divergence = createTarget(initial.sim.width, initial.sim.height, r, gl.NEAREST);
  const curl = createTarget(initial.sim.width, initial.sim.height, r, gl.NEAREST);
  const resize = () => {
    fit();
    const next = sizes();
    if (dye.width !== next.ink.width || dye.height !== next.ink.height) {
      resizeDouble(dye, next.ink.width, next.ink.height, rgba, gl.LINEAR, true);
    }
    if (velocity.width !== next.sim.width || velocity.height !== next.sim.height) {
      resizeDouble(velocity, next.sim.width, next.sim.height, rg, gl.LINEAR, true);
      resizeDouble(pressure, next.sim.width, next.sim.height, r, gl.NEAREST, false);
      reshape(divergence, next.sim.width, next.sim.height, r);
      reshape(curl, next.sim.width, next.sim.height, r);
    }
  };

  const radiusFor = (scale: number) => {
    const aspect = canvas.width / canvas.height;
    return ((0.2 * settings.size * scale) / 100) * (aspect > 1 ? aspect : 1);
  };

  const splat = (
    ax: number,
    ay: number,
    bx: number,
    by: number,
    vx: number,
    vy: number,
    color: RGB,
    radius: number
  ) => {
    const u = bindProgram('splat');
    gl.uniform1i(u.uTarget ?? null, velocity.read.attach(0));
    gl.uniform1f(u.aspectRatio ?? null, canvas.width / canvas.height);
    gl.uniform2f(u.pointA ?? null, ax, ay);
    gl.uniform2f(u.pointB ?? null, bx, by);
    gl.uniform3f(u.color ?? null, vx, vy, 0);
    gl.uniform1f(u.radius ?? null, radius);
    blit(velocity.write);
    velocity.swap();
    gl.uniform1i(u.uTarget ?? null, dye.read.attach(0));
    gl.uniform3f(u.color ?? null, color[0], color[1], color[2]);
    blit(dye.write);
    dye.swap();
  };

  const colorAt = (offset: number, now: number): RGB => {
    const s = settings;
    const phase = (((offset + ((now - colorEpoch) / 1000) * s.colorSpeed * 0.6) % 1) + 1) % 1;
    const palette = s.palette;
    if (palette.length === 1) return palette[0]!;
    const position = phase * palette.length;
    const from = palette[Math.floor(position) % palette.length]!;
    const to = palette[(Math.floor(position) + 1) % palette.length]!;
    const t = position - Math.floor(position);
    const blend = t * t * (3 - 2 * t);
    return [
      from[0] + (to[0] - from[0]) * blend,
      from[1] + (to[1] - from[1]) * blend,
      from[2] + (to[2] - from[2]) * blend
    ];
  };

  const inkFor = (color: RGB, amount: number) =>
    color.map(channel => (settings.light ? 1 - channel : channel) * amount) as RGB;

  const flush = (pointer: Pointer, dt: number, now: number) => {
    const s = settings;
    const aspect = canvas.width / canvas.height;
    const length = Math.hypot((pointer.x - pointer.px) * aspect, pointer.y - pointer.py);
    if (length > 0.35) {
      pointer.px = pointer.x;
      pointer.py = pointer.y;
      return;
    }
    let dx = pointer.x - pointer.px;
    let dy = pointer.y - pointer.py;
    if (aspect < 1) dx *= aspect;
    else dy /= aspect;
    const radius = radiusFor(1);
    pointer.offset += length * 0.25;
    const spread = 1 + length / (1.77 * Math.sqrt(radius));
    const push = (6000 * s.force) / Math.sqrt(spread);
    const amount = (0.15 * s.intensity * Math.min(dt * 60, 1)) / Math.sqrt(spread);
    const color = inkFor(colorAt(pointer.offset, now), amount);
    splat(pointer.px, pointer.py, pointer.x, pointer.y, dx * push, dy * push, color, radius);
    pointer.px = pointer.x;
    pointer.py = pointer.y;
  };

  const step = (dt: number) => {
    const s = settings;
    const iterations = QUALITY[s.quality].iterations;
    gl.disable(gl.BLEND);

    let u = bindProgram('curl');
    gl.uniform2f(u.texelSize ?? null, velocity.texelX, velocity.texelY);
    gl.uniform1i(u.uVelocity ?? null, velocity.read.attach(0));
    blit(curl);

    u = bindProgram('vorticity');
    gl.uniform2f(u.texelSize ?? null, velocity.texelX, velocity.texelY);
    gl.uniform1i(u.uVelocity ?? null, velocity.read.attach(0));
    gl.uniform1i(u.uCurl ?? null, curl.attach(1));
    gl.uniform1f(u.curl ?? null, s.swirl);
    gl.uniform1f(u.dt ?? null, dt);
    blit(velocity.write);
    velocity.swap();

    u = bindProgram('divergence');
    gl.uniform2f(u.texelSize ?? null, velocity.texelX, velocity.texelY);
    gl.uniform1i(u.uVelocity ?? null, velocity.read.attach(0));
    blit(divergence);

    u = bindProgram('clear');
    gl.uniform1i(u.uTexture ?? null, pressure.read.attach(0));
    gl.uniform1f(u.value ?? null, 0.1);
    blit(pressure.write);
    pressure.swap();

    u = bindProgram('pressure');
    gl.uniform2f(u.texelSize ?? null, velocity.texelX, velocity.texelY);
    gl.uniform1i(u.uDivergence ?? null, divergence.attach(0));
    for (let i = 0; i < iterations; i++) {
      gl.uniform1i(u.uPressure ?? null, pressure.read.attach(1));
      blit(pressure.write);
      pressure.swap();
    }

    u = bindProgram('gradient');
    gl.uniform2f(u.texelSize ?? null, velocity.texelX, velocity.texelY);
    gl.uniform1i(u.uPressure ?? null, pressure.read.attach(0));
    gl.uniform1i(u.uVelocity ?? null, velocity.read.attach(1));
    blit(velocity.write);
    velocity.swap();

    u = bindProgram('advection');
    gl.uniform2f(u.texelSize ?? null, velocity.texelX, velocity.texelY);
    gl.uniform1i(u.uVelocity ?? null, velocity.read.attach(0));
    gl.uniform1i(u.uSource ?? null, velocity.read.attach(0));
    gl.uniform1f(u.dt ?? null, dt);
    gl.uniform1f(u.dissipation ?? null, 2 / s.momentum);
    blit(velocity.write);
    velocity.swap();

    gl.uniform1i(u.uVelocity ?? null, velocity.read.attach(0));
    gl.uniform1i(u.uSource ?? null, dye.read.attach(1));
    gl.uniform1f(u.dissipation ?? null, 3.5 / s.trail);
    blit(dye.write);
    dye.swap();
  };

  const render = () => {
    const s = settings;
    gl.disable(gl.BLEND);
    const u = bindProgram('display');
    gl.uniform2f(u.texelSize ?? null, 1 / gl.drawingBufferWidth, 1 / gl.drawingBufferHeight);
    gl.uniform1i(u.uTexture ?? null, dye.read.attach(0));
    gl.uniform1i(u.uBloom ?? null, dye.read.attach(1));
    gl.uniform1f(u.shading ?? null, s.shading);
    gl.uniform1f(u.bloom ?? null, 0);
    gl.uniform1f(u.light ?? null, s.light ? 1 : 0);
    blit(null);
  };

  const clearScreen = () => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  };

  const pointers = new Map<string, Pointer>();
  let raf = 0;
  let last = 0;
  let lastActivity = performance.now();

  const frame = (now: number) => {
    raf = 0;
    if (disposed || lost) return;
    const s = settings;
    if (now - last < 1000 / 30) { raf = requestAnimationFrame(frame); return; }
    const dt = clamp((now - last) / 1000, 0, 1 / 30) * 0.8;
    last = now;
    resize();
    pointers.forEach(pointer => {
      if (!pointer.moved) return;
      pointer.moved = false;
      flush(pointer, dt, now);
    });
    step(dt);
    render();
    const quiet = (2.2 * s.trail + 0.4) * 1000;
    if (now - lastActivity < quiet) raf = requestAnimationFrame(frame);
    else clearScreen();
  };

  const wake = () => {
    lastActivity = performance.now();
    if (raf || disposed || lost) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  const locate = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const x = (clientX - rect.left) / rect.width;
    const y = 1 - (clientY - rect.top) / rect.height;
    if (settings.contained && (x < 0 || x > 1 || y < 0 || y > 1)) return null;
    return { x, y };
  };

  const track = (id: string, clientX: number, clientY: number) => {
    const point = locate(clientX, clientY);
    let pointer = pointers.get(id);
    if (!point) {
      if (pointer) pointer.ready = false;
      return;
    }
    if (!pointer) {
      pointer = { x: 0, y: 0, px: 0, py: 0, ready: false, moved: false, offset: 0.2 };
      pointers.set(id, pointer);
    }
    if (!pointer.ready) {
      pointer.x = pointer.px = point.x;
      pointer.y = pointer.py = point.y;
      pointer.ready = true;
      pointer.moved = true;
      wake();
      return;
    }
    pointer.x = point.x;
    pointer.y = point.y;
    pointer.moved = true;
    wake();
  };

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === 'mouse') {
      track(`p${event.pointerId}`, event.clientX, event.clientY);
    }
  };
  const onLeave = () => {
    pointers.forEach(pointer => {
      pointer.ready = false;
    });
  };
  const onLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    cancelAnimationFrame(raf);
    raf = 0;
  };


  scope.addEventListener('pointermove', onPointerMove, { passive: true });
  scope.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('webglcontextlost', onLost);
  resize();
  if (initialPointer) track(`p${initialPointer.pointerId}`, initialPointer.clientX, initialPointer.clientY);

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    scope.removeEventListener('pointermove', onPointerMove);
    scope.removeEventListener('pointerleave', onLeave);
    canvas.removeEventListener('webglcontextlost', onLost);
    release();
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };

}

