"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import QRCodeScanner from "./QRCodeScanner";
import Terminal from "./Terminal";
import TypewriterText from "./TypewriterText";
type Mission = {
  id: number;
  title: string;
  story: string;
  hint: string;
  answer: string;
};

const TOTAL_MISSIONS = 12;
const validationMessages: Record<number, string> = {
  1: "PROTOCOLE 01 VALIDÉ",
  2: "ARCHIVE DÉCHIFFRÉE",
  3: "SIGNAL RETROUVÉ",
  4: "BALISE ACTIVÉE",
  5: "FRAGMENT RÉCUPÉRÉ",
  6: "CHOIX ENREGISTRÉ",
  7: "INTERFÉRENCES FILTRÉES",
  8: "MÉMOIRE RESTAURÉE",
  9: "VERROU ANALYSÉ",
  10: "CHEMIN CONFIRMÉ",
  11: "DERNIER ACCÈS OUVERT",
  12: "MISSION FINALE VALIDÉE",
};
 const orionMessages: Record<number, string> = {
  1: `Bonjour LES GARDIENS.

Je suis ORION.

Votre mission commence maintenant.`,

  2: `Excellent travail.

Le premier protocole est validé.

Poursuivez votre progression.`,

  3: `Le signal devient plus clair.

Continuez vos recherches.`,

  4: `Les archives révèlent de nouvelles informations.`,

  5: `Votre équipe dépasse les prévisions.`,

  6: `Synchronisation parfaite.`,

  7: `Transmission sécurisée...`,

  8: `Les fragments sont presque réunis.`,

  9: `ORION détecte une anomalie...`,

  10: `Accès au secteur final accordé.`,

  11: `Préparez-vous.

La dernière épreuve approche.`,

  12: `Les Gardiens...

Vous êtes prêts.

Terminez la mission.`,
};
export default function BootScreen() {
  const [teamName, setTeamName] = useState("Recherche...");
  const [mission, setMission] = useState<Mission | null>(null);
  const [started, setStarted] = useState(false);
  const [bootComplete, setBootComplete] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [finished, setFinished] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [waitingForQR, setWaitingForQR] = useState(false);
  const [missionValidated, setMissionValidated] = useState(false);
  const [validationStep, setValidationStep] = useState(0);
  const [unlockingMission, setUnlockingMission] = useState(false);
  const [bootStep, setBootStep] = useState(0);
const bootLines = [
  "> Initialisation du noyau ORION...",
  "> Vérification des protocoles...",
  "> Connexion sécurisée...",
  "> Identification de l'équipe...",
  `> ${teamName} détectés.`,
  "> Chargement de la mission...",
];
  async function loadMission(missionId: number) {
    const { data } = await supabase
      .from("missions")
      .select("id, title, story, hint, answer")
      .eq("id", missionId)
      .single();

    if (data) {
  setMission(data);
  setStarted(false);
  setUserAnswer("");
  setMessage("");
  setShowHint(false);
  setWaitingForQR(false);
  setShowScanner(false);
}
  }

  useEffect(() => {
    async function loadData() {
      const { data: teamData } = await supabase
        .from("teams")
        .select("name, current_mission")
        .limit(1);

      if (teamData && teamData.length > 0) {
        setTeamName(teamData[0].name);
        const params = new URLSearchParams(window.location.search);
const qrCode = params.get("qr");

if (qrCode) {
  const { data } = await supabase
    .from("missions")
    .select("*")
    .eq("qr_code", qrCode)
    .single();

  if (data) {
    await loadMission(data.id);
    return;
  }
}

await loadMission(teamData[0].current_mission || 1);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
  const timers = [
  setTimeout(() => {
    playSound("beep");
    setBootStep(1);
  }, 500),

  setTimeout(() => {
    playSound("beep");
    setBootStep(2);
  }, 1200),

  setTimeout(() => {
    playSound("beep");
    setBootStep(3);
  }, 1900),

  setTimeout(() => {
    playSound("beep");
    setBootStep(4);
  }, 2600),

  setTimeout(() => {
    playSound("success");
    setBootStep(5);
  }, 3300),

  setTimeout(() => {
    playSound("unlock");
    setBootStep(6);
  }, 4000),

  setTimeout(() => {
    playSound("success");
    setBootComplete(true);
  }, 5000),
];

return () => timers.forEach(clearTimeout);
}, [teamName]);

  function playSound(sound: string) {
  const audio = new Audio(`/sounds/${sound}.wav`);
  audio.volume = 0.4;
  audio.play().catch(() => {});
}
async function checkAnswer(scannedAnswer?: string) {
    const answer = (scannedAnswer || userAnswer).trim().toLowerCase();
   if (!answer) {
  setMessage("⚠️ Entrez une réponse.");
  return;
}
 if (!mission) return;

    if (
  answer !==
  mission.answer.trim().toLowerCase()
) {
      playSound("error");
      setMessage("❌ Mauvaise réponse. Réessayez.");
      return;
    }

    async function resetGame() {
  await supabase
    .from("teams")
    .update({ current_mission: 1 })
    .eq("name", teamName);

  setFinished(false);
  await loadMission(1);
  setShowHint(false);
}
setMissionValidated(true);
setValidationStep(1);

setMissionValidated(true);
setValidationStep(1);
playSound("beep");

setTimeout(() => {
  playSound("beep");
  setValidationStep(2);
}, 1000);

setTimeout(() => {
  playSound("success");
  setValidationStep(3);
}, 2000);

setTimeout(() => {
  playSound("unlock");
  setValidationStep(4);
}, 3000);

setTimeout(() => {
  setValidationStep(5);
  setWaitingForQR(true);
}, 4000);

    const nextMission = mission.id + 1;

    if (mission.id >= TOTAL_MISSIONS) {
      setTimeout(() => setFinished(true), 1500);
      return;
    }

    //await supabase
      //.from("teams")
      //.update({ current_mission: nextMission })
      //.eq("name", teamName);

    //setTimeout(() => {
      //loadMission(nextMission);
    //}, 1500);
  }

  const progress = mission ? (mission.id / TOTAL_MISSIONS) * 100 : 0;
const orionLines = useMemo(() => {
  return (orionMessages[mission?.id || 1] || "Bonne chance.")
    .split("\n")
    .filter(Boolean);
}, [mission?.id]);
  if (!started) {
  return (
    <main className="min-h-screen bg-[#050816] text-[#E8F1FF] flex items-center justify-center px-6">
      <section className="w-full max-w-xl border border-cyan-400/30 rounded-2xl p-10 text-center shadow-[0_0_40px_rgba(0,194,255,0.15)]">

        <p className="text-cyan-400 tracking-[0.4em] text-sm mb-6">
          ORION SYSTEM
        </p>

        <h1 className="text-7xl font-black tracking-[0.45em] text-cyan-400 mb-6">
          ORION
        </h1>

        <p className="text-gray-400 mb-10">
          Système d'investigation immersif
        </p>

        <button
          onClick={() => {
            playSound("boot");
            setStarted(true);
          }}
          className="w-full bg-cyan-500 hover:bg-cyan-400 transition-all duration-300 rounded-xl py-5 text-2xl font-bold shadow-[0_0_25px_rgba(0,194,255,0.35)]"
        >
          ▶ DÉMARRER ORION
        </button>

      </section>
    </main>
  );
}
if (!bootComplete) {
    return (
      <main className="min-h-screen bg-[#050816] text-[#E8F1FF] flex items-center justify-center px-6">
        <section className="w-full max-w-xl text-center border border-cyan-400/30 rounded-2xl p-10 shadow-[0_0_40px_rgba(0,194,255,0.15)]">
          <p className="text-cyan-400 text-sm tracking-[0.35em] mb-6">
            ORION SYSTEM
          </p>
          <h1 className="text-5xl font-black tracking-[0.35em] text-cyan-400 mb-8">
            ORION
          </h1>
          <div className="mt-8 rounded-xl bg-black border border-cyan-500 p-5 font-mono text-cyan-400 text-left">
  {bootLines.slice(0, bootStep).map((line, index) => (
    <p key={index} className="mb-2">
      {line}
    </p>
  ))}
</div>
        </section>
      </main>
    );
  }
  
  if (analyzing) {
  return (
    <main className="min-h-screen bg-[#050816] text-[#E8F1FF] flex items-center justify-center px-6">
      <section className="w-full max-w-xl border border-cyan-400/30 rounded-2xl p-10 text-center shadow-[0_0_40px_rgba(0,194,255,0.15)]">

        <Terminal
  lines={[
    "> QR CODE DÉTECTÉ",
    "> Analyse en cours...",
    "> Vérification de l'identifiant...",
    "> Connexion à ORION...",
    "> Mission autorisée."
  ]}
/>

        <div className="w-full h-2 bg-slate-800 rounded-full mt-8 overflow-hidden">
          <div className="h-full bg-cyan-400 animate-pulse w-full"></div>
        </div>

      </section>
    </main>
  );
}

  if (missionValidated && mission) {
  return (
    <main className="min-h-screen bg-[#050816] text-[#E8F1FF] flex items-center justify-center px-6">
      <section className="w-full max-w-xl border border-cyan-400/30 rounded-2xl p-10 text-center shadow-[0_0_40px_rgba(0,194,255,0.15)]">
        <p className="text-cyan-400 tracking-[0.35em] text-sm mb-6">
          ORION SYSTEM
        </p>

        <div className="text-gray-300 mb-8 leading-8">

  {validationStep >= 1 && (
    <p>Analyse terminée...</p>
  )}

  {validationStep >= 2 && (
    <p className="mt-3">Progression enregistrée...</p>
  )}

  {validationStep >= 3 && (
    <h1 className="mt-6 text-4xl font-black text-cyan-400">
      {validationMessages[mission.id] || "MISSION VALIDÉE"}
    </h1>
  )}

  {validationStep >= 4 && (
    <p className="mt-6">Accès au prochain point autorisé.</p>
  )}

  {validationStep >= 5 && (
    <>
      <p className="mt-8">
        Déplacez-vous vers
      </p>

      <p className="text-cyan-300 text-2xl font-bold mt-2">
        POINT {String(mission.id + 1).padStart(2, "0")}
      </p>
    </>
  )}

</div>

        {validationStep >= 5 && (
  <button
    onClick={() => {
  setMissionValidated(false);
  setShowScanner(true);
}}
    className="w-full bg-cyan-500 hover:bg-cyan-400 rounded-lg py-4 font-bold text-lg"
  >
    📷 SCANNER LE QR CODE
  </button>
)}
      </section>
    </main>
  );
}
if (showScanner && mission) {
  return (
    <main className="min-h-screen bg-[#050816] text-[#E8F1FF] flex items-center justify-center px-6">
      <section className="w-full max-w-xl border border-cyan-400/30 rounded-2xl p-10 text-center shadow-[0_0_40px_rgba(0,194,255,0.15)]">
        <p className="text-cyan-400 tracking-[0.35em] text-sm mb-6">
          ORION SYSTEM
        </p>

        <h1 className="text-4xl font-black text-cyan-400 mb-6">
          SCAN DU POINT
        </h1>

        <p className="text-gray-300 mb-6">Veuillez scanner</p>

        <p className="text-cyan-300 text-3xl font-bold mb-8">
          POINT {String(mission.id + 1).padStart(2, "0")}
        </p>

        <QRCodeScanner
          onScan={(text) => {
            setAnalyzing(true);
            playSound("scanner");

            setTimeout(async () => {
              let scannedValue = text;

              try {
                const url = new URL(text);
                scannedValue = url.searchParams.get("qr") || text;
              } catch {
                scannedValue = text;
              }

              setAnalyzing(false);

              const expectedQR = String(mission.id + 1).padStart(2, "0");

              if (scannedValue !== expectedQR) {
                setMessage(`❌ Mauvais QR Code. Scannez le QR Code ${expectedQR}.`);
                return;
              }

              setShowScanner(false);
              setUnlockingMission(true);
              playSound("unlock");

              setTimeout(async () => {
                await loadMission(mission.id + 1);

                await supabase
                  .from("teams")
                  .update({ current_mission: mission.id + 1 })
                  .eq("name", teamName);

                setUnlockingMission(false);
                setMessage("");
              }, 2200);
            }, 2500);
          }}
        />

        <p className="mt-6 text-center font-bold">{message}</p>
      </section>
    </main>
  );
}
if (unlockingMission && mission) {
  return (
    <main className="min-h-screen bg-[#050816] text-[#E8F1FF] flex items-center justify-center px-6">
      <section className="w-full max-w-xl border border-cyan-400/30 rounded-2xl p-10 text-center shadow-[0_0_40px_rgba(0,194,255,0.15)]">

        <p className="text-cyan-400 tracking-[0.35em] text-sm mb-6">
          ORION SYSTEM
        </p>

        <h1 className="text-4xl font-black text-cyan-400 mb-8 animate-pulse">
          QR AUTHENTIFIÉ
        </h1>

        <p className="text-gray-300 mb-3">
          Point {String(mission.id + 1).padStart(2, "0")} validé
        </p>

        <p className="text-cyan-300 mb-8">
          Déverrouillage de la mission...
        </p>

        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-400 animate-pulse w-full"></div>
        </div>

      </section>
    </main>
  );
}
if (finished) {

  return (
    <main className="min-h-screen bg-[#050816] text-[#E8F1FF] flex items-center justify-center px-6">
      <section className="w-full max-w-xl text-center border border-cyan-400/30 rounded-2xl p-10">
        <h1 className="text-4xl font-black text-cyan-400 mb-6">
          MISSION TERMINÉE
        </h1>

        <p className="text-gray-200">
          Félicitations {teamName}. Vous êtes devenus les Gardiens du Secret.
        </p>

        <p className="mt-6 text-cyan-300 text-2xl font-bold">
          Code final : 49281736595
        </p>
      </section>
    </main>
  );
}

  return (
    <main className="min-h-screen bg-[#050816] text-[#E8F1FF] flex items-center justify-center px-4 py-8">
      <section className="w-full max-w-xl border border-cyan-400/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,194,255,0.15)]">
        <p className="text-cyan-400 text-xs sm:text-sm tracking-[0.35em] mb-5 text-center">
          ORION SYSTEM
        </p>

        <h1 className="text-4xl sm:text-5xl font-black tracking-[0.35em] text-cyan-400 mb-6 text-center">
          ORION
        </h1>

        <p className="text-gray-300 font-mono text-center text-sm sm:text-base">
          ÉQUIPE : {teamName}
        </p>

        {mission && (
          <>
            <div className="mt-6">
              <div className="flex justify-between text-xs text-cyan-300 mb-2">
                <span>MISSION {mission.id} / {TOTAL_MISSIONS}</span>
                <span>{Math.round(progress)}%</span>
              </div>

              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="mt-8 border border-cyan-400/20 rounded-xl p-5 sm:p-6 bg-white/5">
              <p className="text-cyan-300 text-sm mb-2">
                MISSION {mission.id}
              </p>

              <h2 className="text-2xl font-bold mb-4">
                {mission.title}
              </h2>
              <div className="mt-6 mb-8">
 <TypewriterText lines={orionLines} />
</div>

              {!started ? (
                <button
                  onClick={() => setStarted(true)}
                  className="mt-4 w-full px-6 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 transition font-bold text-white"
                >
                  COMMENCER LA MISSION
                </button>
              ) : (
                <>
                  <p className="text-gray-200 leading-relaxed whitespace-pre-line">
                    {mission.story}
                  </p>

                  {!showHint ? (
  <button
    onClick={() => setShowHint(true)}
    className="mt-6 w-full border border-cyan-400 text-cyan-300 rounded-lg py-3 font-bold hover:bg-cyan-950/50"
  >
    DEMANDER UN INDICE
  </button>
) : (
  <div className="mt-6 p-4 rounded-lg bg-cyan-950/50 border border-cyan-400/20">
    <p className="text-cyan-300 font-semibold mb-2">Indice</p>
    <p className="text-gray-300">{mission.hint}</p>
  </div>
)}

                  <div className="mt-8">
                    
<p className="mb-2 text-cyan-300 font-semibold">
                      Votre réponse
                    </p>

                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="w-full rounded-lg bg-[#0c1226] border border-cyan-500 p-3 text-white"
                      placeholder="Entrez votre réponse..."
                    />

                    <button
                      onClick={() => checkAnswer()}
                      className="mt-4 w-full bg-cyan-500 hover:bg-cyan-400 rounded-lg py-3 font-bold"
                    >
                      VALIDER
                    </button>

                    <p className="mt-4 text-center font-bold">
                      {message}
                    </p>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}