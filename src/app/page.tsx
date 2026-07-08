"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const team = localStorage.getItem("orion_team");

    if (team) {
      router.replace("/orion");
    } else {
      router.replace("/inscription");
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-[#050816] flex items-center justify-center">
      <p className="text-cyan-400 animate-pulse font-mono">
        Initialisation d'ORION...
      </p>
    </main>
  );
}