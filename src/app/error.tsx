"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main" className="not-found">
      <section className="error-card section-pad">
        <span className="eyebrow">Kwartier West / fout</span>
        <h1>Hier liep iets vast.</h1>
        <p>De pagina kon niet correct geladen worden. Probeer opnieuw.</p>
        <button className="text-link" type="button" onClick={reset}>Probeer opnieuw</button>
      </section>
    </main>
  );
}
