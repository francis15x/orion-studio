import type { Team } from "./types";
import {
  TOTAL_MISSIONS,
  calculateLiveScore,
  formatDuration,
} from "./utils";

type Props = {
  team: Team;
  now: number;
  rank: number;
  showRank: boolean;
  onOpen: () => void;
};

export default function TeamCard({
  team,
  now,
  rank,
  showRank,
  onOpen,
}: Props) {
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
          value={formatDuration(team, now).slice(0, 5)}
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
      <p className="text-[10px] text-slate-500">
        {label}
      </p>

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