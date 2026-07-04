"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function BootScreen() {
  const [teamName, setTeamName] = useState("Recherche...");
const [missionTitle, setMissionTitle] = useState("Chargement de la mission...");

  useEffect(() => {
    async function loadTeam() {
      const { data, error } = await supabase
        .from("teams")
        .select("name")
        .limit(1);

      if (error) {
        console.error(error);
        setTeamName("ERREUR");
        return;
      }

      if (!data || data.length === 0) {
        setTeamName("AUCUNE ÉQUIPE");
        return;
      }

      setTeamName(data[0].name);
      const { data: missionData, error: missionError } = await supabase
  .from("missions")
  .select("title, story")
  .eq("id", 1)
  .single();

if (!missionError && missionData) {
  setMissionTitle(missionData.title);
}
    }

    loadTeam();
  }, []);

  return (
    <main className="min-h-screen bg-[#050816] text-[#E8F1FF] flex items-center justify-center px-6">
      <section className="w-full max-w-xl text-center border border-cyan-400/30 rounded-2xl p-10">
        <p className="text-cyan-400 text-sm tracking-[0.35em] mb-6">
          ORION SYSTEM
        </p>

        <h1 className="text-6xl font-black tracking-[0.45em] text-cyan-400 mb-8">
          ORION
        </h1>

        <p className="text-gray-300 font-mono">
          ÉQUIPE DÉTECTÉE : {teamName}
        </p>
        <p className="text-cyan-300 mt-6 text-xl font-semibold">
  Mission : {missionTitle}
</p>
      </section>
    </main>
  );
}