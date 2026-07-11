"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Team = {
  id: string;
  name: string;
  current_mission: number | null;
  players_count: number | null;
  status: string | null;
  started_at: string | null;
  completed_at: string | null;
  errors_count: number | null;
  hints_count: number | null;
  final_score: number | null;
  paused: boolean | null;
  last_activity: string | null;
  hint_requested: boolean | null;
  organizer_message: string | null;
};

type Filter = "all" | "active" | "finished" | "ranking";

const TOTAL_MISSIONS = 12;

export default function OrionControlMobile() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  const [globalPause, setGlobalPause] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [messageText, setMessageText] = useState("");

  const loadTeams = useCallback(async () => {
    const { data, error } = await supabase
      .from("teams")
      .select("*");

    if (error) {
      console.error(error);
      return;
    }

    setTeams((data || []) as Team[]);
    setLoading(false);
  }, []);

  const loadSettings = useCallback(async () => {
    const { data } = await supabase
      .from("game_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (data) {
      setGlobalPause(Boolean(data.global_pause));
      setAnnouncement(data.announcement || "");
    }
  }, []);

  useEffect(() => {
    loadTeams();
    loadSettings();

    const clock = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    const teamsChannel = supabase
      .channel("orion-control-teams")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "teams",
        },
        (payload) => {
          loadTeams();

          const newTeam = payload.new as Team;

          if (newTeam?.hint_requested) {
            navigator.vibrate?.([200, 100, 200]);
          }

          if (newTeam?.completed_at) {
            navigator.vibrate?.([400, 150, 400]);
          }
        }
      )
      .subscribe();

    const settingsChannel = supabase
      .channel("orion-control-settings")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_settings",
        },
        () => loadSettings()
      )
      .subscribe();

    return () => {
      window.clearInterval(clock);
      supabase.removeChannel(teamsChannel);
      supabase.removeChannel(settingsChannel);
    };
  }, [loadTeams, loadSettings]);

  const activeTeams = useMemo(
    () => teams.filter((team) => !team.completed_at),
    [teams]
  );

  const finishedTeams = useMemo(
    () => teams.filter((team) => Boolean(team.completed_at)),
    [teams]
  );

  const ranking = useMemo(() => {
    return [...finishedTeams].sort((a, b) => {
      const scoreDifference =
        (b.final_score || 0) - (a.final_score || 0);

      if (scoreDifference !== 0) return scoreDifference;

      return getDuration(a) - getDuration(b);
    });
  }, [finishedTeams]);

  const displayedTeams = useMemo(() => {
    if (filter === "active") return activeTeams;
    if (filter === "finished" || filter === "ranking") return ranking;

    return [...teams].sort(
      (a, b) =>
        (b.current_mission || 1) - (a.current_mission || 1)
    );
  }, [filter, teams, activeTeams, ranking]);

  const progressionGlobale =
    teams.length === 0
      ? 0
      : Math.round(
          teams.reduce((total, team) => {
            if (team.completed_at) return total + 100;

            return (
              total +
              ((team.current_mission || 1) / TOTAL_MISSIONS) * 100
            );
          }, 0) / teams.length
        );

  async function updateTeam(
    team: Team,
    values: Partial<Team>
  ) {
    const { error } = await supabase
      .from("teams")
      .update({
        ...values,
        last_activity: new Date().toISOString(),
      })
      .eq("id", team.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadTeams();

    setSelectedTeam((current) =>
      current ? { ...current, ...values } : null
    );
  }

  async function toggleGlobalPause() {
    const nextValue = !globalPause;

    const { error } = await supabase
      .from("game_settings")
      .update({
        global_pause: nextValue,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (error) {
      alert(error.message);
      return;
    }

    setGlobalPause(nextValue);
    navigator.vibrate?.(200);
  }

  async function sendAnnouncement() {
    const cleanMessage = announcement.trim();

    const { error } = await supabase
      .from("game_settings")
      .update({
        announcement: cleanMessage || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Annonce ORION envoyée.");
  }

  async function sendTeamMessage() {
    if (!selectedTeam) return;

    await updateTeam(selectedTeam, {
      organizer_message: messageText.trim() || null,
    });

    setMessageText("");
  }

  return (
    <main className="min-h-screen bg-[#030611] text-[#E8F1FF] pb-28">
      <header className="sticky top-0 z-30 border-b border-cyan-400/20 bg-[#030611]/95 px-4 py-4 backdrop-blur-xl">
        <p className="text-[10px] font-bold tracking-[0.35em] text-cyan-400">
          ORION SYSTEM
        </p>

        <div className="mt-1 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">
              CONTROL CENTER PRO
            </h1>

            <p className="mt-1 text-xs text-green-300">
              ● Synchronisation en direct
            </p>
          </div>

          <button
            type="button"
            onClick={loadTeams}
            className="rounded-xl border border-cyan-400/30 px-4 py-3 text-xl text-cyan-300"
          >
            ↻
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-5">
        <div className="grid grid-cols-2 gap-3">
          <Stat
            label="Équipes"
            value={teams.length}
            color="text-white"
          />

          <Stat
            label="En mission"
            value={activeTeams.length}
            color="text-cyan-300"
          />

          <Stat
            label="Terminées"
            value={finishedTeams.length}
            color="text-green-300"
          />

          <Stat
            label="Progression"
            value={`${progressionGlobale}%`}
            color="text-yellow-300"
          />
        </div>

        <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-white/[0.04] p-4">
          <div className="mb-2 flex justify-between text-sm">
            <span>Progression globale</span>
            <span className="font-bold text-cyan-300">
              {progressionGlobale} %
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-cyan-400 transition-all duration-700"
              style={{ width: `${progressionGlobale}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={toggleGlobalPause}
          className={`mt-4 w-full rounded-2xl border py-4 font-black ${
            globalPause
              ? "border-green-400 bg-green-950/40 text-green-300"
              : "border-red-400 bg-red-950/40 text-red-300"
          }`}
        >
          {globalPause
            ? "▶ REPRENDRE TOUTES LES ÉQUIPES"
            : "⛔ PAUSE GÉNÉRALE"}
        </button>

        <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-white/[0.04] p-4">
          <p className="mb-3 text-sm font-bold text-cyan-300">
            Annonce générale ORION
          </p>

          <textarea
            value={announcement}
            onChange={(event) =>
              setAnnouncement(event.target.value)
            }
            placeholder="Message visible par toutes les équipes..."
            className="min-h-24 w-full rounded-xl border border-cyan-400/30 bg-[#080d20] p-3 text-white outline-none"
          />

          <button
            type="button"
            onClick={sendAnnouncement}
            className="mt-3 w-full rounded-xl bg-cyan-500 py-3 font-black text-white"
          >
            📢 ENVOYER L’ANNONCE
          </button>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2 rounded-2xl border border-cyan-400/20 bg-white/[0.03] p-2">
          <FilterButton
            label="Toutes"
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />

          <FilterButton
            label="En cours"
            active={filter === "active"}
            onClick={() => setFilter("active")}
          />

          <FilterButton
            label="Finies"
            active={filter === "finished"}
            onClick={() => setFilter("finished")}
          />

          <FilterButton
            label="🏆"
            active={filter === "ranking"}
            onClick={() => setFilter("ranking")}
          />
        </div>

        <div className="mt-5 space-y-4">
          {loading && (
            <p className="animate-pulse text-center text-cyan-300">
              Connexion au réseau ORION...
            </p>
          )}

          {!loading &&
            displayedTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                now={now}
                onOpen={() => {
                  setSelectedTeam(team);
                  setMessageText(
                    team.organizer_message || ""
                  );
                }}
              />
            ))}
        </div>
      </section>

      {selectedTeam && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 px-4 py-6 backdrop-blur">
          <section className="mx-auto max-w-xl rounded-3xl border border-cyan-400/40 bg-[#070b19] p-5 shadow-[0_0_50px_rgba(0,217,255,0.2)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs tracking-[0.3em] text-cyan-400">
                  ÉQUIPE
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  {selectedTeam.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTeam(null)}
                className="rounded-xl border border-white/20 px-4 py-2"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <MiniStat
                label="Protocole"
                value={`${selectedTeam.current_mission || 1}/12`}
              />

              <MiniStat
                label="Temps"
                value={formatDuration(selectedTeam, now)}
              />

              <MiniStat
                label="Erreurs"
                value={String(selectedTeam.errors_count || 0)}
              />

              <MiniStat
                label="Indices"
                value={String(selectedTeam.hints_count || 0)}
              />

              <MiniStat
                label="Score"
                value={String(selectedTeam.final_score || 0)}
              />

              <MiniStat
                label="Joueurs"
                value={String(selectedTeam.players_count || "?")}
              />
            </div>

            {selectedTeam.hint_requested && (
              <div className="mt-4 rounded-xl border border-yellow-400/40 bg-yellow-950/30 p-4 font-bold text-yellow-300">
                💡 Cette équipe demande un indice.
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <ActionButton
                label="+1 erreur"
                onClick={() =>
                  updateTeam(selectedTeam, {
                    errors_count:
                      (selectedTeam.errors_count || 0) + 1,
                  })
                }
              />

              <ActionButton
                label="+1 indice"
                onClick={() =>
                  updateTeam(selectedTeam, {
                    hints_count:
                      (selectedTeam.hints_count || 0) + 1,
                    hint_requested: false,
                  })
                }
              />

              <ActionButton
                label={
                  selectedTeam.paused
                    ? "▶ Reprendre"
                    : "⏸ Pause"
                }
                onClick={() =>
                  updateTeam(selectedTeam, {
                    paused: !selectedTeam.paused,
                  })
                }
              />

              <ActionButton
                label="🏁 Terminer"
                onClick={() =>
                  updateTeam(selectedTeam, {
                    completed_at: new Date().toISOString(),
                    status: "terminee",
                    current_mission: 12,
                  })
                }
              />
            </div>

            <div className="mt-5">
              <p className="mb-2 text-sm font-bold text-cyan-300">
                Message privé
              </p>

              <textarea
                value={messageText}
                onChange={(event) =>
                  setMessageText(event.target.value)
                }
                placeholder="Message destiné à cette équipe..."
                className="min-h-24 w-full rounded-xl border border-cyan-400/30 bg-[#080d20] p-3 text-white outline-none"
              />

              <button
                type="button"
                onClick={sendTeamMessage}
                className="mt-3 w-full rounded-xl bg-cyan-500 py-3 font-black text-white"
              >
                ENVOYER
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function TeamCard({
  team,
  now,
  onOpen,
}: {
  team: Team;
  now: number;
  onOpen: () => void;
}) {
  const mission = Math.min(
    12,
    Math.max(1, team.current_mission || 1)
  );

  const finished = Boolean(team.completed_at);

  const progress = finished
    ? 100
    : Math.round((mission / 12) * 100);

  const color = finished
    ? "bg-green-400"
    : mission <= 4
      ? "bg-green-400"
      : mission <= 8
        ? "bg-yellow-400"
        : mission <= 11
          ? "bg-orange-400"
          : "bg-red-400";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-2xl border border-cyan-400/25 bg-[#080d20] p-5 text-left shadow-[0_0_25px_rgba(0,194,255,0.08)] active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white">
            {team.name}
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {team.players_count || "?"} agents
          </p>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-bold ${
            finished
              ? "border-green-400/40 text-green-300"
              : team.paused
                ? "border-orange-400/40 text-orange-300"
                : "border-cyan-400/40 text-cyan-300"
          }`}
        >
          {finished
            ? "TERMINÉE"
            : team.paused
              ? "PAUSE"
              : "EN COURS"}
        </span>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-bold text-cyan-300">
            Protocole {mission}/12
          </span>

          <span>{progress}%</span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full ${color}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
        <CardInfo
          label="Temps"
          value={formatShortDuration(team, now)}
        />

        <CardInfo
          label="Erreurs"
          value={String(team.errors_count || 0)}
        />

        <CardInfo
          label="Indices"
          value={String(team.hints_count || 0)}
        />

        <CardInfo
          label="Score"
          value={String(team.final_score || 0)}
        />
      </div>

      {team.hint_requested && (
        <p className="mt-4 animate-pulse font-bold text-yellow-300">
          💡 Demande d’indice
        </p>
      )}
    </button>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-white/[0.04] p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-black ${color}`}>
        {value}
      </p>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
}

function CardInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-black/20 px-1 py-2">
      <p className="text-[10px] text-slate-500">{label}</p>
      <p className="mt-1 truncate text-xs font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-cyan-400/30 bg-cyan-950/20 px-3 py-4 text-sm font-black text-cyan-200 active:scale-95"
    >
      {label}
    </button>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-2 py-3 text-xs font-bold ${
        active
          ? "bg-cyan-500 text-white"
          : "text-slate-400"
      }`}
    >
      {label}
    </button>
  );
}

function getDuration(team: Team) {
  if (!team.started_at) return Number.MAX_SAFE_INTEGER;

  const start = new Date(team.started_at).getTime();
  const end = team.completed_at
    ? new Date(team.completed_at).getTime()
    : Date.now();

  return Math.max(0, end - start);
}

function formatDuration(team: Team, now: number) {
  if (!team.started_at) return "00:00:00";

  const start = new Date(team.started_at).getTime();
  const end = team.completed_at
    ? new Date(team.completed_at).getTime()
    : now;

  const seconds = Math.max(
    0,
    Math.floor((end - start) / 1000)
  );

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}:${String(remainingSeconds).padStart(
    2,
    "0"
  )}`;
}

function formatShortDuration(team: Team, now: number) {
  const duration = formatDuration(team, now);
  return duration.slice(0, 5);
}