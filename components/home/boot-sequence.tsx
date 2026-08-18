"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const BOOT_LINES = [
  "INITIALIZING TARKWA ROBOTIC HUB...",
  "LOADING LEARNING MODULES........[ OK ]",
  "CONNECTING CLUB NETWORK.........[ OK ]",
  "CALIBRATING SENSORS.............[ OK ]",
  "SYSTEMS READY.",
];

/**
 * Signature homepage element: a brief robot boot-up sequence plays
 * before the hero reveals itself — a literal "powering on" moment that
 * gives the futuristic-robotics-interface brief a real, functional home
 * rather than a decorative gradient. Skips instantly for users with
 * prefers-reduced-motion, and never blocks content from search engines
 * or non-JS clients since the hero underneath is always in the DOM.
 */
export function BootSequence({ children }: { children: React.ReactNode }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [booted, setBooted] = useState(false);
  const [skip, setSkip] = useState(false);

  // Runs once on mount to sync from an external system (the browser's
  // motion preference) — separated from the timer effect below so it
  // doesn't re-check matchMedia on every boot-line tick. matchMedia can't
  // be read during SSR/render, so a mount effect is the correct place for
  // this; react-hooks/set-state-in-effect doesn't special-case that.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSkip(true);
      setBooted(true);
    }
  }, []);

  useEffect(() => {
    if (skip) return;

    if (visibleLines < BOOT_LINES.length) {
      const t = setTimeout(() => setVisibleLines((v) => v + 1), 220);
      return () => clearTimeout(t);
    }

    const finish = setTimeout(() => setBooted(true), 400);
    return () => clearTimeout(finish);
  }, [visibleLines, skip]);

  return (
    <div className="relative">
      <AnimatePresence>
        {!booted && !skip && (
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-background"
          >
            <div className="w-full max-w-md px-6 font-mono text-sm text-primary">
              {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
                <p key={i} className="leading-relaxed">
                  <span className="text-muted">{"> "}</span>
                  {line}
                </p>
              ))}
              <span className="inline-block h-4 w-2 animate-pulse bg-primary align-middle" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: booted ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
