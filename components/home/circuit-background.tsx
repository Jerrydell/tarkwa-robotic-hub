"use client";

/**
 * Decorative animated circuit-trace background. Pure SVG, no external
 * assets. Signal pulses travel along the traces on loop to give the hero
 * a "live system" feel without being distracting.
 *
 * Uses native SVG <animateMotion> rather than Framer Motion for the
 * path-following animation: Framer Motion doesn't reliably treat
 * offset-distance as an animatable SVG value in this setup (it gets
 * forwarded as a raw, unrecognized DOM prop, which React warns about).
 * animateMotion is the standard, well-supported primitive for exactly
 * this — no JS animation-library involvement needed for it at all.
 */
export function CircuitBackground() {
  const paths = [
    "M0,80 L200,80 L240,40 L500,40 L540,80 L800,80",
    "M0,220 L150,220 L190,260 L450,260 L490,220 L800,220",
    "M0,340 L300,340 L340,300 L600,300 L640,340 L800,340",
  ];

  return (
    <svg
      aria-hidden
      viewBox="0 0 800 400"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full opacity-40"
    >
      {paths.map((d, i) => (
        <g key={i}>
          <path d={d} stroke="#262A33" strokeWidth="1.5" fill="none" />
          <circle r="4" fill="#3ECFFF" filter="url(#glow)">
            <animateMotion
              dur={`${5 + i}s`}
              begin={`${i * 1.2}s`}
              repeatCount="indefinite"
              path={d}
            />
          </circle>
        </g>
      ))}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
