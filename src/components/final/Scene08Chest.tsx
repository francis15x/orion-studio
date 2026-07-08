"use client";

import { useEffect, useState } from "react";

type Props = {
  teamName: string;
};

export default function Scene08Chest({ teamName }: Props) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1200),
      setTimeout(() => setStep(2), 3200),
      setTimeout(() => setStep(3), 5200),
      setTimeout(() => setStep(4), 7600),
    ];

    if (navigator.vibrate) {
      navigator.vibrate([200, 120, 200]);
    }

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <main className="min-h-screen bg-black text-cyan-300 flex items-center justify-center px-6">
      <section className="w-full max-w-xl text-center font-mono">
        <p className="text-cyan-500 tracking-[0.35em] text-xs mb-10">
          ORION VAULT ACCESS
        </p>

        {step >= 1 && (
          <p className="text-2xl animate-pulse mb-8">
            AUTHENTIFICATION...
          </p>
        )}

        {step >= 2 && (
          <div className="border border-cyan-500 rounded-2xl p-6 mb-8">
            <p className="text-cyan-500 text-sm">ÉQUIPE RECONNUE</p>
            <p className="text-3xl font-black text-white mt-3">
              {teamName}
            </p>
          </div>
        )}

        {step === 3 && (
  <div className="text-7xl mb-8 animate-pulse">
    🔒
  </div>
)}

{step >= 4 && (
  <>
    <div className="text-7xl mb-8">
      🔓
    </div>

            <h1 className="text-5xl font-black text-yellow-300 mb-6">
              COFFRE AUTORISÉ
            </h1>

            <p className="text-white text-xl">
              Accès accordé par ORION.
            </p>
          </>
        )}
      </section>
    </main>
  );
}