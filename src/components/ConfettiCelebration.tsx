"use client";

import confetti from "canvas-confetti";
import { createRoot } from "react-dom/client";
import { useEffect, useRef } from "react";

// ── Cat component ────────────────────────────────────────
function SpinningCat({ onDone }: { onDone: () => void }) {
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = catRef.current;
    if (!el) return;

    // start from right off-screen
    el.style.transform = "translateX(110vw)";

    let pos = window.innerWidth + 100;
    let direction = -1; // moving left first
    const isMobile = window.innerWidth < 768;
    const maxBounces = 1;
    const totalDuration = isMobile ? 6500 : 5000;
    const travelDistance = window.innerWidth * (maxBounces + 1) + 400;
    const fps = 60;
    const totalFrames = (totalDuration / 1000) * fps;

    const speed = travelDistance / totalFrames;

    let bounces = 0;
    let raf: number;
    let done = false;

    const animate = () => {
      if (done) return;

      pos += speed * direction;

      el.style.transform = `
    translateX(${pos}px)
    scaleX(${direction === -1 ? 1 : -1})
  `;

      // left edge
      if (pos <= -120) {
        bounces++;

        if (bounces >= maxBounces) {
          exitRight();
          return;
        }

        direction = 1;
      }

      // right edge
      if (pos >= window.innerWidth + 100) {
        direction = -1;
      }

      raf = requestAnimationFrame(animate);
    };

    const exitRight = () => {
      const exit = () => {
        pos += speed * 1.8;

        el.style.transform = `
      translateX(${pos}px)
      scaleX(-1)
    `;

        if (pos < window.innerWidth + 300) {
          requestAnimationFrame(exit);
        } else {
          done = true;
          onDone();
        }
      };

      requestAnimationFrame(exit);
    };

    // small delay before starting
    setTimeout(() => {
      raf = requestAnimationFrame(animate);
    }, 100);

    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <div
      ref={catRef}
      className="fixed z-9999 pointer-events-none"
      style={{
        bottom: "80px",
        fontSize: "64px",
        filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
        transition: "none",
        willChange: "transform",
      }}
    >
      {/* nyan cat gif from tenor */}
      <img
        src="https://media.tenor.com/uOdxKIOC4tgAAAAi/cat.gif"
        alt="spinning cat"
        width={800}
        height={800}
        style={{ borderRadius: "50%" }}
      />
    </div>
  );
}

// ── Better clap sound using oscillators ─────────────────
function playTrumpet(duration: number) {
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof window.AudioContext })
      .webkitAudioContext;

  const ctx = new AudioCtx();

  const now = ctx.currentTime;

  function playNote(freq: number, start: number, length: number, gain = 0.18) {
    // stack harmonics → brass feel
    [1, 2, 3].forEach((multiplier, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "sawtooth";

      osc.frequency.setValueAtTime(freq * multiplier, start);

      filter.type = "lowpass";
      filter.frequency.value = 3000;

      g.gain.setValueAtTime(0, start);

      // trumpet attack
      g.gain.linearRampToValueAtTime(gain / (i + 1), start + 0.03);

      // decay
      g.gain.exponentialRampToValueAtTime(0.001, start + length);

      osc.connect(filter);
      filter.connect(g);
      g.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + length);
    });
  }

  // triumphant fanfare
  const melody = [
    { f: 392, t: 0.0, d: 0.28 }, // G4
    { f: 523, t: 0.3, d: 0.28 }, // C5
    { f: 659, t: 0.6, d: 0.35 }, // E5
    { f: 784, t: 1.0, d: 0.7 }, // G5
  ];

  melody.forEach((note) => playNote(note.f, now + note.t, note.d));

  // optional celebratory ending chord
  [523, 659, 784].forEach((freq) => playNote(freq, now + 1.8, 1.2, 0.12));

  return ctx;
}

// ── Confetti burst ───────────────────────────────────────
function fireConfetti() {
  const count = 250;
  const defaults = { origin: { y: 0.1 }, zIndex: 9998 };

  const fire = (particleRatio: number, opts: confetti.Options) => {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  };

  fire(0.25, { spread: 26, startVelocity: 55, colors: ["#a855f7", "#7c3aed"] });
  fire(0.2, { spread: 60, colors: ["#22c55e", "#16a34a"] });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ["#f59e0b", "#d97706"],
  });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}

// ── Main trigger function ────────────────────────────────
export function triggerCelebration() {
  fireConfetti();

  // mount cat into a portal div
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  // estimate cat animation duration — 3 bounces at speed 7 across ~1400px ≈ 4.5s
  const catDuration = 6.5;
  const audioCtx = playTrumpet(catDuration);

  const cleanup = () => {
    setTimeout(() => {
      root.unmount();
      document.body.removeChild(container);
      audioCtx.close();
    }, 300);
  };

  root.render(<SpinningCat onDone={cleanup} />);
}
