const DEFAULT_LANGUAGE = "nl";
const UNKNOWN_LANGUAGE_FALLBACK = DEFAULT_LANGUAGE;

const LANGUAGES = [
  { code: "nl", label: "Nederlands" },
  { code: "en", label: "English" }
];

const RTL_LANGUAGES = new Set();

const EN = {
  "common.language": "Language",
  "common.noPhoto": "No photo",
  "common.loading": "Loading...",
  "common.datePending": "Date pending",
  "common.na": "n/a",
  "common.tba": "TBA",
  "common.profile": "Profile",
  "common.copyJson": "Copy JSON",
  "common.copied": "Copied",
  "common.copyFailed": "Copy failed",

  "nav.skip": "Skip to content",
  "nav.menu": "Menu",
  "nav.mainAria": "Kwartier West navigation",
  "nav.homeAria": "Kwartier West home",
  "nav.sideSwitchAria": "Switch between collectives",
  "nav.events": "Events",
  "nav.tekno": "Tekno",
  "nav.hiphop": "Hip hop",
  "nav.bookings": "Bookings",
  "nav.shop": "Shop",
  "nav.partners": "Partners",
  "nav.contact": "Contact",
  "nav.bookingDesk": "Booking desk",
  "nav.manifest": "Manifest",
  "nav.teknoArtists": "Tekno artists",
  "nav.bookTekno": "Book Tekno",
  "nav.hiphopArtists": "Hip hop artists",
  "nav.bookHiphop": "Book Hip hop",
  "nav.compassAria": "West compass",
  "nav.compassWaiting": "West compass starts automatically on supported devices",
  "nav.compassReady": "West compass active",
  "nav.compassDecorative": "Compass visual mode on this device",
  "nav.compassDenied": "Compass permission denied",
  "nav.compassUnavailable": "Compass unavailable on this device",
  "nav.compassError": "Compass sensor error",
  "nav.compassDemo": "Compass demo mode",
  "nav.compassHeading": "West heading {angle} degrees",
  "rail.lane.aria": "Active lane",
  "rail.lane.title": "Active lane",
  "rail.lane.global": "Label-wide",
  "rail.quick.aria": "Fast routes",
  "rail.quick.title": "Fast routes",
  "rail.toc.aria": "On-page structure",
  "rail.toc.title": "On this page",
  "rail.toc.empty": "Sections are loading...",
  "rail.channels.aria": "Official channels",
  "rail.channels.title": "Official channels",
  "rail.channels.note": "Official channels.",

  "meta.home.title": "Kwartier West",
  "meta.home.description": "Kwartier West: Tekno and Hip hop collectives, events, bookings and merch.",
  "meta.tekno.title": "Kwartier West - Tekno",
  "meta.tekno.description": "Tekno collective of Kwartier West: artists, events and bookings.",
  "meta.hiphop.title": "Kwartier West - Hip hop",
  "meta.hiphop.description": "Hip hop collective of Kwartier West: artists, events and bookings.",
  "meta.events.title": "Kwartier West - Events",
  "meta.events.description": "Event hub with Tekno and Hip hop line-ups, tickets and official social sources.",
  "meta.shop.title": "Kwartier West - Shop",
  "meta.shop.description": "Storefront for Kwartier West merch and artist drops.",
  "meta.booking.title": "Kwartier West - Central booking desk",
  "meta.booking.description": "Central booking desk for Tekno, Hip hop and full label takeovers.",
  "meta.teknoBooking.title": "Kwartier West - Tekno booking",
  "meta.teknoBooking.description": "Book Tekno artists or the full Tekno collective.",
  "meta.hiphopBooking.title": "Kwartier West - Hip hop booking",
  "meta.hiphopBooking.description": "Book Hip hop artists or the full Hip hop collective.",
  "meta.teknoArtist.title": "Kwartier West - Tekno artist",
  "meta.teknoArtist.description": "Artist detail page for Tekno talents within Kwartier West.",
  "meta.hiphopArtist.title": "Kwartier West - Hip hop artist",
  "meta.hiphopArtist.description": "Artist detail page for Hip hop talents within Kwartier West.",
  "meta.contact.title": "Kwartier West - Contact",
  "meta.contact.description": "Contact Kwartier West for bookings, partnerships and production requests.",
  "meta.manifest.title": "Kwartier West - Manifest",
  "meta.manifest.description": "Manifest of Kwartier West: vision, values and operational rules.",
  "meta.partners.title": "Kwartier West - Partners",
  "meta.partners.description": "Trusted partners of Kwartier West across production, visuals, sound and operations.",
  "meta.tickets.title": "Kwartier West - Tickets",
  "meta.tickets.description": "Ticketing and access information for Kwartier West events.",

  "landing.quick.events": "Events",
  "landing.quick.aria": "Quick links",
  "landing.quick.booking": "Booking desk",
  "landing.quick.shop": "Shop",
  "landing.portal.aria": "Kwartier West portal",
  "landing.portal.instruction": "Click to enter.",
  "landing.tekno.eyebrow": "Tekno collective",
  "landing.tekno.title": "Tekno",
  "landing.tekno.desc": "Hardtek, acid pressure and soundsystem discipline.",
  "landing.tekno.open": "Open Tekno",
  "landing.tekno.book": "Book Tekno",
  "landing.tekno.aria": "Open Tekno portal",
  "landing.hiphop.eyebrow": "Hip hop collective",
  "landing.hiphop.title": "Hip hop",
  "landing.hiphop.desc": "Bars, producers and live energy with character.",
  "landing.hiphop.open": "Open Hip hop",
  "landing.hiphop.book": "Book Hip hop",
  "landing.hiphop.aria": "Open Hip hop portal",
  "landing.rift.main.aria": "Enter the main Kwartier West site",
  "landing.rift.main.title": "Enter the West",
  "landing.rift.tekno.aria": "Enter Tekno collective",
  "landing.rift.tekno.title": "Enter The Rhythm",
  "landing.rift.hiphop.aria": "Enter Hip hop collective",
  "landing.rift.hiphop.title": "Enter the Bars",
  "landing.footer.events": "Live event hub",
  "landing.footer.partners": "Partners",
  "landing.footer.contact": "Contact",
  "landing.footer.poweredPrefix": "Made by",
  "landing.footer.powered": "Powered by deeqstudio",
  "footer.title.platform": "Platform",
  "footer.title.collectives": "Collectives",
  "footer.title.label": "Label",
  "footer.title.info": "Info",
  "footer.note.appSoon": "App integration: coming later",
  "footer.note.privacySoon": "Privacy: coming soon",
  "footer.note.termsSoon": "Terms: coming soon",

  "tekno.hero.eyebrow": "Kwartier West / Tekno",
  "tekno.hero.title": "Tekno Collective",
  "tekno.hero.lead": "Raves, raw warehouse energy and live sets built for heavy systems.",
  "tekno.hero.collective": "Book Tekno collective",
  "tekno.hero.desk": "Open central booking desk",
  "tekno.events.title": "Events",
  "tekno.events.cta": "Open global event hub",
  "tekno.artists.title": "Artists",
  "tekno.artists.cta": "Book multiple artists",

  "hiphop.hero.eyebrow": "Kwartier West / Hip hop",
  "hiphop.hero.title": "Hip hop Collective",
  "hiphop.hero.lead": "Live bars, producers and performers ready for real stages.",
  "hiphop.hero.collective": "Book Hip hop collective",
  "hiphop.hero.desk": "Open central booking desk",
  "hiphop.events.title": "Events",
  "hiphop.events.cta": "Open global event hub",
  "hiphop.artists.title": "Artists",
  "hiphop.artists.cta": "Book multiple artists",

  "events.hero.eyebrow": "Kwartier West / Event hub",
  "events.hero.title": "Live Event Feed",
  "events.hero.lead": "One feed. Two scenes.",
  "events.filtersAria": "Event filters",
  "events.filter.all": "All",
  "events.filter.groupSide": "Filter by collective",
  "events.filter.groupScope": "Filter by period",
  "events.filter.tekno": "Tekno",
  "events.filter.hiphop": "Hip hop",
  "events.filter.upcoming": "Upcoming",
  "events.filter.allEvents": "All events",
  "events.filter.past": "Past",
  "events.ticketRequest": "Request access",
  "events.section.featured": "Featured",
  "events.section.sources": "Official source feed",
  "events.cta.takeover": "Book full takeover",
  "events.section.overview": "Event overview",
  "events.cta.production": "Contact production",
  "events.loading": "Loading events...",
  "events.error": "Events could not be loaded.",
  "events.none": "No events published yet.",
  "events.lineup": "Line-up",
  "events.lineupPending": "Line-up coming soon.",
  "events.ticketsTba": "Tickets: TBA",
  "events.bookSide": "Book {side}",
  "events.source": "Source",
  "events.sourceDefault": "Social",
  "events.source.live": "Live source connected.",
  "events.source.ready": "Source sync ready.",
  "events.source.noSource": "No source linked yet.",
  "events.visible": "{count} visible",
  "events.total": "{count} events",
  "events.ticketsLabel": "Tickets",
  "events.untitled": "Untitled event",

  "artists.loading": "Loading artists...",
  "artists.empty": "No artists available yet.",
  "artists.error": "Artists could not be loaded.",
  "artists.profile": "Profile",
  "artists.bookSolo": "Book solo",
  "artists.defaultName": "Unknown artist",
  "artists.defaultRole": "Artist",

  "artist.loading": "Loading artist...",
  "artist.notSelected": "No artist selected.",
  "artist.notFound": "Artist not found.",
  "artist.wrongSideTitle": "Artist is on the other side",
  "artist.wrongSideBody": "{name} belongs to {side}.",
  "artist.openCorrect": "Open correct profile",
  "artist.bookSolo": "Book solo",
  "artist.bookMultiple": "Book with multiple artists",
  "artist.hero.eyebrowTekno": "Tekno / Artist profile",
  "artist.hero.eyebrowHiphop": "Hip hop / Artist profile",
  "artist.section.signature": "Signature",
  "artist.section.live": "Live direction",
  "artist.section.focus": "Focus lanes",
  "artist.section.channels": "Channels",
  "artist.collectiveSuffix": "collective",
  "artist.focusEmpty": "No focus lanes published yet.",
  "artist.linksEmpty": "No public channels published yet.",

  "booking.hero.eyebrow": "Booking / Central desk",
  "booking.hero.eyebrowTekno": "Booking / Tekno",
  "booking.hero.eyebrowHiphop": "Booking / Hip hop",
  "booking.hero.title": "Book Kwartier West",
  "booking.hero.lead": "Pick a type and submit.",
  "booking.link.tekno": "Tekno artists",
  "booking.link.hiphop": "Hip hop artists",
  "booking.link.events": "Event hub",
  "booking.initial": "Fill in the form to prepare your booking request.",
  "booking.type.single.label": "Single artist",
  "booking.type.single.hint": "Book exactly one artist.",
  "booking.type.multiple.label": "Multiple artists",
  "booking.type.multiple.hint": "Book a selected group of artists.",
  "booking.type.side.label": "Collective (per side)",
  "booking.type.side.hint": "Book the complete Tekno or Hip hop collective.",
  "booking.type.full.label": "Full label takeover",
  "booking.type.full.hint": "Book Tekno and Hip hop together.",
  "booking.form.type": "Booking type",
  "booking.form.collective": "Collective",
  "booking.form.artistSelection": "Artist selection",
  "booking.form.artistNotNeeded": "Artist selection is not required for this booking type.",
  "booking.form.chooseSide": "Choose Tekno or Hip hop first for a side collective booking.",
  "booking.form.eventName": "Event name",
  "booking.form.eventDate": "Event date",
  "booking.form.startTime": "Start time",
  "booking.form.city": "City / region",
  "booking.form.venue": "Venue",
  "booking.form.attendance": "Expected attendance",
  "booking.form.budget": "Budget (EUR)",
  "booking.form.setLength": "Set length (min)",
  "booking.form.contactName": "Contact name",
  "booking.form.contactEmail": "Contact email",
  "booking.form.phone": "Phone",
  "booking.form.org": "Organisation",
  "booking.form.notes": "Technical and production notes",
  "booking.form.submit": "Send request",
  "booking.form.helper": "After submit, the website sends your request automatically.",
  "booking.form.placeholder.eventName": "Warehouse Pressure Night",
  "booking.form.placeholder.city": "Roeselare",
  "booking.form.placeholder.venue": "Venue",
  "booking.form.placeholder.attendance": "350",
  "booking.form.placeholder.budget": "2500",
  "booking.form.placeholder.setLength": "60",
  "booking.form.placeholder.contactName": "Jane Doe",
  "booking.form.placeholder.contactEmail": "name@domain.com",
  "booking.form.placeholder.phone": "+32 ...",
  "booking.form.placeholder.organisation": "Crew / venue / agency",
  "booking.form.placeholder.notes": "PA, monitors, stage setup, curfew",
  "booking.validate.name": "Contact name is required.",
  "booking.validate.email": "Provide a valid email address.",
  "booking.validate.event": "Event date and city are required.",
  "booking.validate.single": "Select exactly 1 artist for a single booking.",
  "booking.validate.multiple": "Select at least 2 artists for a multiple booking.",
  "booking.validate.side": "Choose Tekno or Hip hop for a side collective booking.",
  "booking.result.title": "Booking request ready",
  "booking.result.reference": "Reference",
  "booking.result.mail": "Email draft",
  "booking.result.webhookDisabled": "Automatic sending isn't configured yet.",
  "booking.result.webhookOk": "Request sent successfully from the website.",
  "booking.result.webhookFail": "Sending failed",
  "booking.result.webhookHttp": "Server status {status}",
  "booking.result.webhookNetwork": "Network or timeout error",
  "booking.loadArtistsError": "Artists couldn't be loaded. Please try again later.",
  "booking.summary.artists": "Artists",
  "booking.summary.event": "Event",
  "booking.summary.venue": "Venue",
  "booking.summary.budget": "Budget",
  "booking.summary.contact": "Contact",
  "booking.summary.json": "Request details",

  "shop.hero.eyebrow": "Merch / Storefront",
  "shop.hero.title": "Kwartier West Shop",
  "shop.hero.lead": "Label merch and artist drops.",
  "shop.search.label": "Search merch",
  "shop.search.placeholder": "Search item or artist",
  "shop.filter.all": "All",
  "shop.filter.label": "Kwartier West",
  "shop.filter.artists": "Artist merch",
  "shop.filter.tekno": "Tekno",
  "shop.filter.hiphop": "Hip hop",
  "shop.filter.available": "Available",
  "shop.filter.comingSoon": "Coming soon",
  "shop.status.inStock": "In stock",
  "shop.status.preorder": "Pre-order",
  "shop.status.soldOut": "Sold out",
  "shop.status.comingSoon": "Coming soon",
  "shop.status.tba": "Status TBA",
  "shop.price.tba": "Price TBA",
  "shop.product.open": "Open product page",
  "shop.product.pending": "Product link coming soon",
  "shop.sizes": "Sizes",
  "shop.loading": "Loading shop...",
  "shop.empty": "No items found for this filter.",
  "shop.error": "Shop could not be loaded.",
  "shop.count": "{count} items",

  "partners.loading": "Loading partners...",
  "partners.empty": "No partners published yet.",
  "partners.error": "Partners could not be loaded.",
  "partners.linksPending": "Links coming soon.",
  "partners.hero.eyebrow": "Network / Trusted partners",
  "partners.hero.title": "Partners",
  "partners.hero.lead": "Studios, crews and operators shaping the West network.",
  "partners.hero.events": "Event hub",
  "partners.hero.become": "Become a partner",
  "partners.protocol.title": "How we collaborate",
  "partners.protocol.one": "Operational clarity first: production, timing and ownership are aligned before launch.",
  "partners.protocol.two": "Channel discipline: every partner has clear comms and response lanes.",
  "partners.protocol.three": "Collaborations that make sense and last.",
  "partners.protocol.cta": "Open contact desk",

  "contact.hero.eyebrow": "Contact / Production desk",
  "contact.hero.title": "Contact Kwartier West",
  "contact.hero.lead": "For bookings, production and partnerships.",
  "contact.hero.booking": "Open booking desk",
  "contact.hero.events": "Open event hub",
  "contact.tile.bookings.title": "Bookings",
  "contact.tile.bookings.meta": "Artists and collectives",
  "contact.tile.bookings.body": "Submit artist or collective requests via one intake.",
  "contact.tile.bookings.main": "Central booking desk",
  "contact.tile.bookings.tekno": "Tekno booking",
  "contact.tile.bookings.hiphop": "Hip hop booking",
  "contact.tile.channels.title": "General channels",
  "contact.tile.channels.meta": "Team contact",
  "contact.tile.channels.body": "General questions, collaborations and partner contact.",
  "contact.tile.integration.title": "App integration",
  "contact.tile.integration.meta": "Timeline",
  "contact.tile.integration.body": "The app comes later. Bookings, events and shop already run through this site.",
  "contact.tile.integration.cta": "View timeline",

  "manifest.hero.eyebrow": "This is the West",
  "manifest.hero.title": "Manifest",
  "manifest.hero.lead": "Two scenes. One standard.",
  "manifest.why.title": "Why two sides",
  "manifest.why.body": "Tekno and Hip hop move differently, but run on one production backbone.",
  "manifest.rules.title": "Our rules",
  "manifest.rules.one": "Artists remain owners of their identity and story.",
  "manifest.rules.two": "Events are programmed on quality and safety, not hype.",
  "manifest.rules.three": "Communication with promoters and venues stays tight, transparent and fast.",
  "manifest.rules.four": "We're already building with app integration in mind.",
  "manifest.platform.title": "What this platform does",
  "manifest.platform.one": "Process bookings per artist, multiple artists or full collective.",
  "manifest.platform.two": "Shows events with official source links.",
  "manifest.platform.three": "Combine merch: label drops and artist drops in one storefront.",
  "manifest.cta.booking": "Start booking",
  "manifest.cta.events": "View events",

  "tickets.hero.eyebrow": "Tickets / Access flow",
  "tickets.hero.title": "Tickets",
  "tickets.hero.lead": "Ticket status is managed per event from the event hub.",
  "tickets.hero.events": "Open event hub",
  "tickets.hero.support": "Ticket support",
  "tickets.status.title": "Ticket status",
  "tickets.status.external.label": "External:",
  "tickets.status.external.body": "Purchase on the organiser's platform.",
  "tickets.status.internal.label": "Internal:",
  "tickets.status.internal.body": "Access via the Kwartier West flow.",
  "tickets.status.tba.label": "TBA:",
  "tickets.status.tba.body": "Details follow once venue, capacity and production are confirmed.",
  "tickets.policy.title": "Entry policy",
  "tickets.policy.one": "Bring your confirmation or ticket.",
  "tickets.policy.two": "Respect venue rules and crew briefing.",
  "tickets.policy.three": "Door policy remains an operational decision by the organisation."
};

const NL = {
  ...EN,
  "common.language": "Taal",
  "common.noPhoto": "Geen foto",
  "common.loading": "Laden...",
  "common.datePending": "Datum volgt",
  "common.na": "n.v.t.",
  "common.tba": "N.t.b.",
  "common.profile": "Profiel",
  "common.copyJson": "Kopieer JSON",
  "common.copied": "Gekopieerd",
  "common.copyFailed": "Kopieren mislukt",

  "nav.skip": "Ga naar inhoud",
  "nav.menu": "Menu",
  "nav.mainAria": "Kwartier West navigatie",
  "nav.homeAria": "Kwartier West startpagina",
  "nav.sideSwitchAria": "Wissel tussen collectieven",
  "nav.events": "Evenementen",
  "nav.tekno": "Tekno",
  "nav.hiphop": "Hip hop",
  "nav.bookings": "Boekingen",
  "nav.shop": "Winkel",
  "nav.partners": "Partners",
  "nav.contact": "Contact",
  "nav.bookingDesk": "Boekingsdesk",
  "nav.manifest": "Manifest",
  "nav.teknoArtists": "Tekno artiesten",
  "nav.bookTekno": "Boek Tekno",
  "nav.hiphopArtists": "Hip hop artiesten",
  "nav.bookHiphop": "Boek Hip hop",
  "nav.compassAria": "Westkompas",
  "nav.compassWaiting": "Westkompas start automatisch op ondersteunde toestellen",
  "nav.compassReady": "Westkompas actief",
  "nav.compassDecorative": "Kompas staat in visuele modus op dit toestel",
  "nav.compassDenied": "Toestemming voor kompas geweigerd",
  "nav.compassUnavailable": "Kompas niet beschikbaar op dit toestel",
  "nav.compassError": "Kompasfout",
  "nav.compassDemo": "Kompas demo-modus",
  "nav.compassHeading": "West-richting {angle} graden",

  "rail.lane.aria": "Actieve kant",
  "rail.lane.title": "Actieve kant",
  "rail.lane.global": "Labelbreed",
  "rail.quick.aria": "Snelle routes",
  "rail.quick.title": "Snelle routes",
  "rail.toc.aria": "Paginastructuur",
  "rail.toc.title": "Op deze pagina",
  "rail.toc.empty": "Secties laden nog...",
  "rail.channels.aria": "Officiele kanalen",
  "rail.channels.title": "Officiele kanalen",
  "rail.channels.note": "Volg enkel de officiele kanalen.",

  "meta.home.title": "Kwartier West",
  "meta.home.description": "Kwartier West: Tekno- en Hip hop-collectieven, evenementen, boekingen en merch.",
  "meta.tekno.title": "Kwartier West - Tekno",
  "meta.tekno.description": "Tekno-collectief van Kwartier West met artiesten, evenementen en boekingen.",
  "meta.hiphop.title": "Kwartier West - Hip hop",
  "meta.hiphop.description": "Hip hop-collectief van Kwartier West met artiesten, evenementen en boekingen.",
  "meta.events.title": "Kwartier West - Evenementen",
  "meta.events.description": "Evenementenhub met Tekno- en Hip hop-line-ups, tickets en officiele bronkanalen.",
  "meta.shop.title": "Kwartier West - Winkel",
  "meta.shop.description": "Winkel voor Kwartier West-merch en artiestendrops.",
  "meta.booking.title": "Kwartier West - Boekingsdesk",
  "meta.booking.description": "Centrale boekingsdesk voor Tekno, Hip hop en volledige labelovernames.",
  "meta.teknoBooking.title": "Kwartier West - Tekno boeking",
  "meta.teknoBooking.description": "Boek Tekno-artiesten of het volledige Tekno-collectief.",
  "meta.hiphopBooking.title": "Kwartier West - Hip hop boeking",
  "meta.hiphopBooking.description": "Boek Hip hop-artiesten of het volledige Hip hop-collectief.",
  "meta.teknoArtist.title": "Kwartier West - Tekno artiest",
  "meta.teknoArtist.description": "Profielpagina van een Tekno-artiest binnen Kwartier West.",
  "meta.hiphopArtist.title": "Kwartier West - Hip hop artiest",
  "meta.hiphopArtist.description": "Profielpagina van een Hip hop-artiest binnen Kwartier West.",
  "meta.contact.title": "Kwartier West - Contact",
  "meta.contact.description": "Contacteer Kwartier West voor boekingen, samenwerkingen en productievragen.",
  "meta.manifest.title": "Kwartier West - Manifest",
  "meta.manifest.description": "Manifest van Kwartier West: visie, waarden en werking.",
  "meta.partners.title": "Kwartier West - Partners",
  "meta.partners.description": "Vertrouwde partners van Kwartier West voor productie, visuals, sound en organisatie.",
  "meta.tickets.title": "Kwartier West - Tickets",
  "meta.tickets.description": "Ticket- en toegangsinfo voor Kwartier West-evenementen.",

  "landing.quick.events": "Evenementen",
  "landing.quick.aria": "Snelle links",
  "landing.quick.booking": "Boekingsdesk",
  "landing.quick.shop": "Winkel",
  "landing.portal.aria": "Kwartier West portaal",
  "landing.portal.instruction": "Klik om binnen te gaan.",
  "landing.tekno.eyebrow": "Tekno collectief",
  "landing.tekno.title": "Tekno",
  "landing.tekno.desc": "Hardtek, aciddruk en soundsystemdiscipline.",
  "landing.tekno.open": "Ga naar Tekno",
  "landing.tekno.book": "Boek Tekno",
  "landing.tekno.aria": "Ga naar Tekno-portaal",
  "landing.hiphop.eyebrow": "Hip hop collectief",
  "landing.hiphop.title": "Hip hop",
  "landing.hiphop.desc": "Rappers, producers en live-energie met karakter.",
  "landing.hiphop.open": "Ga naar Hip hop",
  "landing.hiphop.book": "Boek Hip hop",
  "landing.hiphop.aria": "Ga naar Hip hop-portaal",
  "landing.rift.main.aria": "Ga naar de hoofdpagina van Kwartier West",
  "landing.rift.main.title": "Betreed het Westen",
  "landing.rift.tekno.aria": "Ga naar het Tekno-collectief",
  "landing.rift.tekno.title": "Betreed Tekno",
  "landing.rift.hiphop.aria": "Ga naar het Hip hop-collectief",
  "landing.rift.hiphop.title": "Betreed Hip hop",
  "landing.footer.events": "Live evenementenhub",
  "landing.footer.partners": "Partners",
  "landing.footer.contact": "Contact",
  "landing.footer.poweredPrefix": "Gemaakt door",
  "landing.footer.powered": "Gemaakt door deeqstudio",
  "footer.title.platform": "Platform",
  "footer.title.collectives": "Collectieven",
  "footer.title.label": "Label",
  "footer.title.info": "Info",
  "footer.note.appSoon": "App-integratie: volgt later",
  "footer.note.privacySoon": "Privacy: volgt later",
  "footer.note.termsSoon": "Voorwaarden: volgen later",

  "tekno.hero.eyebrow": "Kwartier West / Tekno",
  "tekno.hero.title": "Tekno collectief",
  "tekno.hero.lead": "Raves, rauwe energie en livesets gebouwd voor zware soundsystems.",
  "tekno.hero.collective": "Boek Tekno collectief",
  "tekno.hero.desk": "Ga naar de centrale boekingsdesk",
  "tekno.events.title": "Evenementen",
  "tekno.events.cta": "Ga naar de evenementenhub",
  "tekno.artists.title": "Artiesten",
  "tekno.artists.cta": "Boek meerdere artiesten",

  "hiphop.hero.eyebrow": "Kwartier West / Hip hop",
  "hiphop.hero.title": "Hip hop collectief",
  "hiphop.hero.lead": "Livebars, producers en performers klaar voor echte stages.",
  "hiphop.hero.collective": "Boek Hip hop collectief",
  "hiphop.hero.desk": "Ga naar de centrale boekingsdesk",
  "hiphop.events.title": "Evenementen",
  "hiphop.events.cta": "Ga naar de evenementenhub",
  "hiphop.artists.title": "Artiesten",
  "hiphop.artists.cta": "Boek meerdere artiesten",

  "events.hero.eyebrow": "Kwartier West / Eventhub",
  "events.hero.title": "Live evenementenfeed",
  "events.hero.lead": "Een feed. Twee werelden.",
  "events.filtersAria": "Evenementfilters",
  "events.filter.all": "Alles",
  "events.filter.groupSide": "Filter op collectief",
  "events.filter.groupScope": "Filter op periode",
  "events.filter.tekno": "Tekno",
  "events.filter.hiphop": "Hip hop",
  "events.filter.upcoming": "Komend",
  "events.filter.allEvents": "Alle evenementen",
  "events.filter.past": "Voorbij",
  "events.ticketRequest": "Vraag toegang",
  "events.section.featured": "Uitgelicht",
  "events.section.sources": "Officiele bronfeed",
  "events.cta.takeover": "Boek volledige overname",
  "events.section.overview": "Evenementoverzicht",
  "events.cta.production": "Contacteer productie",
  "events.loading": "Evenementen laden...",
  "events.error": "Evenementen konden niet geladen worden.",
  "events.none": "Nog geen evenementen gepubliceerd.",
  "events.lineup": "Line-up",
  "events.lineupPending": "Line-up volgt.",
  "events.ticketsTba": "Tickets: volgt",
  "events.bookSide": "Boek {side}",
  "events.source": "Bron",
  "events.sourceDefault": "Sociaal",
  "events.source.live": "Bronkoppeling actief.",
  "events.source.ready": "Bronkoppeling klaar.",
  "events.source.noSource": "Nog geen bron gekoppeld.",
  "events.visible": "{count} zichtbaar",
  "events.total": "{count} evenementen",
  "events.ticketsLabel": "Tickets",
  "events.untitled": "Naamloos evenement",

  "artists.loading": "Artiesten laden...",
  "artists.empty": "Nog geen artiesten beschikbaar.",
  "artists.error": "Artiesten konden niet geladen worden.",
  "artists.profile": "Profiel",
  "artists.bookSolo": "Boek solo",
  "artists.defaultName": "Onbekende artiest",
  "artists.defaultRole": "Artiest",

  "artist.loading": "Artiest laden...",
  "artist.notSelected": "Geen artiest geselecteerd.",
  "artist.notFound": "Artiest niet gevonden.",
  "artist.wrongSideTitle": "Deze artiest zit op de andere kant",
  "artist.wrongSideBody": "{name} hoort bij {side}.",
  "artist.openCorrect": "Ga naar het juiste profiel",
  "artist.bookSolo": "Boek solo",
  "artist.bookMultiple": "Boek met meerdere artiesten",
  "artist.hero.eyebrowTekno": "Tekno / Artiestprofiel",
  "artist.hero.eyebrowHiphop": "Hip hop / Artiestprofiel",
  "artist.section.signature": "Signatuur",
  "artist.section.live": "Podiumaanpak",
  "artist.section.focus": "Focus",
  "artist.section.channels": "Kanalen",
  "artist.collectiveSuffix": "collectief",
  "artist.focusEmpty": "Nog geen focuspunten gepubliceerd.",
  "artist.linksEmpty": "Nog geen kanalen gepubliceerd.",

  "booking.hero.eyebrow": "Boeking / Centrale boekingsdesk",
  "booking.hero.eyebrowTekno": "Boeking / Tekno",
  "booking.hero.eyebrowHiphop": "Boeking / Hip hop",
  "booking.hero.title": "Boek Kwartier West",
  "booking.hero.lead": "Kies je type aanvraag en verstuur je intake.",
  "booking.link.tekno": "Tekno artiesten",
  "booking.link.hiphop": "Hip hop artiesten",
  "booking.link.events": "Evenementenhub",
  "booking.initial": "Vul je aanvraag in. We tonen meteen een duidelijke samenvatting.",
  "booking.type.single.label": "Enkele artiest",
  "booking.type.single.hint": "Boek exact een artiest.",
  "booking.type.multiple.label": "Meerdere artiesten",
  "booking.type.multiple.hint": "Boek een selectie van meerdere artiesten.",
  "booking.type.side.label": "Collectief (per kant)",
  "booking.type.side.hint": "Boek het volledige Tekno- of Hip hop-collectief.",
  "booking.type.full.label": "Volledige labelovername",
  "booking.type.full.hint": "Boek Tekno en Hip hop samen.",
  "booking.form.type": "Boekingstype",
  "booking.form.collective": "Collectief",
  "booking.form.artistSelection": "Artiestselectie",
  "booking.form.artistNotNeeded": "Voor dit boekingstype hoef je geen artiest te kiezen.",
  "booking.form.chooseSide": "Kies eerst Tekno of Hip hop voor een collectiefboeking per kant.",
  "booking.form.eventName": "Evenementnaam",
  "booking.form.eventDate": "Evenementdatum",
  "booking.form.startTime": "Startuur",
  "booking.form.city": "Stad / regio",
  "booking.form.venue": "Locatie",
  "booking.form.attendance": "Verwachte opkomst",
  "booking.form.budget": "Budget (EUR)",
  "booking.form.setLength": "Setduur (min)",
  "booking.form.contactName": "Contactnaam",
  "booking.form.contactEmail": "E-mailadres",
  "booking.form.phone": "Telefoon",
  "booking.form.org": "Organisatie",
  "booking.form.notes": "Technische en productie-notities",
  "booking.form.submit": "Verstuur aanvraag",
  "booking.form.helper": "Na versturen verzendt de website je aanvraag automatisch.",
  "booking.form.placeholder.eventName": "Warehouse Pressure Night",
  "booking.form.placeholder.city": "Roeselare",
  "booking.form.placeholder.venue": "Locatie",
  "booking.form.placeholder.attendance": "350",
  "booking.form.placeholder.budget": "2500",
  "booking.form.placeholder.setLength": "60",
  "booking.form.placeholder.contactName": "Naam contactpersoon",
  "booking.form.placeholder.contactEmail": "naam@domein.com",
  "booking.form.placeholder.phone": "+32 ...",
  "booking.form.placeholder.organisation": "Crew / locatie / agency",
  "booking.form.placeholder.notes": "PA, monitors, podiumopstelling, curfew...",
  "booking.validate.name": "Contactnaam is verplicht.",
  "booking.validate.email": "Vul een geldig e-mailadres in.",
  "booking.validate.event": "Evenementdatum en stad zijn verplicht.",
  "booking.validate.single": "Selecteer exact een artiest voor een solo boeking.",
  "booking.validate.multiple": "Selecteer minstens twee artiesten voor een groepsboeking.",
  "booking.validate.side": "Kies Tekno of Hip hop voor een collectiefboeking per kant.",
  "booking.result.title": "Boekingsaanvraag klaar",
  "booking.result.reference": "Referentie",
  "booking.result.mail": "E-mailsjabloon",
  "booking.result.webhookDisabled": "Automatische verzending is nog niet geconfigureerd.",
  "booking.result.webhookOk": "Aanvraag succesvol verzonden via de website.",
  "booking.result.webhookFail": "Verzendfout",
  "booking.result.webhookHttp": "Serverstatus {status}",
  "booking.result.webhookNetwork": "Netwerk- of timeoutfout",
  "booking.loadArtistsError": "Artiesten konden niet geladen worden. Probeer later opnieuw.",
  "booking.summary.artists": "Artiesten",
  "booking.summary.event": "Evenement",
  "booking.summary.venue": "Locatie",
  "booking.summary.budget": "Budget",
  "booking.summary.contact": "Contact",
  "booking.summary.json": "Aanvraagdetails",

  "shop.hero.eyebrow": "Merch / Winkel",
  "shop.hero.title": "Kwartier West winkel",
  "shop.hero.lead": "Labelmerch en artiestendrops.",
  "shop.search.label": "Zoek in merch",
  "shop.search.placeholder": "Zoek item of artiest",
  "shop.filter.all": "Alles",
  "shop.filter.label": "Kwartier West",
  "shop.filter.artists": "Artiestmerch",
  "shop.filter.tekno": "Tekno",
  "shop.filter.hiphop": "Hip hop",
  "shop.filter.available": "Beschikbaar",
  "shop.filter.comingSoon": "Binnenkort",
  "shop.status.inStock": "Op voorraad",
  "shop.status.preorder": "Voorbestelling",
  "shop.status.soldOut": "Uitverkocht",
  "shop.status.comingSoon": "Binnenkort",
  "shop.status.tba": "Status n.t.b.",
  "shop.price.tba": "Prijs n.t.b.",
  "shop.product.open": "Ga naar productpagina",
  "shop.product.pending": "Productlink volgt",
  "shop.sizes": "Maten",
  "shop.loading": "Winkel laden...",
  "shop.empty": "Geen artikels gevonden voor deze filter.",
  "shop.error": "Winkel kon niet geladen worden.",
  "shop.count": "{count} artikels",

  "partners.loading": "Partners laden...",
  "partners.empty": "Nog geen partners gepubliceerd.",
  "partners.error": "Partners konden niet geladen worden.",
  "partners.linksPending": "Links volgen.",
  "partners.hero.eyebrow": "Netwerk / Vertrouwde partners",
  "partners.hero.title": "Partners",
  "partners.hero.lead": "Studio's, crews en operators die mee het Westen bouwen.",
  "partners.hero.events": "Evenementenhub",
  "partners.hero.become": "Word partner",
  "partners.protocol.title": "Hoe we samenwerken",
  "partners.protocol.one": "Eerst duidelijke afspraken over productie, timing en rollen.",
  "partners.protocol.two": "Heldere communicatiekanalen en snelle opvolging.",
  "partners.protocol.three": "Samenwerkingen die inhoudelijk kloppen en lang meegaan.",
  "partners.protocol.cta": "Ga naar contactdesk",

  "contact.hero.eyebrow": "Contact / Productie",
  "contact.hero.title": "Contact Kwartier West",
  "contact.hero.lead": "Voor boekingen, productievragen en samenwerkingen.",
  "contact.hero.booking": "Ga naar boekingsdesk",
  "contact.hero.events": "Ga naar evenementenhub",
  "contact.tile.bookings.title": "Boekingen",
  "contact.tile.bookings.meta": "Artiesten en collectieven",
  "contact.tile.bookings.body": "Verstuur solo-, meerdere- of collectiefaanvragen via een intake.",
  "contact.tile.bookings.main": "Centrale boekingsdesk",
  "contact.tile.bookings.tekno": "Tekno boeking",
  "contact.tile.bookings.hiphop": "Hip hop boeking",
  "contact.tile.channels.title": "Algemene kanalen",
  "contact.tile.channels.meta": "Teamcontact",
  "contact.tile.channels.body": "Algemene vragen, samenwerkingen en partnercontact.",
  "contact.tile.integration.title": "App-integratie",
  "contact.tile.integration.meta": "Planning",
  "contact.tile.integration.body": "De app volgt later. Boekingen, evenementen en winkel lopen nu via deze site.",
  "contact.tile.integration.cta": "Bekijk planning",

  "manifest.hero.eyebrow": "Dit is het Westen",
  "manifest.hero.title": "Manifest",
  "manifest.hero.lead": "Twee kanten. Een standaard.",
  "manifest.why.title": "Waarom twee kanten",
  "manifest.why.body": "Tekno en Hip hop hebben elk hun eigen podiumtaal, maar delen dezelfde ruggengraat in planning, productie en opvolging.",
  "manifest.rules.title": "Onze regels",
  "manifest.rules.one": "Artiesten blijven eigenaar van hun eigen identiteit en verhaal.",
  "manifest.rules.two": "Evenementen worden geprogrammeerd op kwaliteit en veiligheid, niet op hype.",
  "manifest.rules.three": "Communicatie met organisatoren en venues is helder, snel en correct.",
  "manifest.rules.four": "We bouwen vandaag al met de basis voor de app van morgen.",
  "manifest.platform.title": "Wat dit platform doet",
  "manifest.platform.one": "Verwerkt boekingen per artiest, meerdere artiesten of volledig collectief.",
  "manifest.platform.two": "Toont evenementen met officiele bronlinks.",
  "manifest.platform.three": "Combineert labelmerch en artiestendrops in een winkel.",
  "manifest.cta.booking": "Start boeking",
  "manifest.cta.events": "Bekijk evenementen",

  "tickets.hero.eyebrow": "Tickets / Toegang",
  "tickets.hero.title": "Tickets",
  "tickets.hero.lead": "Ticketstatus wordt per evenement beheerd vanuit de evenementenhub.",
  "tickets.hero.events": "Ga naar evenementenhub",
  "tickets.hero.support": "Ticketondersteuning",
  "tickets.status.title": "Ticketstatus",
  "tickets.status.external.label": "Extern:",
  "tickets.status.external.body": "Koop op het platform van de organisator.",
  "tickets.status.internal.label": "Intern:",
  "tickets.status.internal.body": "Toegang via de Kwartier West-flow.",
  "tickets.status.tba.label": "N.t.b.:",
  "tickets.status.tba.body": "Details volgen zodra locatie, capaciteit en productie vastliggen.",
  "tickets.policy.title": "Toegangsbeleid",
  "tickets.policy.one": "Breng je bevestiging of ticket mee.",
  "tickets.policy.two": "Respecteer de regels van de locatie en de briefing van de crew.",
  "tickets.policy.three": "Deurbeleid blijft altijd een organisatorische beslissing."
};
const MESSAGES = {
  en: EN,
  nl: NL
};

let activeLanguage = DEFAULT_LANGUAGE;

function languageCodes() {
  return new Set(LANGUAGES.map((item) => item.code));
}

function normalizeLanguage(input) {
  const value = String(input || "").trim().toLowerCase();
  if (!value) return UNKNOWN_LANGUAGE_FALLBACK;

  const codes = languageCodes();
  if (codes.has(value)) return value;

  const base = value.split("-")[0];
  if (codes.has(base)) return base;

  if (base === "en") return "en";
  return UNKNOWN_LANGUAGE_FALLBACK;
}

function detectLanguage() {
  const browserLanguages =
    Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages
      : [navigator.language || ""];

  const primary = browserLanguages.find(Boolean) || "";
  return normalizeLanguage(primary);
}

function interpolate(template, params = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_, token) => String(params[token] ?? ""));
}

function hasMessage(lang, key) {
  return Object.prototype.hasOwnProperty.call(MESSAGES?.[lang] || {}, key);
}

function messageFor(lang, key) {
  if (hasMessage(lang, key)) return MESSAGES[lang][key];
  if (hasMessage(DEFAULT_LANGUAGE, key)) return MESSAGES[DEFAULT_LANGUAGE][key];
  return null;
}

export function t(key, params = {}) {
  const value = messageFor(activeLanguage, key);
  if (value === null) return key;
  return interpolate(value, params);
}

export function getCurrentLanguage() {
  return activeLanguage;
}

export function getCurrentLocale() {
  const lang = getCurrentLanguage();
  if (lang === "en") return "en-US";
  return "nl-BE";
}

export function isRTL() {
  return RTL_LANGUAGES.has(activeLanguage);
}

export function setLanguage(language) {
  activeLanguage = normalizeLanguage(language);

  document.documentElement.setAttribute("lang", activeLanguage);
  document.documentElement.setAttribute("dir", isRTL() ? "rtl" : "ltr");
}

function applyTextTranslations(root) {
  root.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n") || "";
    const value = messageFor(activeLanguage, key);
    if (value !== null) element.textContent = interpolate(value);
  });

  root.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.getAttribute("data-i18n-placeholder") || "";
    const value = messageFor(activeLanguage, key);
    if (value !== null) element.setAttribute("placeholder", value);
  });

  root.querySelectorAll("[data-i18n-content]").forEach((element) => {
    const key = element.getAttribute("data-i18n-content") || "";
    const value = messageFor(activeLanguage, key);
    if (value !== null) element.setAttribute("content", value);
  });

  root.querySelectorAll("[data-i18n-title]").forEach((element) => {
    const key = element.getAttribute("data-i18n-title") || "";
    const value = messageFor(activeLanguage, key);
    if (value === null) return;
    if (element.tagName.toLowerCase() === "title") {
      element.textContent = value;
      return;
    }
    element.setAttribute("title", value);
  });

  root.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    const key = element.getAttribute("data-i18n-aria-label") || "";
    const value = messageFor(activeLanguage, key);
    if (value !== null) element.setAttribute("aria-label", value);
  });

  root.querySelectorAll("[data-i18n-value]").forEach((element) => {
    const key = element.getAttribute("data-i18n-value") || "";
    const value = messageFor(activeLanguage, key);
    if (value !== null) element.setAttribute("value", value);
  });
}

function buildLanguageOptions(select) {
  select.innerHTML = LANGUAGES.map((language) => `<option value="${language.code}">${language.label}</option>`).join("");
  select.value = activeLanguage;
}

export function attachLanguageSwitchers(root = document) {
  const switches = root.querySelectorAll("[data-lang-switch]");
  switches.forEach((select) => {
    buildLanguageOptions(select);
    select.setAttribute("aria-label", t("common.language"));

    select.addEventListener("change", () => {
      const next = normalizeLanguage(select.value);
      setLanguage(next);
      applyI18n(document);
    });
  });
}

export function applyI18n(root = document) {
  applyTextTranslations(root);
}

export function initI18nPage() {
  setLanguage(detectLanguage());
  applyI18n(document);
  attachLanguageSwitchers(document);
}

