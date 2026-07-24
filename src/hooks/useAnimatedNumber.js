import { useEffect, useRef, useState } from "react";

/*
  Eases a displayed number toward `target` so money figures roll into
  place instead of snapping — the "animated balance updates / smooth
  number interpolation" the design brief asks for. The caller still
  formats the returned value (formatKES etc.), so on-screen precision
  and identity are unchanged; only the in-between frames are new.

  Two deliberate restraints, so this reads as polish rather than a
  gimmick:
    • First real value snaps. We never count up from zero on load —
      that would slow perceived performance and animate async data
      (rates, portfolio) arriving rather than a genuine change. Only
      updates *after* the first meaningful value animate.
    • prefers-reduced-motion is honoured here in JS. The global CSS
      reduced-motion rule can't reach requestAnimationFrame, so this
      hook checks the query itself and hard-snaps when it's set.
*/
// easeOutExpo — quick to settle, calm tail; mirrors the --ease-tender
// curve used for the rest of the app's motion. Pure and exported so the
// tween the rAF loop drives can be unit-tested without a DOM.
export function easeOutExpo(t) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return 1 - Math.pow(2, -10 * t);
}

// The value shown `elapsed`ms into an animation from `from` to `to` over
// `duration`ms. This is exactly what the requestAnimationFrame step
// computes each frame, factored out so it's deterministically testable.
export function animatedValueAt(from, to, elapsed, duration) {
  if (duration <= 0) return to;
  const t = Math.min(1, Math.max(0, elapsed / duration));
  return from + (to - from) * easeOutExpo(t);
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// requestAnimationFrame is paused while a tab is backgrounded, so an
// animation started there would never run its steps and the figure would
// sit on the old value until the tab is foregrounded. For a money figure
// that's a correctness bug, not just a missed flourish — snap instead, so
// a hidden tab always holds the true current value and only animates once
// it's actually on screen.
function documentHidden() {
  return typeof document !== "undefined" && document.hidden === true;
}

export function useAnimatedNumber(target, { duration = 620 } = {}) {
  const numericTarget = Number(target) || 0;
  const [value, setValue] = useState(numericTarget);
  const fromRef = useRef(numericTarget);
  const seededRef = useRef(numericTarget !== 0);
  const rafRef = useRef(0);

  useEffect(() => {
    const to = numericTarget;
    const from = fromRef.current;

    // Snap the first meaningful value, every change under reduced-motion,
    // and any change while the tab is hidden (rAF is paused there) with no
    // interpolation.
    if (!seededRef.current || prefersReducedMotion() || documentHidden()) {
      seededRef.current = seededRef.current || to !== 0;
      fromRef.current = to;
      setValue(to);
      return undefined;
    }

    if (from === to) return undefined;

    let start = 0;
    const step = (now) => {
      if (!start) start = now;
      const elapsed = now - start;
      setValue(animatedValueAt(from, to, elapsed, duration));
      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [numericTarget, duration]);

  return value;
}
