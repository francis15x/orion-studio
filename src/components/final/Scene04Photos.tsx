"use client";

import { useEffect, useState } from "react";
import TypewriterText from "../TypewriterText";
import { memories } from "./photos";

export default function Scene04Photos() {
  const [memoryIndex, setMemoryIndex] = useState(0);

  const memory = memories[memoryIndex];

  useEffect(() => {
    const timer = setTimeout(() => {
      setMemoryIndex((current) => {
        if (current >= memories.length - 1) {
          return current;
        }

        return current + 1;
      });
    }, 6500);

    return () => clearTimeout(timer);
  }, [memoryIndex]);

  return (
    <main className="min-h-screen bg-black text-cyan-300 flex items-center justify-center px-6">
      <section className="w-full max-w-4xl text-center font-mono">
        <p className="text-cyan-500 text-xs tracking-[0.35em] mb-6">
          ORION MEMORY ARCHIVE
        </p>

        <div className="relative overflow-hidden rounded-2xl border border-cyan-500 shadow-[0_0_35px_rgba(0,194,255,0.25)]">
          <img
            src={memory.image}
            alt={memory.title}
            className="w-full h-[320px] object-cover opacity-80"
          />

          <div className="absolute inset-0 bg-black/35" />
        </div>

        <h1 className="mt-6 text-3xl font-black text-cyan-400">
          {memory.title}
        </h1>

        <p className="mt-2 text-xl text-white font-bold">
          {memory.value}
        </p>

        <div className="mt-6">
          <TypewriterText lines={memory.text} speed={45} />
        </div>
      </section>
    </main>
  );
}