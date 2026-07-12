import type { Filter } from "./types";

type Props = {
  filter: Filter;
  onChange: (filter: Filter) => void;
};

export default function FilterBar({
  filter,
  onChange,
}: Props) {
  const buttons: Array<{
    key: Filter;
    label: string;
  }> = [
    { key: "all", label: "Toutes" },
    { key: "active", label: "En cours" },
    { key: "finished", label: "Finies" },
    { key: "ranking", label: "🏆" },
  ];

  return (
    <div className="mt-5 grid grid-cols-4 gap-2 rounded-2xl border border-cyan-400/20 bg-white/[0.03] p-2">
      {buttons.map((button) => (
        <button
          key={button.key}
          type="button"
          onClick={() => onChange(button.key)}
          className={`rounded-xl px-2 py-3 text-xs font-bold active:scale-95 ${
            filter === button.key
              ? "bg-cyan-500 text-white"
              : "text-slate-400"
          }`}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
}