import type { Team } from "./types";
import {
  calculateLiveScore,
  formatDuration,
  getDurationMilliseconds,
} from "./utils";

type Props = {
  teams: Team[];
  now: number;
};

export default function ResultsPanel({ teams, now }: Props) {
  const finishedTeams = teams.filter(
    (team) => Boolean(team.completed_at)
  );

  if (finishedTeams.length === 0) {
    return (
      <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-white/[0.03] p-5">
        <p className="font-black text-cyan-300">
          🏆 RÉSULTATS ORION
        </p>

        <p className="mt-2 text-sm text-slate-400">
          Les résultats apparaîtront lorsqu’une équipe aura terminé.
        </p>
      </div>
    );
  }

  // Classement principal : meilleur score, puis meilleur temps.
  const generalRanking = [...finishedTeams].sort((a, b) => {
    const scoreDifference =
      calculateLiveScore(b, now) -
      calculateLiveScore(a, now);

    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    return (
      getDurationMilliseconds(a, now) -
      getDurationMilliseconds(b, now)
    );
  });

  // Équipe ayant terminé le plus rapidement.
  const fastestTeam = [...finishedTeams].sort(
    (a, b) =>
      getDurationMilliseconds(a, now) -
      getDurationMilliseconds(b, now)
  )[0];

  // Moins d’indices, puis meilleur temps.
  const observationTeam = [...finishedTeams].sort((a, b) => {
    const hintsDifference =
      (a.hints_count || 0) - (b.hints_count || 0);

    if (hintsDifference !== 0) {
      return hintsDifference;
    }

    return (
      getDurationMilliseconds(a, now) -
      getDurationMilliseconds(b, now)
    );
  })[0];

  // Plus d’erreurs tout en ayant terminé, puis meilleur temps.
  const perseveranceTeam = [...finishedTeams].sort((a, b) => {
    const errorsDifference =
      (b.errors_count || 0) - (a.errors_count || 0);

    if (errorsDifference !== 0) {
      return errorsDifference;
    }

    return (
      getDurationMilliseconds(a, now) -
      getDurationMilliseconds(b, now)
    );
  })[0];

  return (
    <section className="mt-5 rounded-2xl border border-yellow-400/30 bg-[#080d20] p-5 shadow-[0_0_30px_rgba(255,216,74,0.08)]">
      <p className="text-sm font-black tracking-[0.2em] text-yellow-300">
        🏆 RÉSULTATS ORION
      </p>

      <div className="mt-5">
        <h2 className="font-black text-white">
          CLASSEMENT GÉNÉRAL
        </h2>

        <div className="mt-3 space-y-2">
          {generalRanking.map((team, index) => (
            <div
              key={team.id}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl bg-black/25 p-3"
            >
              <span className="text-lg font-black">
                {index === 0
                  ? "🥇"
                  : index === 1
                    ? "🥈"
                    : index === 2
                      ? "🥉"
                      : `#${index + 1}`}
              </span>

              <div className="min-w-0">
                <p className="truncate font-bold text-white">
                  {team.name}
                </p>

                <p className="text-xs text-slate-400">
                  {formatDuration(team, now)}
                </p>
              </div>

              <span className="font-black text-yellow-300">
                {calculateLiveScore(team, now)} pts
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <AwardCard
          icon="⚡"
          title="PLUS RAPIDE"
          teamName={fastestTeam.name}
          detail={formatDuration(fastestTeam, now)}
        />

        <AwardCard
          icon="👁"
          title="OBSERVATION"
          teamName={observationTeam.name}
          detail={`${observationTeam.hints_count || 0} indice(s)`}
        />

        <AwardCard
          icon="💪"
          title="PERSÉVÉRANCE"
          teamName={perseveranceTeam.name}
          detail={`${perseveranceTeam.errors_count || 0} erreur(s)`}
        />
      </div>
    </section>
  );
}

function AwardCard({
  icon,
  title,
  teamName,
  detail,
}: {
  icon: string;
  title: string;
  teamName: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-black/20 p-4">
      <p className="text-xl">{icon}</p>

      <p className="mt-2 text-xs font-black tracking-[0.15em] text-cyan-300">
        {title}
      </p>

      <p className="mt-3 font-black text-white">
        {teamName}
      </p>

      <p className="mt-1 text-sm text-slate-400">
        {detail}
      </p>
    </div>
  );
}