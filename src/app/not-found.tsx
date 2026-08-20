import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="not-found">
      <section className="notfound"><div><span>404 / verkeerde kant</span><h1>Hier staat<br />niets.</h1><p>De scene bestaat nog. Deze URL niet.</p><Link href="/">Terug naar Kwartier West</Link></div><img src="/assets/kw-wordmark.png" alt="Kwartier West" /></section>
    </main>
  );
}
