"use client";

type Props = {
  lines: string[];
};

export default function Terminal({ lines }: Props) {
  return (
    <div className="mt-8 rounded-xl bg-black border border-cyan-500 p-5 font-mono text-cyan-400 text-left">
      {lines.map((line, index) => (
        <p key={index} className="mb-2">
          {line}
        </p>
      ))}
    </div>
  );
}