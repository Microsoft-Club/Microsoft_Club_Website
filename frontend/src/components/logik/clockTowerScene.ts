import { gikiHandAngles } from './gikiTime';
import { createPointRenderer, POINT_STRIDE } from './pointRenderer';
import {
  buildTowerPoints,
  isUnderHand,
  MODEL_BOTTOM,
  MODEL_TOP,
  poseSecondHand,
  TINT_SECOND_HAND,
  TOWER,
} from './towerModel';
import type { TowerPoints } from './towerModel';

type SceneElements = {
  canvas: HTMLCanvasElement;
  hero: HTMLElement;
  /** The tower is fitted inside this element's box. */
  slot: HTMLElement;
};

const TAU = Math.PI * 2;
const STIPPLE_PX = 3;
const MAX_POINTS = 34000;
const SKY_MAX = 240;
const CAMERA_DISTANCE = 22;
const BASE_PITCH = 0.06;
const RESTING_YAW = 0.62;
const SPIN_PERIOD_MS = 56000;
const AMBIENT_LIGHT = 0.38;
const SPRING = 0.045;
const DAMPING = 0.86;
const SCATTER_SCROLL = 0.75;
const INTRO_MS = 1800;
const MODEL_CENTER = (MODEL_TOP + MODEL_BOTTOM) / 2;

const LIGHT = (() => {
  const [x, y, z] = [-0.55, 0.42, 0.72];
  const length = Math.hypot(x, y, z);
  return [x / length, y / length, z / length] as const;
})();

const GRADIENT_TOP = TOWER.merlonTop;
const GRADIENT: readonly (readonly [number, number, number, number])[] = [
  [0, 236, 242, 255],
  [0.5, 140, 182, 255],
  [1, 38, 64, 196],
];

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

const gradientAt = (t: number) => {
  for (let i = 1; i < GRADIENT.length; i++) {
    const [stop, r, g, b] = GRADIENT[i];
    if (t <= stop) {
      const [prevStop, pr, pg, pb] = GRADIENT[i - 1];
      const k = (t - prevStop) / (stop - prevStop);
      return [pr + (r - pr) * k, pg + (g - pg) * k, pb + (b - pb) * k];
    }
  }
  const [, r, g, b] = GRADIENT[GRADIENT.length - 1];
  return [r, g, b];
};

type Particles = {
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  starX: Float32Array;
  starY: Float32Array;
  starSize: Float32Array;
  starAlpha: Float32Array;
  phase: Float32Array;
  depth: Float32Array;
  size: Float32Array;
  thin: Float32Array;
  r: Float32Array;
  g: Float32Array;
  b: Float32Array;
};

const createParticles = (points: TowerPoints): Particles => {
  const n = points.count;
  const make = () => new Float32Array(n);
  const particles: Particles = {
    x: make(),
    y: make(),
    vx: make(),
    vy: make(),
    starX: make(),
    starY: make(),
    starSize: make(),
    starAlpha: make(),
    phase: make(),
    depth: make(),
    size: make(),
    thin: make(),
    r: make(),
    g: make(),
    b: make(),
  };
  const span = GRADIENT_TOP - MODEL_BOTTOM;
  for (let i = 0; i < n; i++) {
    particles.starX[i] = Math.random();
    particles.starY[i] = Math.random();
    particles.starSize[i] = Math.random() * 4;
    particles.starAlpha[i] = 0.3 + Math.random() * 0.55;
    particles.phase[i] = Math.random() * TAU;
    particles.depth[i] = 0.3 + Math.random() * 0.7;
    particles.size[i] = (1.1 + Math.random() * 0.8) * points.size[i];
    particles.thin[i] = Math.random();
    const [r, g, b] =
      points.tint[i] === TINT_SECOND_HAND
        ? [255, 110, 104]
        : gradientAt(clamp01((GRADIENT_TOP - points.position[i * 3 + 1]) / span));
    particles.r[i] = r / 255;
    particles.g[i] = g / 255;
    particles.b[i] = b / 255;
  }
  return particles;
};

type Sky = {
  x: Float32Array;
  y: Float32Array;
  size: Float32Array;
  alpha: Float32Array;
  phase: Float32Array;
  speed: Float32Array;
  depth: Float32Array;
};

const createSky = (): Sky => {
  const make = () => new Float32Array(SKY_MAX);
  const sky: Sky = {
    x: make(),
    y: make(),
    size: make(),
    alpha: make(),
    phase: make(),
    speed: make(),
    depth: make(),
  };
  for (let i = 0; i < SKY_MAX; i++) {
    sky.x[i] = Math.random();
    sky.y[i] = Math.random() ** 1.4;
    sky.size[i] = 0.6 + Math.random() * 0.9;
    sky.alpha[i] = 0.08 + Math.random() * 0.3;
    sky.phase[i] = Math.random() * TAU;
    sky.speed[i] = 0.0006 + Math.random() * 0.0012;
    sky.depth[i] = 0.3 + Math.random() * 0.7;
  }
  return sky;
};

export const createClockTowerScene = ({ canvas, hero, slot }: SceneElements) => {
  const renderer = createPointRenderer(canvas);
  if (!renderer) return { destroy: () => undefined };

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = motionQuery.matches;

  let width = 0;
  let height = 0;
  let towerX = 0;
  let towerY = 0;
  let scale = 0;
  let builtScale = 0;
  let keepRatio = 1;
  let tower: TowerPoints | null = null;
  let particles: Particles | null = null;
  let handStart = -1;
  let buffer = new Float32Array(0);
  let needsSnap = true;
  const sky = createSky();

  const pointer = { clientX: 0, clientY: 0, inside: false };
  let parallaxX = 0;
  let parallaxY = 0;
  let scatter = reducedMotion ? 0 : 1;
  let yaw = RESTING_YAW;
  let lastScrollY = window.scrollY;
  let lastFrame = 0;
  const startedAt = performance.now();
  const angles = new Float64Array(3);
  const handSin = new Float64Array(3);
  const handCos = new Float64Array(3);
  let frameId = 0;
  let inView = true;

  const build = () => {
    let spacing = STIPPLE_PX / scale;
    let points = buildTowerPoints(spacing);
    if (points.count > MAX_POINTS) {
      spacing *= Math.sqrt(points.count / MAX_POINTS);
      points = buildTowerPoints(spacing);
    }
    tower = points;
    builtScale = scale;
    particles = createParticles(points);
    handStart = points.hand.findIndex((hand) => hand >= 0);
    buffer = new Float32Array((points.count + SKY_MAX) * POINT_STRIDE);
    needsSnap = true;
  };

  const layout = () => {
    const box = canvas.getBoundingClientRect();
    const area = slot.getBoundingClientRect();
    if (!box.width || !box.height || !area.height) return;
    width = box.width;
    height = box.height;
    renderer.resize(width, height, Math.min(window.devicePixelRatio || 1, 2));
    towerX = area.left - box.left + area.width / 2;
    towerY = area.top - box.top + area.height / 2;
    scale = Math.max(
      10,
      Math.min((area.height * 0.96) / (MODEL_TOP - MODEL_BOTTOM), area.width / 1.9),
    );
    if (!tower || Math.abs(scale - builtScale) > builtScale * 0.2) build();
    if (tower) keepRatio = Math.min(Math.floor((width * height) / 3800), 400) / tower.count;
  };

  const writeSky = (now: number) => {
    const visibleStars = Math.min(SKY_MAX, Math.floor((width * height) / 6500));
    const shaftHalf = scale * 0.8;
    const towerTop = towerY - (MODEL_TOP - MODEL_CENTER) * scale;
    const plazaTop = towerY + MODEL_CENTER * scale;
    const plazaHalf = scale * 2.9;
    let count = 0;
    for (let i = 0; i < visibleStars; i++) {
      const x = sky.x[i] * width - parallaxX * 10 * sky.depth[i];
      const y = sky.y[i] * height - parallaxY * 6 * sky.depth[i];
      const dx = Math.abs(x - towerX);
      if ((dx < shaftHalf && y > towerTop) || (dx < plazaHalf && y > plazaTop)) continue;
      const twinkle = reducedMotion ? 0.8 : 0.55 + 0.45 * Math.sin(now * sky.speed[i] + sky.phase[i]);
      const o = count * POINT_STRIDE;
      buffer[o] = x;
      buffer[o + 1] = y;
      buffer[o + 2] = sky.size[i];
      buffer[o + 3] = 0.78;
      buffer[o + 4] = 0.85;
      buffer[o + 5] = 1;
      buffer[o + 6] = sky.alpha[i] * twinkle;
      count++;
    }
    return count;
  };

  const frame = (now: number) => {
    frameId = requestAnimationFrame(frame);
    if (!tower || !particles || !width) return;
    const dt = Math.min((now - (lastFrame || now - 16.67)) / 16.67, 2);
    lastFrame = now;

    // Scrolling scatters the tower into stars; on load it assembles out of them.
    // With reduced motion the tower stays whole and scrolls away with the page.
    const scrollY = window.scrollY;
    if (reducedMotion) {
      scatter = 0;
    } else {
      const scrolled = clamp01(scrollY / (height * SCATTER_SCROLL));
      const intro = 1 - easeOutCubic(clamp01((now - startedAt) / INTRO_MS));
      const target = Math.max(scrolled, intro);
      scatter += (target - scatter) * (1 - Math.exp(-0.14 * dt));
    }
    const n = scatter * scatter * (3 - 2 * scatter);
    const scrollKick = reducedMotion ? 0 : Math.max(-80, Math.min(80, scrollY - lastScrollY));
    lastScrollY = scrollY;

    const box = canvas.getBoundingClientRect();
    const mouseX = pointer.clientX - box.left;
    const mouseY = pointer.clientY - box.top;
    const hovering =
      !reducedMotion &&
      pointer.inside &&
      mouseX >= 0 &&
      mouseY >= 0 &&
      mouseX <= width &&
      mouseY <= height;
    const ease = 1 - Math.exp(-0.05 * dt);
    parallaxX += ((hovering ? (mouseX / width) * 2 - 1 : 0) - parallaxX) * ease;
    parallaxY += ((hovering ? (mouseY / height) * 2 - 1 : 0) - parallaxY) * ease;

    if (!reducedMotion) yaw = (yaw + (dt * 16.67 * TAU) / SPIN_PERIOD_MS) % TAU;
    const viewYaw = reducedMotion ? RESTING_YAW : yaw + parallaxX * 0.45;
    const viewPitch = BASE_PITCH + (reducedMotion ? 0 : parallaxY * 0.05);
    const cosY = Math.cos(viewYaw);
    const sinY = Math.sin(viewYaw);
    const cosP = Math.cos(viewPitch);
    const sinP = Math.sin(viewPitch);

    const { position, normal, tone, hand, handAlong, dial } = tower;
    gikiHandAngles(angles);
    for (let k = 0; k < 3; k++) {
      handSin[k] = Math.sin(angles[k]);
      handCos[k] = Math.cos(angles[k]);
    }
    if (handStart >= 0) {
      for (let i = handStart; i < tower.count; i++) {
        poseSecondHand(hand[i], handAlong[i], handSin[2], handCos[2], position, i * 3);
      }
    }

    const focal = scale * CAMERA_DISTANCE;
    const repelRadius = Math.min(105, Math.max(55, scale * 1.1)) + 25 * n;
    const repelRadiusSq = repelRadius * repelRadius;
    const steps = Math.max(1, Math.ceil(dt * 2));
    const step = dt / steps;
    const damping = DAMPING ** step;
    const dropThinned = n > 0.995;
    const wobble = reducedMotion ? 0 : n;
    const snap = needsSnap || reducedMotion;
    needsSnap = false;

    const p = particles;
    let count = writeSky(now);
    for (let i = 0; i < tower.count; i++) {
      const thinned = p.thin[i] >= keepRatio;
      if (dropThinned && thinned) continue;

      const o = i * 3;
      const x = position[o];
      const y = position[o + 1] - MODEL_CENTER;
      const z = position[o + 2];
      const xr = x * cosY + z * sinY;
      const zr = z * cosY - x * sinY;
      const yv = y * cosP + zr * sinP;
      const zv = zr * cosP - y * sinP;
      const perspective = focal / (CAMERA_DISTANCE - zv);
      const homeX = towerX + xr * perspective;
      const homeY = towerY - yv * perspective;

      let shade = tone[i];
      const nx = normal[o];
      const ny = normal[o + 1];
      const nz = normal[o + 2];
      if (nx || ny || nz) {
        const nxr = nx * cosY + nz * sinY;
        const nzr = nz * cosY - nx * sinY;
        const nyv = ny * cosP + nzr * sinP;
        const nzv = nzr * cosP - ny * sinP;
        const toCameraZ = CAMERA_DISTANCE - zv;
        const facing =
          (nzv * toCameraZ - nxr * xr - nyv * yv) /
          Math.sqrt(xr * xr + yv * yv + toCameraZ * toCameraZ);
        if (facing <= 0.02 || (dial[i] >= 0 && isUnderHand(tower, i, handSin, handCos))) {
          shade = 0;
        } else {
          const lit = Math.max(0, nxr * LIGHT[0] + ny * LIGHT[1] + nzr * LIGHT[2]);
          shade *= smoothstep(0.02, 0.24, facing) * (AMBIENT_LIGHT + (1 - AMBIENT_LIGHT) * lit);
        }
      }

      if (shade <= 0.01 && n < 0.01) {
        p.x[i] = homeX;
        p.y[i] = homeY;
        p.vx[i] = 0;
        p.vy[i] = 0;
        continue;
      }

      const phase = p.phase[i];
      const targetX =
        homeX + (p.starX[i] * width - homeX) * n + (wobble ? Math.sin(now * 0.00045 + phase) * 80 * wobble : 0);
      const targetY =
        homeY + (p.starY[i] * height - homeY) * n + (wobble ? Math.cos(now * 0.00032 + phase) * 55 * wobble : 0);

      let px = p.x[i];
      let py = p.y[i];
      let vx = p.vx[i];
      let vy = p.vy[i];
      if (snap) {
        px = targetX;
        py = targetY;
        vx = 0;
        vy = 0;
      } else {
        if (scrollKick) {
          const ex = px - width / 2;
          const ey = py - height / 2;
          const distance = Math.sqrt(ex * ex + ey * ey) || 1;
          const kick = Math.abs(scrollKick) * 0.08 * p.depth[i] * n;
          vx += (ex / distance) * kick;
          vy += (ey / distance) * kick - scrollKick * 0.04 * p.depth[i] * n;
        }
        for (let s = 0; s < steps; s++) {
          let ax = (targetX - px) * SPRING;
          let ay = (targetY - py) * SPRING;
          if (hovering) {
            const dx = px - mouseX;
            const dy = py - mouseY;
            const distanceSq = dx * dx + dy * dy;
            if (distanceSq < repelRadiusSq) {
              const distance = Math.sqrt(distanceSq);
              const push = (1 - distance / repelRadius) ** 2 * 4.8 * (1 - n * 0.4);
              ax += (distance > 0.01 ? dx / distance : Math.cos(phase)) * push;
              ay += (distance > 0.01 ? dy / distance : Math.sin(phase)) * push;
            }
          }
          vx = (vx + ax * step) * damping;
          vy = (vy + ay * step) * damping;
          px += vx * step;
          py += vy * step;
        }
      }
      p.x[i] = px;
      p.y[i] = py;
      p.vx[i] = vx;
      p.vy[i] = vy;

      let alpha = shade + (p.starAlpha[i] - shade) * n;
      if (thinned) alpha *= 1 - n;
      if (n > 0) {
        const edge = smoothstep(0, 1, Math.min(py, height - py) / (height * 0.18));
        alpha *= 1 - n * (1 - edge);
      }
      if (alpha <= 0.01) continue;

      const out = count * POINT_STRIDE;
      buffer[out] = px;
      buffer[out + 1] = py;
      buffer[out + 2] = p.size[i] + (p.starSize[i] - p.size[i]) * n;
      buffer[out + 3] = p.r[i] + (1 - p.r[i]) * n;
      buffer[out + 4] = p.g[i] + (1 - p.g[i]) * n;
      buffer[out + 5] = p.b[i] + (1 - p.b[i]) * n;
      buffer[out + 6] = alpha > 1 ? 1 : alpha;
      count++;
    }
    renderer.draw(buffer, count);
  };

  const start = () => {
    if (frameId || !inView || document.hidden) return;
    lastFrame = 0;
    frameId = requestAnimationFrame(frame);
  };
  const stop = () => {
    cancelAnimationFrame(frameId);
    frameId = 0;
  };

  const intersection = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView) start();
    else stop();
  });
  intersection.observe(hero);

  const resize = new ResizeObserver(layout);
  resize.observe(hero);
  resize.observe(slot);

  const onVisibilityChange = () => (document.hidden ? stop() : start());
  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return;
    pointer.clientX = event.clientX;
    pointer.clientY = event.clientY;
    pointer.inside = true;
  };
  const onPointerOut = (event: PointerEvent) => {
    if (!event.relatedTarget) pointer.inside = false;
  };
  const onBlur = () => {
    pointer.inside = false;
  };
  const onMotionChange = (event: MediaQueryListEvent) => {
    reducedMotion = event.matches;
    needsSnap = true;
  };

  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerout', onPointerOut);
  window.addEventListener('blur', onBlur);
  motionQuery.addEventListener('change', onMotionChange);

  layout();
  start();

  return {
    destroy: () => {
      stop();
      intersection.disconnect();
      resize.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerout', onPointerOut);
      window.removeEventListener('blur', onBlur);
      motionQuery.removeEventListener('change', onMotionChange);
      renderer.destroy();
    },
  };
};
