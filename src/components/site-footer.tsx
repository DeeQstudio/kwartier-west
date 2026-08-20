import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-mark"><img src="/assets/kw-wordmark.png" alt="Kwartier West" /></div>
      <div className="footer-cols">
        <div>
          <b>Kwartier West</b>
          <Link href="/tekno">Tekno</Link>
          <Link href="/hiphop">Hip hop</Link>
          <Link href="/artiesten">Artiesten</Link>
          <Link href="/events">Events</Link>
          <Link href="/archive">Archief</Link>
        </div>
        <div>
          <b>Praktisch</b>
          <Link href="/booking">Boekingsdesk</Link>
          <Link href="/partners">Partners</Link>
          <Link href="/manifest">Manifest</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div>
          <b>Volg</b>
          <a href="https://www.instagram.com/kwtr_west/" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://www.facebook.com/profile.php?id=61557994985369" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="https://soundcloud.com/kwartier-west" target="_blank" rel="noopener noreferrer">SoundCloud</a>
        </div>
        <div>
          <b>Info</b>
          <Link href="/privacy">Privacy</Link>
          <Link href="/voorwaarden">Voorwaarden</Link>
          <a href="https://www.deeqstudio.com/" target="_blank" rel="noopener noreferrer">Digital partner DeeQ Studio</a>
        </div>
      </div>
      <div className="footer-base"><span>© 2026 Kwartier West</span><span>Brugge, België</span></div>
    </footer>
  );
}
