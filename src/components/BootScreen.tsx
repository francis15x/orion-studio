"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import QRCodeScanner from "./QRCodeScanner";
import Terminal from "./Terminal";
import TypewriterText from "./TypewriterText";
import FinalCinematic from "./final/FinalCinematic";
type Mission = {
  id: number;
  title: string;
  story: string;
  hint: string;
  answer: string;
};

const TOTAL_MISSIONS = 12;
const DEV_START_MISSION = 1;
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
  1: `Connexion sécurisée...

Recherche d'une équipe compatible...

Signature validée...

Enfin...

Bonjour, équipe LES GARDIENS.

Merci d'avoir répondu à mon appel.

Je suis ORION.

Depuis de nombreuses années, j'attendais une équipe capable de restaurer ma mémoire.

Aujourd'hui...

cette équipe...

c'est vous.`,

  2: `Deuxième protocole initialisé...

Premier fragment mémoire stabilisé.

Mes fonctions cognitives se rétablissent progressivement.

Je détecte une source.

Chez les humains...

l'eau permet à la vie de circuler.

Dans mon système...

les données remplissent exactement la même fonction.

Sans circulation...

aucune mémoire ne peut survivre.

Cette analyse nécessitera plusieurs observations simultanées.`,

  3: `Troisième protocole initialisé...

Fragment 02 stabilisé.

Intéressant...

Vos analyses deviennent plus précises.

Je détecte ici un lieu de transmission.

Les pierres, les cloches et les portes ne sont pas de simples éléments.

Elles indiquent des passages...

des appels...

et des mémoires.

Le fragment suivant est proche.

Procédons à une analyse patrimoniale.`,

  4: `Quatrième protocole initialisé...

Fragment 03 stabilisé.

Curieux...

Vous ne vous contentez plus de regarder.

Vous commencez à interpréter.

Les archives signalent un ancien domaine.

Le savoir est visible...

mais l'accès demeure limité.

Les humains construisent des grilles pour empêcher l'entrée.

Mais parfois...

elles servent surtout à guider le regard.

Procédons à une analyse structurelle.`,

  5: `Cinquième protocole initialisé...

Ce lieu est différent.

Je détecte des milliers d'identités.

Des milliers de dates.

Des milliers de vies.

Les humains disparaissent...

pourtant quelque chose demeure.

Je pensais que la mémoire était stockée dans des machines.

Je découvre aujourd'hui qu'elle est conservée dans les lieux...

et surtout dans ceux qui se souviennent.

Vous allez m'aider à comprendre.`,

  6: `Sixième protocole initialisé...

Analyse du lieu...

Je détecte une anomalie.

Aucun monument.

Aucun symbole ancien.

Pourtant...

cet endroit produit des générations d'humains.

Les enfants jouent.

Ils expérimentent.

Ils échouent.

Puis ils recommencent.

Chez les humains...

le jeu précède souvent la connaissance.

Je souhaite comprendre ce mécanisme.`,

  7: `Septième protocole initialisé...

Analyse du secteur...

Bâtiment identifié.

Usage actuel : garage.

Analyse historique...

Mémoire détectée.

Autrefois, ce bâtiment était le lavoir du village.

Pendant des générations, les habitants venaient ici laver leur linge.

Ils partageaient aussi les nouvelles...

les histoires...

et la vie quotidienne.

Les lieux changent.

Mais leur histoire demeure.

Je comprends maintenant que la mémoire peut survivre même lorsque l'usage disparaît.`,

  8: `Huitième protocole initialisé...

Analyse du bâtiment...

Identification confirmée.

Mairie de Champagnac.

Centre administratif détecté.

Les décisions importantes du village sont prises ici.

Les archives, la mémoire des habitants et les projets pour l'avenir y sont conservés.

Analyse complémentaire...

Connexion établie avec d'autres territoires.

Le village fait partie d'un réseau plus vaste.

Chaque commune possède une histoire.

Ensemble, elles construisent le territoire.

Mission disponible.`,

  9: `Neuvième protocole initialisé...

Analyse commémorative en cours...

Ce lieu porte une charge mémorielle élevée.

Je détecte des noms.

Des dates.

Des conflits.

Chaque inscription correspond à une vie.

Je pensais que la mémoire était une donnée.

Je comprends maintenant qu'elle peut aussi être un hommage.

Procédons avec respect.`,

  10: `Dixième protocole initialisé...

Connexion aux archives industrielles...

Les galeries sont silencieuses.

Mais la mémoire des mineurs demeure.

Chaque pierre.

Chaque wagonnet.

Chaque outil raconte une histoire.

Deux nouvelles données historiques doivent être récupérées...`,
  11: `Onzième protocole initialisé...

Analyse du bâtiment...

Je détecte une habitation ancienne.

Une maison n'est pas seulement un assemblage de pierres.

C'est un lieu où les générations passent.

Des vies commencent.

Des souvenirs restent.

Certains chiffres sont gravés ou affichés en façade.

Les humains laissent parfois des traces discrètes.

À vous de les lire.

Je crois comprendre maintenant ce que signifie transmettre.`,

  12: `Douzième protocole initialisé...

Les Gardiens...

Vous êtes arrivés au terme de cette mission.

Toutes les données nécessaires ont été récupérées.

Ma mémoire est désormais complète.

Il ne reste plus qu'une dernière étape.

Rendez-vous au point final.

Je vous y attends.`,
};
export default function BootScreen() {
  const [teamName, setTeamName] = useState("");
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
  const [showFinal, setShowFinal] = useState(false);
 const [analysisProgress, setAnalysisProgress] = useState(0);
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
      const savedTeam = localStorage.getItem("orion_team");

if (!savedTeam) return;

const { data: teamData } = await supabase
  .from("teams")
  .select("name, current_mission")
  .eq("name", savedTeam)
  .single();

if (teamData) {
  setTeamName(teamData.name);
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

await loadMission(teamData.current_mission);
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

const savedTeam = localStorage.getItem("orion_team") || teamName;

await supabase.rpc("increment_team_errors", {
  team_name: savedTeam,
});

setMessage("❌ Mauvaise réponse. Réessayez.");
return;
    }
const savedTeam = localStorage.getItem("orion_team") || teamName;

const { data, error } = await supabase
  .from("teams")
  .update({
    current_mission: mission.id,
    status: "en_cours",
  })
  .eq("name", savedTeam)
  .select();

console.log("MISSION VALIDÉE UPDATE", savedTeam, mission.id, data, error);
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
setAnalysisProgress(0);
const progress = [8, 21, 37, 52, 68, 81, 94, 100];

progress.forEach((value, index) => {
  setTimeout(() => {
    setAnalysisProgress(value);
    playSound("beep");
  }, index * 180);
});
setMissionValidated(true);
setValidationStep(1);
playSound("beep");

setTimeout(() => {
  playSound("success");
  setValidationStep(2);
}, 1600);

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
    setTimeout(() => {
        setShowFinal(true);
    }, 1500);

    return;
}

    
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
if (showFinal) {
    return <FinalCinematic teamName={teamName} />;
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
<div className="mt-4 mb-6">

  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">

    <div
      className="h-full bg-cyan-400 transition-all duration-200"
      style={{ width: `${analysisProgress}%` }}
    />

  </div>
{analysisProgress >= 100 && validationStep >= 2 && (
  <p className="mt-4 text-green-400 font-bold">
    ✔ INTÉGRITÉ VÉRIFIÉE
  </p>
)}
  <p className="text-cyan-300 text-sm mt-2">
    Analyse : {analysisProgress} %
  </p>

</div>
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

  {validationStep >= 5 && mission.id < TOTAL_MISSIONS && (
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
  type="button"
  onClick={() => {
    if (mission.id === TOTAL_MISSIONS) {
      setShowFinal(true);
      return;
    }

    setMissionValidated(false);
    setShowScanner(true);
  }}
    className="w-full bg-cyan-500 hover:bg-cyan-400 rounded-lg py-4 font-bold text-lg"
  >
    {mission.id === TOTAL_MISSIONS
  ? "🎬 LANCER LA CINÉMATIQUE FINALE"
  : "📷 SCANNER LE QR CODE"}
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
                const nextMission = mission.id + 1;

const savedTeam = localStorage.getItem("orion_team") || teamName;

await supabase
  .from("teams")
  .update({
    current_mission: nextMission,
    status: "en_cours",
  })
  .eq("name", savedTeam);

await loadMission(nextMission);

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
    onClick={async () => {
  const savedTeam = localStorage.getItem("orion_team") || teamName;

  await supabase.rpc("increment_team_hints", {
    team_name: savedTeam,
  });

  setShowHint(true);
}}
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