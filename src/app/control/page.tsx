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
  hint_requested: boolean | null;
  organizer_message: string | null;
  last_activity: string | null;
};

type Filter = "all" | "active" | "finished" | "ranking";

const TOTAL_MISSIONS = 12;

export default function OrionControlCenter() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadTeams = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);

    const { data, error } = await supabase
      .from("teams")
      .select(`
        id,
        name,
        current_mission,
        players_count,
        status,
        started_at,
        completed_at,
        errors_count,
        hints_count,
        final_score,
        paused,
        hint_requested,
        organizer_message,
        last_activity
      `);

    if (error) {
      console.error(error);
      setErrorMessage("Impossible de charger les équipes.");
    } else {
      setTeams((data || []) as Team[]);
      setErrorMessage("");
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadTeams();

    const clock = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    const fallbackRefresh = window.setInterval(() => {
      loadTeams();
    }, 5000);

    const channel = supabase
      .channel("orion-control-center")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "teams",
        },
        () => {
          loadTeams();
        }
      )
      .subscribe();

    return () => {
      window.clearInterval(clock);
      window.clearInterval(fallbackRefresh);
      supabase.removeChannel(channel);
    };
  }, [loadTeams]);

  const activeTeams = useMemo(
    () => teams.filter((team) => !team.completed_at),
    [teams]
  );

  const finishedTeams = useMemo(
    () => teams.filter((team) => Boolean(team.completed_at)),
    [teams]
  );

  const ranking = useMemo(() => {
    return [...teams].sort((a, b) => {
      const scoreDifference =
        calculateLiveScore(b, now) - calculateLiveScore(a, now);

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      return getDurationMilliseconds(a, now) -
        getDurationMilliseconds(b, now);
    });
  }, [teams, now]);

  const displayedTeams = useMemo(() => {
    if (filter === "active") {
      return [...activeTeams].sort(
        (a, b) =>
          (b.current_mission || 1) -
          (a.current_mission || 1)
      );
    }

    if (filter === "finished") {
      return [...finishedTeams].sort(
        (a, b) =>
          calculateLiveScore(b, now) -
          calculateLiveScore(a, now)
      );
    }

    if (filter === "ranking") {
      return ranking;
    }

    return [...teams].sort((a, b) => {
      if (a.completed_at && !b.completed_at) return -1;
      if (!a.completed_at && b.completed_at) return 1;

      return (
        (b.current_mission || 1) -
        (a.current_mission || 1)
      );
    });
  }, [
    filter,
    teams,
    activeTeams,
    finishedTeams,
    ranking,
    now,
  ]);

  const globalProgress =
    teams.length === 0
      ? 0
      : Math.round(
          teams.reduce((total, team) => {
            if (team.completed_at) return total + 100;

            const mission = Math.min(
              TOTAL_MISSIONS,
              Math.max(1, team.current_mission || 1)
            );

            return total + (mission / TOTAL_MISSIONS) * 100;
          }, 0) / teams.length
        );

  const leader = ranking[0];

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

  return (
    <main className="min-h-screen bg-[#030611] text-[#E8F1FF] pb-24">
      <header className="sticky top-0 z-30 border-b border-cyan-400/20 bg-[#030611]/95 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold tracking-[0.35em] text-cyan-400">
                ORION SYSTEM
              </p>

              <h1 className="mt-1 text-2xl font-black text-white">
                CONTROL CENTER PRO
              </h1>

              <p className="mt-1 text-xs text-green-300">
                ● Synchronisation en direct
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadTeams(true)}
              disabled={refreshing}
              className="rounded-xl border border-cyan-400/40 bg-cyan-950/30 px-4 py-3 text-xl font-bold text-cyan-300 active:scale-95 disabled:opacity-50"
            >
              {refreshing ? "…" : "↻"}
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-5">
        {errorMessage && (
          <div className="mb-4 rounded-xl border border-red-400/40 bg-red-950/30 p-4 text-sm font-bold text-red-300">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            label="Équipes"
            value={teams.length}
            color="text-white"
          />

          <StatCard
            label="En mission"
            value={activeTeams.length}
            color="text-cyan-300"
          />

          <StatCard
            label="Terminées"
            value={finishedTeams.length}
            color="text-green-300"
          />

          <StatCard
            label="Leader"
            value={leader?.name || "—"}
            color="text-yellow-300"
            small
          />
        </div>

        <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-white/[0.04] p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-slate-300">
              Progression globale
            </span>

            <span className="font-black text-cyan-300">
              {globalProgress} %
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-cyan-400 transition-all duration-700"
              style={{ width: `${globalProgress}%` }}
            />
          </div>
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
          {loading ? (
            <LoadingCards />
          ) : displayedTeams.length === 0 ? (
            <div className="rounded-2xl border border-cyan-400/20 bg-white/[0.03] p-8 text-center">
              <p className="font-bold text-slate-300">
                Aucune équipe trouvée
              </p>
            </div>
          ) : (
            displayedTeams.map((team) => {
              const rank =
                ranking.findIndex(
                  (rankedTeam) => rankedTeam.id === team.id
                ) + 1;

              return (
                <TeamCard
                  key={team.id}
                  team={team}
                  now={now}
                  rank={rank}
                  showRank={filter === "ranking"}
                  onOpen={() => setSelectedTeam(team)}
                />
              );
            })
          )}
        </div>
      </section>

      {selectedTeam && (
        <TeamModal
          team={selectedTeam}
          now={now}
          onClose={() => setSelectedTeam(null)}
          onUpdate={updateTeam}
        />
      )}

      <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-cyan-400/20 bg-[#030611]/95 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <p className="text-[10px] tracking-[0.25em] text-cyan-500">
              RÉSEAU ORION
            </p>

            <p className="text-sm font-bold text-green-300">
              ● Opérationnel
            </p>
          </div>

          <p className="font-mono text-sm text-cyan-200">
            {new Date(now).toLocaleTimeString("fr-FR")}
          </p>
        </div>
      </footer>
    </main>
  );
}

function TeamCard({
  team,
  now,
  rank,
  showRank,
  onOpen,
}: {
  team: Team;
  now: number;
  rank: number;
  showRank: boolean;
  onOpen: () => void;
}) {
  const finished = Boolean(team.completed_at);

  const mission = Math.min(
    TOTAL_MISSIONS,
    Math.max(1, team.current_mission || 1)
  );

  const progress = finished
    ? 100
    : Math.round((mission / TOTAL_MISSIONS) * 100);

  const score = calculateLiveScore(team, now);

  const progressColor = finished
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
      className="w-full rounded-2xl border border-cyan-400/25 bg-[#080d20] p-5 text-left shadow-[0_0_25px_rgba(0,194,255,0.08)] transition active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {showRank && (
              <span className="text-xl">
                {rank === 1
                  ? "🥇"
                  : rank === 2
                    ? "🥈"
                    : rank === 3
                      ? "🥉"
                      : `#${rank}`}
              </span>
            )}

            <h2 className="truncate text-xl font-black text-white">
              {team.name}
            </h2>
          </div>

          <p className="mt-1 text-xs text-slate-400">
            {team.players_count || "?"} agents
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${
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
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-bold text-cyan-300">
            Protocole {mission} / {TOTAL_MISSIONS}
          </span>

          <span className="font-bold text-white">
            {progress} %
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
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
          value={String(score)}
          highlight
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

function TeamModal({
  team,
  now,
  onClose,
  onUpdate,
}: {
  team: Team;
  now: number;
  onClose: () => void;
  onUpdate: (
    team: Team,
    values: Partial<Team>
  ) => Promise<void>;
}) {
  const score = calculateLiveScore(team, now);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 px-4 py-6 backdrop-blur">
      <section className="mx-auto max-w-xl rounded-3xl border border-cyan-400/40 bg-[#070b19] p-5 shadow-[0_0_50px_rgba(0,217,255,0.2)]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs tracking-[0.3em] text-cyan-400">
              ÉQUIPE
            </p>

            <h2 className="mt-1 text-2xl font-black">
              {team.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/20 px-4 py-2"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <MiniStat
            label="Protocole"
            value={`${team.current_mission || 1}/12`}
          />

          <MiniStat
            label="Temps"
            value={formatDuration(team, now)}
          />

          <MiniStat
            label="Erreurs"
            value={String(team.errors_count || 0)}
          />

          <MiniStat
            label="Indices"
            value={String(team.hints_count || 0)}
          />

          <MiniStat
            label="Score direct"
            value={String(score)}
          />

          <MiniStat
            label="Agents"
            value={String(team.players_count || "?")}
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <ActionButton
            label="+1 erreur"
            onClick={() =>
              onUpdate(team, {
                errors_count: (team.errors_count || 0) + 1,
              })
            }
          />

          <ActionButton
            label="+1 indice"
            onClick={() =>
              onUpdate(team, {
                hints_count: (team.hints_count || 0) + 1,
                hint_requested: false,
              })
            }
          />

          <ActionButton
            label={team.paused ? "▶ Reprendre" : "⏸ Pause"}
            onClick={() =>
              onUpdate(team, {
                paused: !team.paused,
              })
            }
          />

          <ActionButton
            label="🏁 Terminer"
            onClick={() =>
              onUpdate(team, {
                completed_at: new Date().toISOString(),
                status: "terminee",
                current_mission: 12,
                final_score: score,
              })
            }
          />
        </div>
      </section>
    </div>
  );
}

function calculateLiveScore(team: Team, now: number) {
  const errorsPenalty = (team.errors_count ?? 0) * 30;
  const hintsPenalty = (team.hints_count ?? 0) * 50;

  let minutesPenalty = 0;

  if (team.started_at) {
    const start = new Date(team.started_at).getTime();

    if (!Number.isNaN(start)) {
      const completedTime = team.completed_at
        ? new Date(team.completed_at).getTime()
        : now;

      const end = Number.isNaN(completedTime)
        ? now
        : completedTime;

      minutesPenalty = Math.floor(
        Math.max(0, end - start) / 60000
      );
    }
  }

  const score =
    1000 - errorsPenalty - hintsPenalty - minutesPenalty;

  return Math.max(
    0,
    Number.isFinite(score) ? score : 1000
  );
}

function getDurationMilliseconds(team: Team, now: number) {
  if (!team.started_at) return Number.MAX_SAFE_INTEGER;

  const start = new Date(team.started_at).getTime();

  if (Number.isNaN(start)) {
    return Number.MAX_SAFE_INTEGER;
  }

  const end = team.completed_at
    ? new Date(team.completed_at).getTime()
    : now;

  return Math.max(0, end - start);
}

function formatDuration(team: Team, now: number) {
  if (!team.started_at) return "00:00:00";

  const milliseconds = getDurationMilliseconds(team, now);

  if (milliseconds === Number.MAX_SAFE_INTEGER) {
    return "00:00:00";
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatShortDuration(team: Team, now: number) {
  return formatDuration(team, now).slice(0, 5);
}

function StatCard({
  label,
  value,
  color,
  small = false,
}: {
  label: string;
  value: string | number;
  color: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-white/[0.04] p-4">
      <p className="text-xs text-slate-400">{label}</p>

      <p
        className={`mt-2 font-black ${color} ${
          small ? "truncate text-base" : "text-3xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function CardInfo({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg bg-black/20 px-1 py-2">
      <p className="text-[10px] text-slate-500">{label}</p>

      <p
        className={`mt-1 truncate text-xs font-black ${
          highlight ? "text-yellow-300" : "text-white"
        }`}
      >
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
      <p className="mt-1 text-lg font-black text-white">
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
      className={`rounded-xl px-2 py-3 text-xs font-bold active:scale-95 ${
        active
          ? "bg-cyan-500 text-white"
          : "text-slate-400"
      }`}
    >
      {label}
    </button>
  );
}

function LoadingCards() {
  return (
    <>
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-56 animate-pulse rounded-2xl border border-cyan-400/10 bg-white/[0.03]"
        />
      ))}
    </>
  );
}