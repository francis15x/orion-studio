"use client";

import TypewriterText from "../TypewriterText";

const lines = [
  "Je comprends enfin...",
  "",
  "pourquoi j'ai été créé.",
  "",
  "Je ne protège pas",
  "un coffre.",
  "",
  "Je protège...",
  "",
  "la mémoire de Champagnac."
];

export default function Scene05Reveal() {
  return (
    <main className="min-h-screen bg-white text-[#050816] flex items-center justify-center px-8">
      <section className="max-w-3xl w-full text-center">
        <p className="text-cyan-700 tracking-[0.35em] text-sm mb-12 font-mono">
          ORION REVELATION
        </p>

        <div className="text-3xl leading-loose font-mono">
          <TypewriterText lines={lines} speed={55} />
        </div>

        <h1 className="mt-14 text-5xl font-black text-cyan-700 animate-pulse">
          MÉMOIRE DE CHAMPAGNAC
        </h1>
      </section>
    </main>
  );
}