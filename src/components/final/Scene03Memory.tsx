"use client";

import TypewriterText from "../TypewriterText";

const lines = [
  "Je...",
  "",
  "me souviens.",
  "",
  "Au début...",
  "",
  "je pensais avoir perdu des données.",
  "",
  "Je me trompais.",
  "",
  "J'avais perdu...",
  "",
  "la mémoire d'un peuple.",
];

export default function Scene03Memory() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-8">

      <section className="max-w-3xl w-full">

        <div className="text-center">

          <h1 className="text-5xl font-black text-white mb-16">
            ORION
          </h1>

        </div>

        <div className="text-2xl leading-loose text-cyan-300 font-mono">

          <TypewriterText lines={lines} />

        </div>

      </section>

    </main>
  );
}