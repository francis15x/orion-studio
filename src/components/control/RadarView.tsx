import type { Team } from "./types";

type Props = {
  teams: Team[];
};

export default function RadarView({ teams }: Props) {
  const visibleTeams = teams.slice(0, 8);

  return (
    <div className="mt-5 rounded-2xl border border-cyan-400/30 bg-[#050a18] p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-black tracking-[0.2em] text-cyan-300">
          🛰️ RADAR ORION
        </p>

        <span className="text-xs text-green-300">
          {teams.length} équipe(s)
        </span>
      </div>

      <div className="relative mx-auto mt-5 aspect-square max-w-sm overflow-hidden rounded-full border border-cyan-400/40 bg-[radial-gradient(circle,rgba(0,217,255,0.12)_0%,rgba(3,6,17,1)_70%)]">
        <div className="absolute inset-[12%] rounded-full border border-cyan-400/20" />
        <div className="absolute inset-[28%] rounded-full border border-cyan-400/20" />
        <div className="absolute inset-[44%] rounded-full border border-cyan-400/20" />

        <div className="absolute left-1/2 top-0 h-full w-px bg-cyan-400/20" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-cyan-400/20" />

        <div className="absolute left-1/2 top-1/2 h-[48%] w-[2px] origin-bottom -translate-x-1/2 -translate-y-full animate-[spin_5s_linear_infinite] bg-gradient-to-t from-cyan-400 to-transparent" />

        {visibleTeams.map((team, index) => {
          const angle = (index / Math.max(visibleTeams.length, 1)) * Math.PI * 2;
          const radius = 34 + (index % 3) * 7;

          const x = 50 + Math.cos(angle) * radius;
          const y = 50 + Math.sin(angle) * radius;

          const mission = team.current_mission || 1;

          const color =
            team.completed_at
              ? "bg-blue-400"
              : mission <= 4
                ? "bg-green-400"
                : mission <= 8
                  ? "bg-yellow-400"
                  : mission <= 11
                    ? "bg-orange-400"
                    : "bg-red-400";

          return (
            <div
              key={team.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${x}%`,
                top: `${y}%`,
              }}
            >
              <div
                className={`h-4 w-4 animate-pulse rounded-full ${color} shadow-[0_0_14px_currentColor]`}
              />

              <p className="mt-1 max-w-20 truncate text-[9px] font-bold text-white">
                {team.name}
              </p>
            </div>
          );
        })}

        <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-300 bg-cyan-500 shadow-[0_0_25px_rgba(0,217,255,0.8)]" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px]">
        <Legend color="bg-green-400" label="Début" />
        <Legend color="bg-yellow-400" label="Milieu" />
        <Legend color="bg-red-400" label="Final" />
      </div>
    </div>
  );
}

function Legend({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-lg bg-black/20 p-2 text-slate-300">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </div>
  );
}