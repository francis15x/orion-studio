type Props = {
  label: string;
  value: string | number;
  color: string;
  small?: boolean;
};

export default function StatCard({
  label,
  value,
  color,
  small = false,
}: Props) {
  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-white/[0.04] p-4">
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 font-black ${color} ${
          small ? "truncate text-base" : "text-3xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}