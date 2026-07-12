"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

import AlertCenter from "@/components/control/AlertCenter";
import DashboardHeader from "@/components/control/DashboardHeader";
import FilterBar from "@/components/control/FilterBar";
import LiveRanking from "@/components/control/LiveRanking";
import StatCard from "@/components/control/StatCard";
import TeamCard from "@/components/control/TeamCard";
import TeamModal from "@/components/control/TeamModal";
import ResultsPanel from "@/components/control/ResultsPanel";

import type { Filter, Team } from "@/components/control/types";
import {
  TOTAL_MISSIONS,
  calculateLiveScore,
  getDurationMilliseconds,
} from "@/components/control/utils";

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
        () => loadTeams()
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

  const blockedTeams = useMemo(() => {
    const tenMinutesAgo = now - 10 * 60 * 1000;

    return activeTeams.filter((team) => {
      if (!team.last_activity || team.paused) return false;

      const lastActivity = new Date(team.last_activity).getTime();

      return (
        !Number.isNaN(lastActivity) &&
        lastActivity < tenMinutesAgo
      );
    });
  }, [activeTeams, now]);

  const ranking = useMemo(() => {
    return [...teams].sort((a, b) => {
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
  }, [teams, now]);

  const displayedTeams = useMemo(() => {
    if (filter === "active") {
      return activeTeams;
    }

    if (filter === "finished") {
      return finishedTeams;
    }

    if (filter === "ranking") {
      return ranking;
    }

    return [...teams].sort(
      (a, b) =>
        (b.current_mission || 1) -
        (a.current_mission || 1)
    );
  }, [filter, teams, activeTeams, finishedTeams, ranking]);

  const globalProgress =
    teams.length === 0
      ? 0
      : Math.round(
          teams.reduce((total, team) => {
            if (team.completed_at) {
              return total + 100;
            }

            const mission = Math.min(
              TOTAL_MISSIONS,
              Math.max(1, team.current_mission || 1)
            );

            return (
              total +
              (mission / TOTAL_MISSIONS) * 100
            );
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
      <DashboardHeader
        refreshing={refreshing}
        onRefresh={() => loadTeams(true)}
      />

      <section className="mx-auto max-w-5xl px-4 py-5">
        {errorMessage && (
          <div className="mb-4 rounded-xl border border-red-400/40 bg-red-950/30 p-4 text-sm font-bold text-red-300">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
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
            label="Bloquées"
            value={blockedTeams.length}
            color={
              blockedTeams.length > 0
                ? "text-red-300 animate-pulse"
                : "text-slate-400"
            }
          />

          <StatCard
            label="Leader"
            value={leader?.name || "—"}
            color="text-yellow-300"
            small
          />
        </div>

        <AlertCenter
          blockedTeams={blockedTeams}
          onOpenTeam={setSelectedTeam}
        />

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

        <LiveRanking teams={ranking} now={now} />
        <ResultsPanel teams={teams} now={now} />

        <FilterBar
          filter={filter}
          onChange={setFilter}
        />

        <div className="mt-5 space-y-4">
          {loading ? (
            <>
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-56 animate-pulse rounded-2xl border border-cyan-400/10 bg-white/[0.03]"
                />
              ))}
            </>
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
                  (rankedTeam) =>
                    rankedTeam.id === team.id
                ) + 1;

              return (
                <TeamCard
                  key={team.id}
                  team={team}
                  now={now}
                  rank={rank}
                  showRank={filter === "ranking"}
                  onOpen={() =>
                    setSelectedTeam(team)
                  }
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