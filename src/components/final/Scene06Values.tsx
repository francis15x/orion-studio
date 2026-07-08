"use client";

import { useEffect, useState } from "react";

const values = [
  "🤝 Le Partage",
  "💧 La Vie",
  "⛪ Le Patrimoine",
  "🏰 La Protection",
  "🕊️ La Mémoire",
  "🎠 L'Apprentissage",
  "🧺 La Transmission",
  "🏛️ La Citoyenneté",
  "🌺 Le Souvenir",
  "⛏️ Le Travail",
  "🏡 La Famille",
  "✨ L'Espérance",
];

export default function Scene06Values() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((current) => {
        if (current >= values.length) {
          clearInterval(interval);
          return current;
        }

        return current + 1;
      });
    }, 700);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-black text-cyan-300 flex items-center justify-center px-6">
      <section className="w-full max-w-2xl text-center font-mono">
        <p className="text-cyan-500 tracking-[0.35em] text-xs mb-8">
          ORION VALUES RESTORED
        </p>

        <h1 className="text-4xl font-black text-cyan-400 mb-10">
          VALEURS RESTAURÉES
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {values.slice(0, count).map((value, index) => (
            <div
              key={index}
              className="border border-cyan-500/40 rounded-xl p-4 bg-cyan-950/20"
            >
              {value}
            </div>
          ))}
        </div>

        {count >= values.length && (
          <p className="mt-10 text-white text-xl leading-relaxed">
            Vous n'avez pas seulement retrouvé un trésor.
            <br />
            Vous avez redonné vie aux valeurs qui ont construit Champagnac.
          </p>
        )}
      </section>
    </main>
  );
}