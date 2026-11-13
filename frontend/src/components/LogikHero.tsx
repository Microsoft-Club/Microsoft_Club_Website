import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { createClockTowerScene } from './logik/clockTowerScene';
import { formatGikiTime } from './logik/gikiTime';

const GikiClock = () => {
  const [time, setTime] = useState(() => formatGikiTime());

  useEffect(() => {
    let timeout = 0;
    const tick = () => {
      setTime(formatGikiTime());
      timeout = window.setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    timeout = window.setTimeout(tick, 1000 - (Date.now() % 1000));
    return () => window.clearTimeout(timeout);
  }, []);

  return <span className="logik-hero-clock">{time}</span>;
};

const LogikHero = () => {
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const towerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const canvas = canvasRef.current;
    const slot = towerRef.current;
    if (!hero || !canvas || !slot) return undefined;
    const scene = createClockTowerScene({ canvas, hero, slot });
    return scene.destroy;
  }, []);

  return (
    <section ref={heroRef} className="logik-hero" aria-labelledby="logik-hero-title">
      <canvas ref={canvasRef} className="logik-hero-canvas" aria-hidden="true" />

      <div className="logik-hero-layout">
        <div className="logik-hero-copy">
          <p className="logik-hero-kicker">LoGIK · Landmark of Ghulam Ishaq Khan</p>
          <h1 id="logik-hero-title" className="logik-hero-title">
            Microsoft Club GIKI
          </h1>
          <p className="logik-hero-text">
            The student tech community at GIKI. We learn, build, and lead with
            technology through workshops, hackathons, projects, and the
            Logikal podcast.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/events" className="pixel-button logik-hero-button">
              Explore Events
            </Link>
            <Link to="/projects" className="pixel-button logik-hero-button-ghost">
              See Projects
            </Link>
          </div>
        </div>

        <div
          ref={towerRef}
          className="logik-hero-tower"
          role="img"
          aria-label="LoGIK, the GIKI clock tower, drawn in particles with its clocks showing the time at GIKI"
        />

        <div className="logik-hero-meta">
          <p className="logik-hero-meta-label">Time at LoGIK</p>
          <GikiClock />
          <p className="logik-hero-meta-label">PKT · UTC+05:00</p>
          <p className="logik-hero-meta-coords">
            34.0687° N, 72.6449° E
            <br />
            Topi, Khyber Pakhtunkhwa
          </p>
        </div>
      </div>

      <a href="#home-content" className="logik-hero-cue" aria-label="Scroll to the rest of the page">
        <span />
      </a>
    </section>
  );
};

export default LogikHero;
