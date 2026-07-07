"use client";

type Props = {
  fragments: number;
};

export default function Scene02Restore({ fragments }: Props) {

  return (

    <main className="min-h-screen bg-black text-cyan-400 flex items-center justify-center px-6">

      <section className="w-full max-w-xl border border-cyan-500 rounded-2xl p-8">

        <p className="text-center tracking-[0.3em] text-xs mb-6">
          ORION MEMORY CORE
        </p>

        <h1 className="text-3xl font-black text-center mb-8">
          RESTAURATION EN COURS
        </h1>

        <div className="space-y-2">

          {Array.from({ length: fragments }).map((_, index) => (

            <p key={index}>
              Fragment {String(index + 1).padStart(2, "0")} ✓
            </p>

          ))}

        </div>

        {fragments >= 12 && (

          <h2 className="text-center mt-10 text-2xl font-black animate-pulse">

            MÉMOIRE ORION : 100 %

          </h2>

        )}

      </section>

    </main>

  );

}