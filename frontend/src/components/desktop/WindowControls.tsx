const WindowControls = () => (
  <span className="win-controls" aria-hidden="true">
    <span className="win-ctl">
      <svg viewBox="0 0 12 12"><path d="M2 9h8" stroke="#000" strokeWidth="2.5" strokeLinecap="round" /></svg>
    </span>
    <span className="win-ctl win-ctl--close">
      <svg viewBox="0 0 12 12"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="#000" strokeWidth="2.5" strokeLinecap="round" /></svg>
    </span>
  </span>
);

export default WindowControls;
