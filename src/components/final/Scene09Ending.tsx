"use client";

import TypewriterText from "../TypewriterText";

const lines = [
  "Pendant cette mission...",
  "",
  "je vous appelais",
  "utilisateurs.",
  "",
  "Aujourd'hui...",
  "",
  "je peux enfin",
  "vous appeler autrement.",
  "",
  "Merci...",
  "",
  "Gardiens de la Mémoire.",
  "",
  "",
  "Les trésors disparaissent.",
  "",
  "Les bâtiments vieillissent.",
  "",
  "Les générations passent.",
  "",
  "Mais une histoire transmise...",
  "",
  "ne meurt jamais."
];

export default function Scene09Ending() {
  return (
    <main className="min-h-screen bg-black text-cyan-300 flex items-center justify-center px-8">
      <section className="max-w-3xl text-center font-mono">

        <p className="tracking-[0.35em] text-xs text-cyan-500 mb-10">
          ORION SYSTEM
        </p>

        <h1 className="text-5xl font-black text-cyan-400 mb-12">
          ORION
        </h1>

        <TypewriterText lines={lines} speed={50} />

      </section>
    </main>
  );
}