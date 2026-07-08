"use client";

import { useState } from "react";

type Props = {
  teamName: string;
};

export default function Scene10Organizer({ teamName }: Props) {
  const [opened, setOpened] = useState(false);

  return (
    <main className="min-h-screen bg-black text-cyan-300 flex items-center justify-center px-6">
      <section className="w-full max-w-xl text-center font-mono border border-cyan-500 rounded-2xl p-8 shadow-[0_0_45px_rgba(0,194,255,0.25)]">
        <p className="tracking-[0.35em] text-xs text-cyan-500 mb-8">
          ORION SYSTEM RESTORED
        </p>

        <h1 className="text-5xl font-black text-cyan-400 mb-8">
          MISSION TERMINÉE
        </h1>

        <p className="text-white text-2xl font-bold mb-10">
          {teamName}
        </p>

        {!opened ? (
          <button
            type="button"
            onClick={() => setOpened(true)}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-black rounded-lg py-5 font-black text-xl"
          >
            🔓 OUVRIR LE COFFRE
          </button>
        ) : (
          <div className="mt-8">
            <h2 className="text-3xl font-black text-yellow-300 mb-6">
              AUTORISATION CONFIRMÉE
            </h2>

            <p className="text-white text-xl leading-relaxed">
              Présentez cet écran
              <br />
              à l'organisateur.
              <br />
              <br />
              Votre mission est terminée.
            </p>

            <p className="mt-10 text-cyan-500 tracking-[0.3em] text-xs">
              ORION EN VEILLE
            </p>
          </div>
        )}
      </section>
    </main>
  );
}