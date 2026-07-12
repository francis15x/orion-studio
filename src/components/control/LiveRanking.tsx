import type { Team } from "./types";
import { calculateLiveScore } from "./utils";

type Props = {
  teams: Team[];
  now: number;
};

export default function LiveRanking({ teams, now }: Props) {
  const topTeams = teams.slice(0, 3);

  if (topTeams.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 rounded-2xl border border-yellow-400/30 bg-yellow-950/10 p-4">
      <p className="text-sm font-black tracking-[0.2em] text-yellow-300">
        🏆 CLASSEMENT LIVE
      </p>

      <div className="mt-3 space-y-2">
        {topTeams.map((team, index) => (
          <div
            key={team.id}
            className="flex items-center justify-between rounded-xl bg-black/20 p-3"
          >
            <span className="font-bold text-white">
              {index === 0
                ? "🥇"
                : index === 1
                  ? "🥈"
                  : "🥉"}{" "}
              {team.name}
            </span>

            <span className="font-black text-yellow-300">
              {calculateLiveScore(team, now)} pts
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}