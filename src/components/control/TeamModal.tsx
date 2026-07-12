import type { Team } from "./types";
import {
  calculateLiveScore,
  formatDuration,
} from "./utils";

type Props = {
  team: Team;
  now: number;
  onClose: () => void;
  onUpdate: (
    team: Team,
    values: Partial<Team>
  ) => Promise<void>;
};

export default function TeamModal({
  team,
  now,
  onClose,
  onUpdate,
}: Props) {
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

        {team.hint_requested && (
          <div className="mt-4 rounded-xl border border-yellow-400/40 bg-yellow-950/30 p-4 font-bold text-yellow-300">
            💡 Cette équipe demande un indice.
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <ActionButton
            label="+1 erreur"
            onClick={() =>
              onUpdate(team, {
                errors_count:
                  (team.errors_count || 0) + 1,
              })
            }
          />

          <ActionButton
            label="+1 indice"
            onClick={() =>
              onUpdate(team, {
                hints_count:
                  (team.hints_count || 0) + 1,
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

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-xs text-slate-400">
        {label}
      </p>

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