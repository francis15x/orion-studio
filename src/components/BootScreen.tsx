"use client";

import { useEffect, useState } from "react";

const bootMessages = [
  "INITIALISATION DU SYSTÈME ORION...",
  "CONNEXION AU RÉSEAU DES GARDIENS...",
  "ANALYSE DE L'ÉQUIPE...",
  "PROTOCOLE D'ACCÈS ACTIVÉ...",
  "ÉQUIPE DÉTECTÉE.",
];

export default function BootScreen() {
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((current) => {
        if (current >= bootMessages.length - 1) {
          clearInterval(interval);
          setTimeout(() => setReady(true), 800);
          return current;
        }

        return current + 1;
      });
    }, 900);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#050816] text-[#E8F1FF] flex items-center justify-center px-6">
      <div className="w-full max-w-xl text-center border border-cyan-400/30 rounded-2xl p-10 shadow-[0_0_40px_rgba(0,194,255,0.15)]">

        <p className="text-cyan-400 text-sm tracking-[0.35em] mb-6">
          ORION SYSTEM
        </p>

        <h1 className="text-6xl font-black tracking-[0.45em] text-cyan-400 mb-8">
          ORION
        </h1>

        <p className="min-h-8 text-gray-300 font-mono">
          {bootMessages[step]}
        </p>

        <div className="w-full h-2 bg-slate-800 rounded-full mt-8 overflow-hidden">
          <div
            className="h-full bg-cyan-400 transition-all duration-700"
            style={{
              width: `${((step + 1) / bootMessages.length) * 100}%`,
            }}
          />
        </div>

        {ready && (
          <button className="mt-10 px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 transition font-bold text-lg text-white">
            COMMENCER LA MISSION
          </button>
        )}
      </div>
    </main>
  );
}