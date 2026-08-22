import { artists, hiphopArtists, teknoArtists } from "@/data/artists";

export function RosterBoard() {
  return (
    <div className="roster-board" aria-label={`${artists.length} artiesten: ${teknoArtists.length} Tekno en ${hiphopArtists.length} Hip hop`}>
      <div className="roster-board-head">
        <img src="/assets/kw-wordmark.png" alt="Kwartier West" />
        <b>{artists.length}</b>
      </div>
      <div className="roster-board-body">
        <div className="roster-board-grid">
          {artists.map((artist, index) => (
            <figure key={artist.slug} data-media-kind={artist.mediaKind}>
              <img src={artist.image} alt={artist.name} loading={index < 7 ? "eager" : "lazy"} />
              <figcaption><small>{String(index + 1).padStart(2, "0")}</small><span>{artist.name}</span></figcaption>
            </figure>
          ))}
        </div>
        <aside>
          <h3>Roster</h3>
          <p><b>{String(teknoArtists.length).padStart(2, "0")}</b> Tekno</p>
          <p><b>{String(hiphopArtists.length).padStart(2, "0")}</b> Hip hop</p>
          <i />
          <span>{artists.length} artiesten.<br />Twee scenes.<br />Eén collectief.</span>
        </aside>
      </div>
    </div>
  );
}
