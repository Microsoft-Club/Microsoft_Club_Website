import { useEffect, useState } from 'react';

const CLOCK_TICK_MS = 30_000;

export const formatClock = (date: Date): string =>
  date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

/** Current time, refreshed every 30 seconds (minute precision is all the UI shows). */
export const useClock = (): Date => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), CLOCK_TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  return now;
};
