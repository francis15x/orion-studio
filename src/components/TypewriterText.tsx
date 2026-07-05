"use client";

import { useEffect, useState } from "react";

type Props = {
  lines: string[];
  speed?: number;
};

export default function TypewriterText({ lines, speed = 700 }: Props) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);

  useEffect(() => {
    setVisibleLines([]);

    const timers = lines.map((line, index) =>
      setTimeout(() => {
        setVisibleLines((current) => [...current, line]);
      }, index * speed)
    );

    return () => timers.forEach(clearTimeout);
  }, [lines, speed]);

  return (
    <div className="mt-6 mb-8 rounded-xl bg-black border border-cyan-500 p-5 text-left shadow-[0_0_20px_rgba(0,194,255,0.2)]">
      <p className="text-cyan-500 text-xs tracking-[0.35em] mb-4">
        ORION AI TERMINAL
      </p>

      <div className="text-cyan-200 font-mono leading-relaxed">
        {visibleLines.map((line, index) => (
          <p key={index} className="mb-2">
            &gt; {line}
          </p>
        ))}

        <span className="animate-pulse">█</span>
      </div>
    </div>
  );
}