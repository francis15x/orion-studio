import type { Team } from "./types";

type Props = {
  blockedTeams: Team[];
  onOpenTeam: (team: Team) => void;
};

export default function AlertCenter({
  blockedTeams,
  onOpenTeam,
}: Props) {
  if (blockedTeams.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 rounded-2xl border border-red-400/50 bg-red-950/30 p-4">
      <p className="animate-pulse font-black text-red-300">
        🚨 ÉQUIPES POTENTIELLEMENT BLOQUÉES
      </p>

      <div className="mt-3 space-y-2">
        {blockedTeams.map((team) => (
          <button
            key={team.id}
            type="button"
            onClick={() => onOpenTeam(team)}
            className="flex w-full items-center justify-between rounded-xl bg-black/20 p-3 text-left active:scale-[0.99]"
          >
            <span className="font-bold text-white">
              {team.name}
            </span>

            <span className="text-sm text-red-300">
              Protocole {team.current_mission || 1}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}