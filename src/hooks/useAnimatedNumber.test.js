import { describe, expect, it } from "vitest";
import { animatedValueAt, easeOutExpo } from "./useAnimatedNumber.js";

describe("easeOutExpo — the curve each animation frame is shaped by", () => {
  it("is pinned at both ends so the figure starts and lands exactly", () => {
    expect(easeOutExpo(0)).toBe(0);
    expect(easeOutExpo(1)).toBe(1);
  });

  it("clamps outside [0,1] rather than overshooting", () => {
    expect(easeOutExpo(-0.5)).toBe(0);
    expect(easeOutExpo(1.5)).toBe(1);
  });

  it("front-loads progress — most of the move happens early (calm tail)", () => {
    // easeOutExpo is past its halfway point well before t=0.5.
    expect(easeOutExpo(0.5)).toBeGreaterThan(0.9);
    expect(easeOutExpo(0.1)).toBeGreaterThan(0.4);
  });
});

describe("animatedValueAt — the value shown at a moment mid-roll", () => {
  it("shows exactly `from` at the start and exactly `to` at the end", () => {
    expect(animatedValueAt(100, 200, 0, 600)).toBe(100);
    expect(animatedValueAt(100, 200, 600, 600)).toBe(200);
  });

  it("holds at `to` past the end, never beyond it", () => {
    expect(animatedValueAt(100, 200, 5000, 600)).toBe(200);
  });

  it("moves monotonically toward the target for a rising figure", () => {
    const from = 47.2;
    const to = 90;
    let prev = from;
    for (let elapsed = 0; elapsed <= 600; elapsed += 60) {
      const v = animatedValueAt(from, to, elapsed, 600);
      expect(v).toBeGreaterThanOrEqual(prev - 1e-9);
      expect(v).toBeLessThanOrEqual(to + 1e-9);
      prev = v;
    }
  });

  it("rolls downward too, for a falling rate", () => {
    const midpoint = animatedValueAt(200, 100, 120, 600);
    expect(midpoint).toBeLessThan(200);
    expect(midpoint).toBeGreaterThan(100);
  });

  it("produces genuinely in-between frames (an actual tween, not a snap)", () => {
    const frames = [0, 30, 60, 120, 240, 360].map((ms) =>
      Number(animatedValueAt(0, 100, ms, 600).toFixed(2)),
    );
    expect(new Set(frames).size).toBeGreaterThan(3);
  });

  it("degenerate zero-duration animations resolve straight to the target", () => {
    expect(animatedValueAt(10, 20, 0, 0)).toBe(20);
  });
});
