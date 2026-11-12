/** Floats per point: x, y and size in CSS pixels, then r, g, b, alpha in 0..1. */
export const POINT_STRIDE = 7;

export type PointRenderer = {
  resize: (width: number, height: number, pixelRatio: number) => void;
  draw: (points: Float32Array, count: number) => void;
  destroy: () => void;
};

const VERTEX_SHADER = `
attribute vec2 aPosition;
attribute float aSize;
attribute vec4 aColor;
uniform vec2 uViewport;
uniform float uPixelRatio;
varying vec4 vColor;
varying float vSize;
varying float vSprite;
varying float vRound;

void main() {
  vec2 clip = aPosition / uViewport * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  vSize = aSize * uPixelRatio;
  vSprite = ceil(vSize) + 1.0;
  vRound = step(2.0, aSize);
  vColor = aColor;
  gl_PointSize = vSprite;
}
`;

// Points below 2 CSS px are squares and bigger ones are discs, both with
// box-filtered edges so sub-pixel motion stays smooth.
const FRAGMENT_SHADER = `
precision mediump float;
varying vec4 vColor;
varying float vSize;
varying float vSprite;
varying float vRound;

void main() {
  vec2 offset = (gl_PointCoord - 0.5) * vSprite;
  float radius = vSize * 0.5;
  vec2 overlap = clamp(min(offset + 0.5, vec2(radius)) - max(offset - 0.5, vec2(-radius)), 0.0, 1.0);
  float square = overlap.x * overlap.y;
  float disc = clamp(radius - length(offset) + 0.5, 0.0, 1.0);
  float alpha = vColor.a * mix(square, disc, vRound);
  if (alpha < 0.004) discard;
  gl_FragColor = vec4(vColor.rgb * alpha, alpha);
}
`;

const compile = (gl: WebGLRenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

const createWebGLRenderer = (canvas: HTMLCanvasElement): PointRenderer | null => {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
  });
  if (!gl) return null;

  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;
  let viewport: WebGLUniformLocation | null = null;
  let pixelRatioUniform: WebGLUniformLocation | null = null;
  let capacity = 0;
  let cssWidth = 1;
  let cssHeight = 1;
  let pixelRatio = 1;

  const init = () => {
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const linked = gl.createProgram();
    if (!vertex || !fragment || !linked) return false;
    gl.attachShader(linked, vertex);
    gl.attachShader(linked, fragment);
    gl.linkProgram(linked);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(linked, gl.LINK_STATUS)) {
      gl.deleteProgram(linked);
      return false;
    }
    program = linked;
    buffer = gl.createBuffer();
    capacity = 0;
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    const stride = POINT_STRIDE * 4;
    const attribute = (name: string, size: number, offset: number) => {
      const location = gl.getAttribLocation(linked, name);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride, offset * 4);
    };
    attribute('aPosition', 2, 0);
    attribute('aSize', 1, 2);
    attribute('aColor', 4, 3);
    viewport = gl.getUniformLocation(program, 'uViewport');
    pixelRatioUniform = gl.getUniformLocation(program, 'uPixelRatio');
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    gl.viewport(0, 0, canvas.width, canvas.height);
    return true;
  };

  if (!init()) return null;

  const onContextLost = (event: Event) => {
    event.preventDefault();
    program = null;
  };
  const onContextRestored = () => {
    init();
  };
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);

  return {
    resize(width, height, ratio) {
      cssWidth = Math.max(1, width);
      cssHeight = Math.max(1, height);
      pixelRatio = ratio;
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      gl.viewport(0, 0, canvas.width, canvas.height);
    },
    draw(points, count) {
      if (!program || gl.isContextLost()) return;
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (!count) return;
      gl.useProgram(program);
      gl.uniform2f(viewport, cssWidth, cssHeight);
      gl.uniform1f(pixelRatioUniform, pixelRatio);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      if (points.byteLength > capacity) {
        gl.bufferData(gl.ARRAY_BUFFER, points.byteLength, gl.DYNAMIC_DRAW);
        capacity = points.byteLength;
      }
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, points.subarray(0, count * POINT_STRIDE));
      gl.drawArrays(gl.POINTS, 0, count);
    },
    destroy() {
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      if (!gl.isContextLost()) {
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
      }
      program = null;
    },
  };
};

const create2DRenderer = (canvas: HTMLCanvasElement): PointRenderer | null => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const styles = new Map<number, string>();
  let cssWidth = 0;
  let cssHeight = 0;

  return {
    resize(width, height, ratio) {
      cssWidth = width;
      cssHeight = height;
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    },
    draw(points, count) {
      ctx.clearRect(0, 0, cssWidth, cssHeight);
      for (let i = 0; i < count; i++) {
        const o = i * POINT_STRIDE;
        const size = points[o + 2];
        const r = Math.round(points[o + 3] * 31);
        const g = Math.round(points[o + 4] * 31);
        const b = Math.round(points[o + 5] * 31);
        const key = (r << 10) | (g << 5) | b;
        let style = styles.get(key);
        if (!style) {
          style = `rgb(${(r * 255) / 31},${(g * 255) / 31},${(b * 255) / 31})`;
          styles.set(key, style);
        }
        ctx.globalAlpha = points[o + 6];
        ctx.fillStyle = style;
        if (size > 2) {
          ctx.beginPath();
          ctx.arc(points[o], points[o + 1], size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(points[o] - size / 2, points[o + 1] - size / 2, size, size);
        }
      }
      ctx.globalAlpha = 1;
    },
    destroy() {},
  };
};

export const createPointRenderer = (canvas: HTMLCanvasElement) =>
  createWebGLRenderer(canvas) ?? create2DRenderer(canvas);
