"use client";

import { useEffect, useState } from "react";

type Props = {
  lines: string[];
  speed?: number;
};

export default function TypewriterText({
  lines,
  speed = 35,
}: Props) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentText, setCurrentText] = useState("");
function playTypingSound() {
  const audio = new Audio("/sounds/typing.wav");
  audio.volume = 0.12;
  audio.play().catch(() => {});
}
  useEffect(() => {
    setDisplayedLines([]);
    setCurrentLine(0);
    setCurrentText("");
  }, [lines]);

  useEffect(() => {
    if (currentLine >= lines.length) return;

    let index = 0;

    const interval = setInterval(() => {
      const text = lines[currentLine];

      setCurrentText(text.slice(0, index + 1));
if (text[index] && text[index] !== " ") {
  playTypingSound();
}
      index++;

      if (index > text.length) {
        clearInterval(interval);

        setDisplayedLines((prev) => [...prev, text]);
        setCurrentText("");

        setTimeout(() => {
          setCurrentLine((prev) => prev + 1);
        }, 400);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [currentLine, lines, speed]);

  return (
    <div className="rounded-xl bg-black border border-cyan-500 p-5 shadow-[0_0_20px_rgba(0,194,255,0.2)]">

      <p className="text-cyan-500 text-xs tracking-[0.35em] mb-5">
        ORION AI TERMINAL
      </p>

      <div className="font-mono text-cyan-200 leading-8">

        {displayedLines.map((line, index) => (
          <p key={index}>
            &gt; {line}
          </p>
        ))}

        {currentLine < lines.length && (
          <p>
            &gt; {currentText}
            <span className="animate-pulse">█</span>
          </p>
        )}

      </div>

    </div>
  );
}