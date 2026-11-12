export type Rng = () => number;

export const createRng = (seed: number): Rng => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * LoGIK, the GIKI clock tower. Lengths are multiples of the shaft width,
 * y points up from the top of the plaza, and the front face looks down +z.
 * The other three faces are the front face turned in 90° steps.
 */
export const TOWER = {
  half: 0.5,
  baseTop: 0.75,
  grilleTop: 1.8,
  clockBottom: 6.74,
  shaftTop: 7.3,
  panelHalf: 0.24,
  panelDepth: 0.06,
  grilleHalf: 0.175,
  grilleDepth: 0.09,
  mullionSpacing: 0.45,
  clockHalf: 0.25,
  dialY: 7.02,
  dialRadius: 0.205,
  corniceTop: 7.38,
  corniceHalf: 0.57,
  capBottom: 7.45,
  capHalf: 0.6,
  capTop: 7.65,
  merlonTop: 7.79,
  merlonsPerSide: 6,
  rodTop: 8.12,
} as const;

export const PLAZA = [
  { half: 1.2, bottom: -0.22, top: 0 },
  { half: 2, bottom: -0.52, top: -0.22 },
] as const;

export const MODEL_BOTTOM = PLAZA[PLAZA.length - 1].bottom;
export const MODEL_TOP = TOWER.rodTop;

export const TINT_TOWER = 0;
export const TINT_SECOND_HAND = 1;

// Hour and minute hands, cut out of the white dial as gaps, in fractions of
// the dial radius. The second hand is a red line of points.
const HANDS = [
  { length: 0.52, tail: 0.1, width: 0.13 },
  { length: 0.8, tail: 0.12, width: 0.08 },
] as const;
const SECOND_HAND = { length: 0.86, tail: 0.22 } as const;

const DIAL_Z = TOWER.half - 0.008;
const HAND_Z = TOWER.half - 0.004;

export type TowerPoints = {
  count: number;
  /** xyz per point. Second-hand points are re-posed every frame with `poseSecondHand`. */
  position: Float32Array;
  /** xyz per point; a zero normal means the point is visible from every side. */
  normal: Float32Array;
  tone: Float32Array;
  size: Float32Array;
  tint: Uint8Array;
  /** -1, or the face whose second hand the point belongs to. */
  hand: Int8Array;
  /** Distance from the dial centre along the second hand. */
  handAlong: Float32Array;
  /** -1, or the face whose white dial the point belongs to. */
  dial: Int8Array;
  /** Half-widths of the hour and minute hand gaps, in model units. */
  handGap: readonly [number, number];
};

const FACE_COS = [1, 0, -1, 0];
const FACE_SIN = [0, 1, 0, -1];
const FIELDS = 12;
const DIAL_PITCH = 0.5;

class PointList {
  readonly values: number[] = [];
  face = 0;
  size = 1;
  tint = TINT_TOWER;
  dial = -1;
  /** Tilts normals toward the face's outward +z, so a detail hides with its wall. */
  lean = 0;

  add(
    x: number,
    y: number,
    z: number,
    nx: number,
    ny: number,
    nz: number,
    tone: number,
    hand = -1,
    along = 0,
  ) {
    const c = FACE_COS[this.face];
    const s = FACE_SIN[this.face];
    const lz = nz + this.lean;
    const length = this.lean ? Math.hypot(nx, ny, lz) : 1;
    this.values.push(
      x * c + z * s,
      y,
      z * c - x * s,
      (nx * c + lz * s) / length,
      ny / length,
      (lz * c - nx * s) / length,
      tone,
      this.size,
      this.tint,
      hand,
      along,
      this.dial,
    );
  }
}

type Plane = 'x' | 'y' | 'z';

const grid = (length: number, spacing: number) => {
  const cells = Math.max(1, Math.round(length / spacing));
  return { cells, step: length / cells, keep: Math.min(1, length / spacing / cells) };
};

const jitter = (rng: Rng) => 0.165 + rng() * 0.67;

/**
 * Jittered-grid stipple over an axis-aligned rectangle. (u, v) are (x, y) on a
 * 'z' plane, (z, y) on an 'x' plane and (x, z) on a 'y' plane.
 */
const rect = (
  points: PointList,
  rng: Rng,
  plane: Plane,
  at: number,
  u0: number,
  u1: number,
  v0: number,
  v1: number,
  facing: 1 | -1,
  tone: number,
  spacing: number,
  speckle = 0,
) => {
  const u = grid(u1 - u0, spacing);
  const v = grid(v1 - v0, spacing);
  const keep = u.keep * v.keep;
  for (let i = 0; i < u.cells; i++) {
    for (let j = 0; j < v.cells; j++) {
      if (rng() > keep) continue;
      const a = u0 + (i + jitter(rng)) * u.step;
      const b = v0 + (j + jitter(rng)) * v.step;
      const t = speckle ? tone + (rng() - 0.5) * speckle : tone;
      if (plane === 'z') points.add(a, b, at, 0, 0, facing, t);
      else if (plane === 'x') points.add(at, b, a, facing, 0, 0, t);
      else points.add(a, at, b, 0, facing, 0, t);
    }
  }
};

const lineX = (
  points: PointList,
  rng: Rng,
  x0: number,
  x1: number,
  y: number,
  z: number,
  tone: number,
  spacing: number,
) => {
  const g = grid(x1 - x0, spacing);
  for (let i = 0; i < g.cells; i++) {
    points.add(x0 + (i + jitter(rng)) * g.step, y, z, 0, 0, 1, tone);
  }
};

const lineY = (
  points: PointList,
  rng: Rng,
  x: number,
  y0: number,
  y1: number,
  z: number,
  tone: number,
  spacing: number,
) => {
  const g = grid(y1 - y0, spacing);
  for (let i = 0; i < g.cells; i++) {
    points.add(x, y0 + (i + jitter(rng)) * g.step, z, 0, 0, 1, tone);
  }
};

/** Regular grid of points, one per glass block. */
const lattice = (
  points: PointList,
  rng: Rng,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  z: number,
  cols: number,
  rows: number,
  tone: number,
) => {
  const dx = (x1 - x0) / cols;
  const dy = (y1 - y0) / rows;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      points.add(
        x0 + (i + 0.5 + (rng() - 0.5) * 0.3) * dx,
        y0 + (j + 0.5 + (rng() - 0.5) * 0.3) * dy,
        z,
        0,
        0,
        1,
        tone,
      );
    }
  }
};

/** Sloped band on the front face that flares from half-width w0 at y0 to w1 at y1. */
const chamfer = (
  points: PointList,
  rng: Rng,
  y0: number,
  w0: number,
  y1: number,
  w1: number,
  tone: number,
  spacing: number,
) => {
  const rise = y1 - y0;
  const flare = w1 - w0;
  const slant = Math.hypot(rise, flare);
  const ny = -flare / slant;
  const nz = rise / slant;
  const rows = grid(slant, spacing);
  for (let j = 0; j < rows.cells; j++) {
    const t = (j + jitter(rng)) / rows.cells;
    const w = w0 + flare * t;
    const cols = grid(2 * w, spacing);
    for (let i = 0; i < cols.cells; i++) {
      if (rng() > rows.keep * cols.keep) continue;
      points.add(-w + (i + jitter(rng)) * cols.step, y0 + rise * t, w, 0, ny, nz, tone);
    }
  }
};

const ring = (
  points: PointList,
  rng: Rng,
  cy: number,
  z: number,
  radius: number,
  tone: number,
  spacing: number,
) => {
  const count = Math.max(12, Math.round((2 * Math.PI * radius) / spacing));
  for (let i = 0; i < count; i++) {
    const a = ((i + rng() * 0.5) / count) * Math.PI * 2;
    points.add(Math.sin(a) * radius, cy + Math.cos(a) * radius, z, 0, 0, 1, tone);
  }
};

const plazaSide = (points: PointList, rng: Rng, spacing: number) => {
  for (const tier of PLAZA) {
    rect(points, rng, 'z', tier.half, -tier.half, tier.half, tier.bottom, tier.top, 1, 0.5, spacing * 1.15);
    lineX(points, rng, -tier.half, tier.half, tier.top - 0.012, tier.half + 0.002, 0.85, spacing * 0.55);
  }
};

const plazaTops = (points: PointList, rng: Rng, spacing: number) => {
  let inner: number = TOWER.half;
  for (const tier of PLAZA) {
    const g = grid(2 * tier.half, spacing * 1.8);
    for (let i = 0; i < g.cells; i++) {
      for (let j = 0; j < g.cells; j++) {
        const x = -tier.half + (i + jitter(rng)) * g.step;
        const z = -tier.half + (j + jitter(rng)) * g.step;
        if (Math.abs(x) < inner && Math.abs(z) < inner) continue;
        points.add(x, tier.top, z, 0, 1, 0, 0.3);
      }
    }
    inner = tier.half;
  }
};

const baseFace = (points: PointList, rng: Rng, spacing: number, withPlaque: boolean) => {
  const { half, baseTop } = TOWER;
  rect(points, rng, 'z', half, -half, half, 0, baseTop, 1, 0.58, spacing, 0.3);
  if (withPlaque) {
    rect(points, rng, 'z', half + 0.004, -0.12, 0.12, 0.3, 0.45, 1, 0.95, spacing * 0.6);
  }
};

const shaftFace = (points: PointList, rng: Rng, spacing: number) => {
  const {
    half,
    baseTop,
    grilleTop,
    clockBottom,
    shaftTop,
    panelHalf,
    panelDepth,
    grilleHalf,
    grilleDepth,
    mullionSpacing,
  } = TOWER;
  const panelZ = half - panelDepth;
  const grilleZ = half - grilleDepth;

  // White corner piers either side of the recessed panel.
  rect(points, rng, 'z', half, -half, -panelHalf, grilleTop, shaftTop, 1, 1, spacing);
  rect(points, rng, 'z', half, panelHalf, half, grilleTop, shaftTop, 1, 1, spacing);
  rect(points, rng, 'z', half, -half, -grilleHalf, baseTop, grilleTop, 1, 1, spacing);
  rect(points, rng, 'z', half, grilleHalf, half, baseTop, grilleTop, 1, 1, spacing);

  rect(points, rng, 'x', -panelHalf, panelZ, half, grilleTop, clockBottom, 1, 0.85, spacing);
  rect(points, rng, 'x', panelHalf, panelZ, half, grilleTop, clockBottom, -1, 0.85, spacing);
  rect(points, rng, 'x', -grilleHalf, grilleZ, half, baseTop, grilleTop, 1, 0.8, spacing);
  rect(points, rng, 'x', grilleHalf, grilleZ, half, baseTop, grilleTop, -1, 0.8, spacing);

  // Glass-block panel split into bands by horizontal mullions.
  const panelHeight = clockBottom - grilleTop;
  const bands = Math.round(panelHeight / mullionSpacing);
  const bandHeight = panelHeight / bands;
  const cols = Math.min(7, Math.max(3, Math.round((2 * panelHalf) / (2 * spacing))));
  const rows = Math.max(2, Math.round(bandHeight / ((2 * panelHalf) / cols)));
  for (let b = 0; b < bands; b++) {
    const y0 = grilleTop + b * bandHeight;
    lattice(points, rng, -panelHalf, panelHalf, y0, y0 + bandHeight, panelZ, cols, rows, 0.6);
  }
  for (let b = 0; b <= bands; b++) {
    lineX(points, rng, -panelHalf, panelHalf, grilleTop + b * bandHeight, panelZ, 0.9, spacing * 0.5);
  }

  // Vertical grille at the foot of the panel.
  const bars = 7;
  for (let i = 0; i < bars; i++) {
    const x = -grilleHalf + ((i + 0.5) / bars) * 2 * grilleHalf;
    lineY(points, rng, x, baseTop, grilleTop, grilleZ, 0.72, spacing * 0.6);
  }
  rect(points, rng, 'z', grilleZ, -grilleHalf, grilleHalf, baseTop, grilleTop, 1, 0.25, spacing * 2);
};

/** A white dial on a dark plate, notched at 12, 3, 6 and 9. */
const clockFace = (points: PointList, rng: Rng, spacing: number, fine: number) => {
  const { half, clockHalf, clockBottom, shaftTop, dialY, dialRadius } = TOWER;
  rect(points, rng, 'z', half - 0.015, -clockHalf, clockHalf, clockBottom, shaftTop, 1, 0.22, spacing * 1.5);

  points.size = 0.8;
  points.dial = points.face;
  const pitch = spacing * DIAL_PITCH;
  const radius = dialRadius * 0.96;
  const g = grid(2 * radius, pitch);
  for (let i = 0; i < g.cells; i++) {
    for (let j = 0; j < g.cells; j++) {
      const x = -radius + (i + jitter(rng)) * g.step;
      const y = -radius + (j + jitter(rng)) * g.step;
      const r = Math.hypot(x, y);
      if (r > radius) continue;
      if (r > radius * 0.76 && Math.min(Math.abs(x), Math.abs(y)) < pitch * 0.6) continue;
      points.add(x, dialY + y, DIAL_Z, 0, 0, 1, 0.8);
    }
  }
  points.dial = -1;
  ring(points, rng, dialY, DIAL_Z, dialRadius, 1, fine);
  points.size = 1;
};

const capFace = (points: PointList, rng: Rng, spacing: number) => {
  const { half, shaftTop, corniceTop, corniceHalf, capBottom, capHalf, capTop } = TOWER;
  chamfer(points, rng, shaftTop, half, corniceTop, corniceHalf, 0.85, spacing);
  rect(points, rng, 'z', corniceHalf, -corniceHalf, corniceHalf, corniceTop, capBottom, 1, 0.95, spacing);
  rect(points, rng, 'y', capBottom, -capHalf, capHalf, corniceHalf, capHalf, -1, 0.7, spacing);
  rect(points, rng, 'z', capHalf, -capHalf, capHalf, capBottom, capTop, 1, 1, spacing);
  lineX(points, rng, -corniceHalf, corniceHalf, corniceTop + 0.012, corniceHalf + 0.002, 1, spacing * 0.5);
  lineX(points, rng, -capHalf, capHalf, capBottom + 0.035, capHalf + 0.002, 1, spacing * 0.5);
};

/**
 * Battlements along one side; each side owns its left corner merlon. The
 * camera never rises above the parapet, so the inner faces are left out and
 * the gaps between merlons stay open to the sky.
 */
const merlons = (points: PointList, rng: Rng, spacing: number) => {
  const { capHalf, capTop, merlonTop, merlonsPerSide } = TOWER;
  const gap = (2 * capHalf) / (3 * merlonsPerSide - 1);
  const width = 2 * gap;
  const inner = capHalf - width;
  for (let k = 0; k < merlonsPerSide - 1; k++) {
    const x0 = -capHalf + k * (width + gap);
    const x1 = x0 + width;
    rect(points, rng, 'z', capHalf, x0, x1, capTop, merlonTop, 1, 1, spacing);
    rect(points, rng, 'y', merlonTop, x0, x1, inner, capHalf, 1, 0.9, spacing);
    // The corner merlon's left end is the outer face of the neighbouring side.
    if (k === 0) rect(points, rng, 'x', x0, inner, capHalf, capTop, merlonTop, -1, 1, spacing);
    points.lean = 1;
    if (k > 0) rect(points, rng, 'x', x0, inner, capHalf, capTop, merlonTop, -1, 0.55, spacing);
    rect(points, rng, 'x', x1, inner, capHalf, capTop, merlonTop, 1, 0.55, spacing);
    points.lean = 0;
  }
};

const lightningRod = (points: PointList, fine: number) => {
  const { capTop, rodTop } = TOWER;
  points.size = 0.75;
  for (let y = capTop; y <= rodTop; y += fine) points.add(0, y, 0, 0, 0, 0, 0.8);
  for (let x = -0.05; x <= 0.05; x += fine) points.add(x, rodTop - 0.09, 0, 0, 0, 0, 0.8);
  points.size = 1;
};

const secondHand = (points: PointList, face: number, fine: number) => {
  const radius = TOWER.dialRadius;
  points.face = face;
  points.size = 0.85;
  points.tint = TINT_SECOND_HAND;
  for (let d = -SECOND_HAND.tail * radius; d <= SECOND_HAND.length * radius; d += fine * 0.9) {
    points.add(0, 0, 0, 0, 0, 1, 1, face, d);
  }
  points.tint = TINT_TOWER;
  points.size = 1;
};

const pack = (list: PointList, handGap: readonly [number, number]): TowerPoints => {
  const v = list.values;
  const count = v.length / FIELDS;
  const points: TowerPoints = {
    count,
    position: new Float32Array(count * 3),
    normal: new Float32Array(count * 3),
    tone: new Float32Array(count),
    size: new Float32Array(count),
    tint: new Uint8Array(count),
    hand: new Int8Array(count),
    handAlong: new Float32Array(count),
    dial: new Int8Array(count),
    handGap,
  };
  for (let i = 0; i < count; i++) {
    const o = i * FIELDS;
    for (let axis = 0; axis < 3; axis++) {
      points.position[i * 3 + axis] = v[o + axis];
      points.normal[i * 3 + axis] = v[o + 3 + axis];
    }
    points.tone[i] = v[o + 6];
    points.size[i] = v[o + 7];
    points.tint[i] = v[o + 8];
    points.hand[i] = v[o + 9];
    points.handAlong[i] = v[o + 10];
    points.dial[i] = v[o + 11];
  }
  return points;
};

/** Samples the tower so neighbouring points sit roughly `spacing` model units apart. */
export const buildTowerPoints = (spacing: number): TowerPoints => {
  const rng = createRng(1993);
  const points = new PointList();
  const fine = spacing * 0.45;
  for (let face = 0; face < 4; face++) {
    points.face = face;
    plazaSide(points, rng, spacing);
    baseFace(points, rng, spacing, face === 0);
    shaftFace(points, rng, spacing);
    clockFace(points, rng, spacing, fine);
    capFace(points, rng, spacing);
    merlons(points, rng, spacing);
  }
  points.face = 0;
  plazaTops(points, rng, spacing);
  lightningRod(points, fine);
  for (let face = 0; face < 4; face++) secondHand(points, face, fine);

  // A gap narrower than the dial's point pitch would vanish into the stipple.
  const pitch = spacing * DIAL_PITCH;
  const radius = TOWER.dialRadius;
  return pack(points, [
    Math.max((HANDS[0].width * radius) / 2, pitch * 1.15),
    Math.max((HANDS[1].width * radius) / 2, pitch * 0.8),
  ]);
};

/** Writes the model-space position of a second-hand point; `sin` and `cos` are of the hand angle. */
export const poseSecondHand = (
  face: number,
  along: number,
  sin: number,
  cos: number,
  out: Float32Array,
  offset: number,
) => {
  const x = sin * along;
  const c = FACE_COS[face];
  const s = FACE_SIN[face];
  out[offset] = x * c + HAND_Z * s;
  out[offset + 1] = TOWER.dialY + cos * along;
  out[offset + 2] = HAND_Z * c - x * s;
};

/**
 * Whether dial point `i` lies under the hour or minute hand. `sin` and `cos`
 * hold the hour and minute hand angles, clockwise from 12.
 */
export const isUnderHand = (points: TowerPoints, i: number, sin: ArrayLike<number>, cos: ArrayLike<number>) => {
  const face = points.dial[i];
  if (face < 0) return false;
  const o = i * 3;
  const x = points.position[o] * FACE_COS[face] - points.position[o + 2] * FACE_SIN[face];
  const y = points.position[o + 1] - TOWER.dialY;
  for (let k = 0; k < HANDS.length; k++) {
    const along = x * sin[k] + y * cos[k];
    const across = x * cos[k] - y * sin[k];
    const { length, tail } = HANDS[k];
    if (
      along > -tail * TOWER.dialRadius &&
      along < length * TOWER.dialRadius &&
      Math.abs(across) < points.handGap[k]
    ) {
      return true;
    }
  }
  return false;
};
