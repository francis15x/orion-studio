"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  teamName: string;
};

export default function Scene07Score({ teamName }: Props) {
  const [loading, setLoading] = useState(true);
  const [displayScore, setDisplayScore] = useState(0);
  const [scoreData, setScoreData] = useState({
    time: "00:00:00",
    errors: 0,
    hints: 0,
    score: 0,
    rank: "Calcul...",
  });

  useEffect(() => {
    async function loadScore() {
      const now = new Date();

      await supabase
        .from("teams")
        .update({ completed_at: now.toISOString() })
        .eq("name", teamName)
        .is("completed_at", null);

      const { data: team } = await supabase
        .from("teams")
        .select("name, started_at, completed_at, errors_count, hints_count")
        .eq("name", teamName)
        .single();

      if (!team) return;

      const start = new Date(team.started_at || now);
      const end = new Date(team.completed_at || now);

      const durationMs = Math.max(0, end.getTime() - start.getTime());
      const totalSeconds = Math.floor(durationMs / 1000);

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const errors = team.errors_count || 0;
      const hints = team.hints_count || 0;

      const score = Math.max(
        0,
        1000 - Math.floor(totalSeconds / 60) * 2 - errors * 25 - hints * 15
      );

      await supabase
        .from("teams")
        .update({ final_score: score })
        .eq("name", teamName);

      const { data: ranking } = await supabase
        .from("teams")
        .select("name, final_score")
        .gt("final_score", 0)
        .order("final_score", { ascending: false });

      const position =
        ranking?.findIndex((item) => item.name === teamName) ?? -1;

      setScoreData({
        time: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
          2,
          "0"
        )}:${String(seconds).padStart(2, "0")}`,
        errors,
        hints,
        score,
        rank: position >= 0 ? `#${position + 1} / ${ranking?.length}` : "Non classé",
      });

      setLoading(false);
    }

    loadScore();
  }, [teamName]);

  useEffect(() => {
    if (loading) return;

    let current = 0;
    const step = Math.max(1, Math.floor(scoreData.score / 40));

    const interval = setInterval(() => {
      current += step;

      if (current >= scoreData.score) {
        setDisplayScore(scoreData.score);
        clearInterval(interval);
        return;
      }

      setDisplayScore(current);
    }, 70);

    return () => clearInterval(interval);
  }, [loading, scoreData.score]);

  const progress = scoreData.score > 0 ? (displayScore / scoreData.score) * 100 : 0;

  return (
    <main className="min-h-screen bg-black text-cyan-300 flex items-center justify-center px-6">
      <section className="w-full max-w-xl border border-cyan-500 rounded-2xl p-8 text-center font-mono shadow-[0_0_40px_rgba(0,194,255,0.25)]">
        <p className="text-cyan-500 tracking-[0.35em] text-xs mb-8">
          ORION PERFORMANCE REPORT
        </p>

        <div className="text-cyan-400 text-xl mb-4">
          ████████████████████
        </div>

        <h1 className="text-4xl font-black text-cyan-400 mb-4">
          MISSION ACCOMPLIE
        </h1>

        <div className="text-cyan-400 text-xl mb-10">
          ████████████████████
        </div>

        {loading ? (
          <p className="animate-pulse text-xl">Calcul du score ORION...</p>
        ) : (
          <div className="space-y-6 text-left">
            <div>
              <p className="text-cyan-500 text-sm">ÉQUIPE</p>
              <p className="text-2xl font-bold text-white">{teamName}</p>
            </div>

            <div className="border-t border-cyan-500/30 pt-6">
              <p className="text-cyan-500 text-sm">TEMPS</p>
              <p className="text-2xl font-bold text-white">{scoreData.time}</p>
            </div>

            <div>
              <p className="text-cyan-500 text-sm">ERREURS</p>
              <p className="text-2xl font-bold text-white">{scoreData.errors}</p>
            </div>

            <div>
              <p className="text-cyan-500 text-sm">INDICES</p>
              <p className="text-2xl font-bold text-white">{scoreData.hints}</p>
            </div>

            <div className="border-t border-cyan-500/30 pt-6">
              <p className="text-cyan-400 text-lg animate-pulse">
                CALCUL DU SCORE...
              </p>

              <div className="w-full h-3 bg-slate-800 rounded-full mt-4 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-6xl font-black text-cyan-400 mt-6 text-center">
                {displayScore}
              </p>
            </div>

            {displayScore >= scoreData.score && (
              <div className="text-center border-t border-cyan-500/30 pt-6">
                <p className="text-cyan-500 text-sm">SCORE FINAL</p>
                <p className="text-5xl font-black text-white">
                  {scoreData.score}
                </p>

                <p className="mt-6 text-yellow-300 text-xl font-bold">
                  🏆 Classement provisoire : {scoreData.rank}
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}