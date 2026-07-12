"use client";

type Props = {
  refreshing: boolean;
  onRefresh: () => void;
};

export default function DashboardHeader({
  refreshing,
  onRefresh,
}: Props) {
  return (
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
            onClick={onRefresh}
            disabled={refreshing}
            className="rounded-xl border border-cyan-400/40 bg-cyan-950/30 px-4 py-3 text-xl font-bold text-cyan-300 active:scale-95 disabled:opacity-50"
          >
            {refreshing ? "…" : "↻"}
          </button>
        </div>
      </div>
    </header>
  );
}