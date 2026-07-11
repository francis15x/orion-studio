"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Team = {
  id?: number;
  name: string;
  current_mission: number;
  players_count?: number;
  status?: string;
  started_at?: string;
  completed_at?: string | null;
  errors_count?: number;
  hints_count?: number;
  final_score?: number;
};

export default function AdminPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadTeams() {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .order("final_score", { ascending: false });

    if (!error && data) {
      setTeams(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadTeams();

    const interval = setInterval(loadTeams, 5000);

    return () => clearInterval(interval);
  }, []);

  function formatTime(start?: string, end?: string | null) {
    if (!start) return "-";

    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();

    const diff = Math.max(0, endDate.getTime() - startDate.getTime());
    const totalSeconds = Math.floor(diff / 1000);

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  const activeTeams = teams.filter((t) => !t.completed_at);
  const finishedTeams = teams.filter((t) => t.completed_at);

  return (
    <main className="min-h-screen bg-[#050816] text-[#E8F1FF] px-6 py-8">
      <section className="max-w-7xl mx-auto">
        <p className="text-cyan-400 tracking-[0.35em] text-sm mb-4">
          ORION CONTROL CENTER
        </p>

        <h1 className="text-4xl font-black text-cyan-400 mb-8">
          Tableau de bord organisateur
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="border border-cyan-400/30 rounded-xl p-5 bg-white/5">
            <p className="text-gray-400 text-sm">Équipes inscrites</p>
            <p className="text-3xl font-black text-white">{teams.length}</p>
          </div>

          <div className="border border-cyan-400/30 rounded-xl p-5 bg-white/5">
            <p className="text-gray-400 text-sm">En cours</p>
            <p className="text-3xl font-black text-cyan-300">{activeTeams.length}</p>
          </div>

          <div className="border border-cyan-400/30 rounded-xl p-5 bg-white/5">
            <p className="text-gray-400 text-sm">Terminées</p>
            <p className="text-3xl font-black text-green-300">{finishedTeams.length}</p>
          </div>

          <div className="border border-cyan-400/30 rounded-xl p-5 bg-white/5">
            <p className="text-gray-400 text-sm">Mise à jour</p>
            <p className="text-xl font-bold text-yellow-300">Auto 5s</p>
          </div>
        </div>

        <div className="overflow-x-auto border border-cyan-400/30 rounded-xl">
          <table className="w-full text-left font-mono">
            <thead className="bg-cyan-950/60 text-cyan-300">
              <tr>
                <th className="p-4">Rang</th>
                <th className="p-4">Équipe</th>
                <th className="p-4">Joueurs</th>
                <th className="p-4">Protocole</th>
                <th className="p-4">Temps</th>
                <th className="p-4">Erreurs</th>
                <th className="p-4">Indices</th>
                <th className="p-4">Score</th>
                <th className="p-4">Statut</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="p-4" colSpan={9}>
                    Chargement...
                  </td>
                </tr>
              ) : (
                teams.map((team, index) => (
                  <tr
                    key={team.id || team.name}
                    className="border-t border-cyan-400/20 hover:bg-white/5"
                  >
                    <td className="p-4 text-yellow-300 font-bold">
                      #{index + 1}
                    </td>

                    <td className="p-4 font-bold text-white">
                      {team.name}
                    </td>

                    <td className="p-4">
                      {team.players_count || "-"}
                    </td>

                    <td className="p-4">
  <div className="flex flex-col gap-2">

    <span className="text-cyan-300 font-bold">
      Mission {team.current_mission || 1} / 12
    </span>

    <div className="w-40 h-2 bg-slate-700 rounded-full overflow-hidden">
      <div
  className={`h-full transition-all duration-500 ${
    team.completed_at
      ? "bg-green-400"
      : (team.current_mission || 1) <= 4
      ? "bg-green-400"
      : (team.current_mission || 1) <= 8
      ? "bg-yellow-400"
      : "bg-red-400"
  }`}
  style={{
    width: team.completed_at
      ? "100%"
      : `${((team.current_mission || 1) / 12) * 100}%`,
  }}
/>
    </div>

    <span className="text-xs text-gray-400">
      {team.completed_at
  ? "100"
  : Math.round(((team.current_mission || 1) / 12) * 100)} %
    </span>

  </div>
</td>

                    <td className="p-4">
                      {formatTime(team.started_at, team.completed_at)}
                    </td>

                    <td className="p-4">
                      {team.errors_count || 0}
                    </td>

                    <td className="p-4">
                      {team.hints_count || 0}
                    </td>

                    

                    <td className="p-4">
                      {team.completed_at ? (
                        <span className="text-green-300 font-bold">Terminée</span>
                      ) : (
                        <span className="text-yellow-300 font-bold">En cours</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

