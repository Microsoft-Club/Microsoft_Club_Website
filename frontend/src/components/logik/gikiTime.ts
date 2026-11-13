const GIKI_TIME_ZONE = 'Asia/Karachi';
const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;
const TAU = Math.PI * 2;

let offsetMs: number | null = null;

const resolveOffset = () => {
  try {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: GIKI_TIME_ZONE,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hourCycle: 'h23',
    }).formatToParts(now);
    const part = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((p) => p.type === type)?.value);
    const wallClockAsUtc = Date.UTC(
      part('year'),
      part('month') - 1,
      part('day'),
      part('hour'),
      part('minute'),
      part('second'),
    );
    const offset = Math.round((wallClockAsUtc - now.getTime()) / 60000) * 60000;
    return Number.isFinite(offset) ? offset : PKT_OFFSET_MS;
  } catch {
    return PKT_OFFSET_MS;
  }
};

/** The wall-clock time at GIKI, read through the returned Date's UTC getters. */
export const gikiWallClock = (now = Date.now()) => {
  offsetMs ??= resolveOffset();
  return new Date(now + offsetMs);
};

export const formatGikiTime = (now = Date.now()) => {
  const t = gikiWallClock(now);
  return [t.getUTCHours(), t.getUTCMinutes(), t.getUTCSeconds()]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
};

/** Hour, minute and second hand angles in radians, clockwise from 12. */
export const gikiHandAngles = (out: Float64Array, now = Date.now()) => {
  const t = gikiWallClock(now);
  const seconds = t.getUTCSeconds();
  const minutes = t.getUTCMinutes() + seconds / 60;
  const hours = (t.getUTCHours() % 12) + minutes / 60;
  out[0] = (hours / 12) * TAU;
  out[1] = (minutes / 60) * TAU;
  out[2] = (seconds / 60) * TAU;
};
