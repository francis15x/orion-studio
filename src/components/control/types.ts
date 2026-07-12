export type Team = {
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

export type Filter = "all" | "active" | "finished" | "ranking";