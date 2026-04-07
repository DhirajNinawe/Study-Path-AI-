"use client";

// components/hero-landing.tsx
// New dramatic root landing page — green particle flow animation + Login/Sign Up buttons
// Uses a pure canvas-based particle system (no external deps needed)

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Brain, Sparkles, Zap, Target, BarChart3, Globe } from "lucide-react";

const FEATURES = [
  { icon: Brain, label: "AI-Powered Plans", desc: "Adaptive study paths" },
  { icon: Target, label: "Smart Diagnostics", desc: "Know your gaps" },
  { icon: BarChart3, label: "Progress Tracking", desc: "Visual analytics" },
  { icon: Zap, label: "Gamified Learning", desc: "XP & streaks" },
  { icon: Globe, label: "Multilingual AI", desc: "EN · HI · Hinglish · MR" },
  { icon: Sparkles, label: "Groq-Powered", desc: "Ultra-fast responses" },
];

/* ── Canvas Particle System ──────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = 0, h = 0;

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      radius: number; alpha: number; alphaDir: number;
    }

    const particles: Particle[] = [];
    const COUNT = 90;

    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };

    const spawn = (): Particle => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 2.5 + 0.5,
      alpha: Math.random() * 0.6 + 0.1,
      alphaDir: Math.random() > 0.5 ? 0.005 : -0.005,
    });

    resize();
    for (let i = 0; i < COUNT; i++) particles.push(spawn());

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(34, 197, 94, ${(1 - dist / 120) * 0.15})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.alphaDir;
        if (p.alpha > 0.8 || p.alpha < 0.1) p.alphaDir *= -1;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 197, 94, ${p.alpha})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.7 }}
    />
  );
}

/* ── Hero Landing Page ───────────────────────────────────── */
export function HeroLanding() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#040a06] relative overflow-hidden flex flex-col">
      {/* Particle canvas */}
      <div className="absolute inset-0">
        <ParticleCanvas />
      </div>

      {/* Deep radial green glow at bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-green-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
            <Brain className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
          </div>
          <span className="text-lg font-bold text-white">StudyPath AI</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/auth?mode=login")}
            className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
          >
            Login
          </button>
          <button
            onClick={() => router.push("/auth?mode=signup")}
            className="text-sm bg-green-600 hover:bg-green-500 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-green-500/25 hover:shadow-lg"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-green-400 font-medium">AI-Powered Learning Platform</span>
        </div>

        {/* Main headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-white max-w-4xl leading-tight tracking-tight mb-6">
          Master Any Subject with{" "}
          <span className="text-transparent bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text">
            AI Intelligence
          </span>
        </h1>

        <p className="text-lg md:text-xl text-white/50 max-w-2xl mb-12 leading-relaxed">
          Personalized diagnostics, adaptive study plans, and a multilingual AI tutor — all in one platform designed for students who want to learn smarter.
        </p>

        {/* CTA Buttons — perfectly aligned */}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <button
            id="hero-signup-btn"
            onClick={() => router.push("/auth?mode=signup")}
            className="group flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold text-base px-8 py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:shadow-xl active:scale-[0.97]"
          >
            <Sparkles className="w-4 h-4 transition-transform group-hover:scale-110" />
            Get Started Free
          </button>
          <button
            id="hero-login-btn"
            onClick={() => router.push("/auth?mode=login")}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-semibold text-base px-8 py-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-200 active:scale-[0.97]"
          >
            Sign In
          </button>
        </div>

        {/* Language strip */}
        <p className="mt-8 text-xs text-white/30 flex items-center gap-2 flex-wrap justify-center">
          <Globe className="w-3.5 h-3.5 text-green-500/60" />
          Speaks English · हिंदी · Hinglish · मराठी
        </p>
      </main>

      {/* Feature grid */}
      <div className="relative z-10 px-6 md:px-12 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 bg-white/3 hover:bg-white/6 border border-white/6 hover:border-green-500/20 rounded-2xl p-4 text-center transition-all duration-300 cursor-default"
            >
              <div className="w-9 h-9 bg-green-500/10 rounded-xl flex items-center justify-center">
                <Icon className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-xs font-semibold text-white/80">{label}</span>
              <span className="text-[11px] text-white/35">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="relative z-10 text-center pb-6">
        <p className="text-xs text-white/20">© 2025 StudyPath AI · Built for students</p>
      </div>
    </div>
  );
}
