import type { Team } from "./types";

export const TOTAL_MISSIONS = 12;

export function calculateLiveScore(team: Team, now: number) {
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

export function getDurationMilliseconds(team: Team, now: number) {
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

export function formatDuration(team: Team, now: number) {
  const milliseconds = getDurationMilliseconds(team, now);

  if (milliseconds === Number.MAX_SAFE_INTEGER) {
    return "00:00:00";
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}