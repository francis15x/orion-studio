"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function InscriptionPage() {
  const router = useRouter();

  const [teamName, setTeamName] = useState("");
  const [playersCount, setPlayersCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function registerTeam() {
    if (!teamName.trim()) {
      setMessage("Entrez un nom d'équipe.");
      return;
    }

    setLoading(true);
    setMessage("");

    const cleanName = teamName.trim();

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
      setMessage(error.message);
console.log(error);
      setLoading(false);
      return;
    }

    localStorage.setItem("orion_team", cleanName);

    router.push("/");
  }

  return (
    <main className="min-h-screen bg-[#050816] text-[#E8F1FF] flex items-center justify-center px-6">
      <section className="w-full max-w-xl border border-cyan-400/30 rounded-2xl p-8 text-center shadow-[0_0_40px_rgba(0,194,255,0.15)]">
        <p className="text-cyan-400 tracking-[0.35em] text-sm mb-6">
          ORION SYSTEM
        </p>

        <h1 className="text-4xl font-black text-cyan-400 mb-4">
          INSCRIPTION
        </h1>

        <p className="text-gray-300 mb-8 leading-7">
  ORION va enregistrer votre équipe.<br />
  Une fois authentifiée, votre mission commencera.
</p>

        <input
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Nom de l'équipe"
          className="w-full mb-4 rounded-lg bg-[#0c1226] border border-cyan-500 p-4 text-white"
        />

        <select
  value={playersCount}
  onChange={(e) => setPlayersCount(Number(e.target.value))}
  className="w-full mb-6 rounded-lg bg-[#0c1226] border border-cyan-500 p-4 text-white"
>
  <option value={2}>2 joueurs</option>
  <option value={3}>3 joueurs</option>
  <option value={4}>4 joueurs</option>
  <option value={5}>5 joueurs</option>
  <option value={6}>6 joueurs</option>
</select>

        <button
          onClick={registerTeam}
          disabled={loading}
          className="w-full bg-cyan-500 hover:bg-cyan-400 rounded-lg py-4 font-bold text-lg text-white"
        >
          {loading ? "Création..." : "AUTHENTIFIER L'ÉQUIPE"}
        </button>
<p className="mt-6 text-cyan-300 text-sm">
  Votre progression sera enregistrée automatiquement.
</p>
        {message && (
          <p className="mt-6 text-yellow-300 font-bold">
            {message}
          </p>
        )}
      </section>
    </main>
  );
}