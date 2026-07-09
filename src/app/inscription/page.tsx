"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function InscriptionPage() {
  const router = useRouter();

  const [teamName, setTeamName] = useState("");
  const [playersCount, setPlayersCount] = useState(2);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1400),
      setTimeout(() => setPhase(4), 1900),
    ];

    playSound("beep");

    return () => timers.forEach(clearTimeout);
  }, []);

  function playSound(sound: string) {
    const audio = new Audio(`/sounds/${sound}.wav`);
    audio.volume = 0.35;
    audio.play().catch(() => {});
  }

  async function registerTeam() {
    if (teamName.trim().length < 3) {
      playSound("error");
      setMessage("Nom d'équipe trop court.");
      return;
    }

    if (!accepted) {
      playSound("error");
      setMessage("Vous devez accepter la mission ORION.");
      return;
    }

    setLoading(true);
    setMessage("Vérification de la signature...");
    playSound("scanner");

    setTimeout(() => {
      setMessage("Création de l'identité numérique...");
      playSound("beep");
    }, 900);

    setTimeout(async () => {
      const cleanName = teamName.trim().toUpperCase();

      const { error } = await supabase.from("teams").insert({
        name: cleanName,
        current_mission: 1,
        players_count: playersCount,
        status: "en_cours",
        started_at: new Date().toISOString(),
        errors_count: 0,
        hints_count: 0,
        final_score: 0,
      });

      if (error) {
        playSound("error");
        setMessage("Impossible de créer cette équipe. Essayez un autre nom.");
        setLoading(false);
        return;
      }

      localStorage.setItem("orion_team", cleanName);

      setMessage(`Bienvenue ${cleanName}. Connexion à ORION...`);
      playSound("success");

      setTimeout(() => router.push("/orion"), 1300);
    }, 1800);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#02040d] text-[#E8F1FF] flex items-center justify-center px-5 py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,217,255,0.16),transparent_45%)]" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(0,217,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(0,217,255,0.15)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 animate-pulse" />

      <section className="relative w-full max-w-xl border border-cyan-400/50 rounded-3xl p-8 text-center shadow-[0_0_70px_rgba(0,194,255,0.35)] bg-[#050816]/90 backdrop-blur">
        <div className="absolute -inset-1 rounded-3xl border border-cyan-400/20 animate-pulse" />

        <div className="relative">
          {phase >= 1 && (
            <p className="text-cyan-400 tracking-[0.45em] text-xs mb-6 animate-pulse">
              ORION SYSTEM
            </p>
          )}

          {phase >= 2 && (
            <h1 className="text-4xl sm:text-5xl font-black text-cyan-400 mb-4">
              AUTHENTIFICATION
            </h1>
          )}

          {phase >= 3 && (
            <p className="text-gray-300 mb-8 leading-7">
              Initialisation du protocole agents...
              <br />
              Enregistrez votre équipe pour accéder à la mission.
            </p>
          )}

          {phase >= 4 && (
            <>
              <div className="text-left mb-4">
                <label className="block text-cyan-300 font-bold mb-2">
                  NOM DE L'ÉQUIPE
                </label>

                <input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="EX : LES GARDIENS"
                  className="w-full rounded-xl bg-[#0c1226] border border-cyan-500 p-4 text-white outline-none focus:ring-2 focus:ring-cyan-400 uppercase"
                />
              </div>

              <div className="text-left mb-5">
                <label className="block text-cyan-300 font-bold mb-2">
                  NOMBRE D'AGENTS
                </label>

                <select
                  value={playersCount}
                  onChange={(e) => setPlayersCount(Number(e.target.value))}
                  className="w-full rounded-xl bg-[#0c1226] border border-cyan-500 p-4 text-white outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>
                      {n} joueurs
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-3 text-left text-sm text-gray-300 mb-6">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="w-5 h-5 accent-cyan-400"
                />
                Nous acceptons la mission ORION.
              </label>

              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-6">
                <div
                  className={`h-full bg-cyan-400 transition-all duration-700 ${
                    loading ? "w-full animate-pulse" : accepted ? "w-3/4" : "w-1/3"
                  }`}
                />
              </div>

              <button
                type="button"
                onClick={registerTeam}
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 rounded-xl py-4 font-black text-lg text-white shadow-[0_0_35px_rgba(0,194,255,0.55)] transition transform active:scale-95"
              >
                {loading ? "AUTHENTIFICATION..." : "AUTHENTIFIER L'ÉQUIPE"}
              </button>

              <p className="mt-6 text-cyan-300 text-sm">
                Progression synchronisée avec ORION Control Center.
              </p>

              {message && (
                <p className="mt-6 text-yellow-300 font-bold animate-pulse">
                  {message}
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}