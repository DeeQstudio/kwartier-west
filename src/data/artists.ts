import type { Artist, ArtistSource, Scene } from "./types";

const siteUrl = "https://kwartierwest.be";

const artistSources = [
  {
    "slug": "onschuldig",
    "name": "Onschuldig",
    "role": "Head Master of the Collective / Producer",
    "scene": "tekno",
    "image": "/assets/media/artists/onschuldig.webp",
    "quote": "Provides unique Tekno & Acid sound.",
    "paragraphs": [
      "Owner of the collective Kwartier West, onbegrensd soundsystem resident en WTK soundsystem resident. Digital & analog producer, making pure Acid, Tekno & Tribe.",
      "Onschuldig bouwt de ruggengraat van de collectieve sound: rauw, puur en zonder grenzen. Vanuit resident posities in onbegrensd soundsystem en WTK soundsystem blijft de focus op druk, groove en authenticiteit.",
      "Discography: CD 303Day 2024 (303 Breakstreet). Livesets bewegen tussen pure acidlijnen, tekno-energie en tribe-momentum."
    ],
    "bullets": [
      "Hardtekk-structuur",
      "Acid-opbouw",
      "Langdurige rave-opbouw"
    ],
    "links": [
      {
        "label": "soundcloud",
        "value": "Onschuldig",
        "href": "https://soundcloud.com/onschuldig"
      },
      {
        "label": "instagram",
        "value": "@0nschuldig",
        "href": "https://www.instagram.com/0nschuldig/"
      }
    ],
    "description": "Owner of the collective Kwartier West, onbegrensd soundsystem resident en WTK soundsystem resident. Digital & analog producer, making pure Acid, Tekno & Tribe",
    "mediaKind": "artwork"
  },
  {
    "slug": "hyperion",
    "name": "Hyperion",
    "role": "DJ / Live-set",
    "scene": "tekno",
    "image": "/assets/media/artists/hyperion.webp",
    "quote": "Directe hardtekk-snelheid zonder dode lucht.",
    "paragraphs": [
      "Snelle, rauwe druksets met strakke dynamiek en ravegerichte slagkracht.",
      "Hyperion is afgestemd op nachtdruk: snelle keuzes, dichte kickpatronen en een no-frills sequencingstijl.",
      "De setarchitectuur kiest voor intensiteit boven ornament. BPM klimt snel en blijft vergrendeld in het kernvenster."
    ],
    "bullets": [
      "Piektijdcontrole",
      "Snelle transities",
      "Hoge-druk zalen"
    ],
    "links": [
      {
        "label": "soundcloud",
        "value": "Hyperion",
        "href": "https://soundcloud.com/user-347588809"
      }
    ],
    "description": "Snelle, rauwe druksets met strakke dynamiek en ravegerichte slagkracht.",
    "mediaKind": "artwork"
  },
  {
    "slug": "woebn",
    "name": "Woebn",
    "role": "DJ / Live-set",
    "scene": "tekno",
    "image": "/assets/media/artists/woebn.webp",
    "quote": "Een herkenbare multi-genre sound met constante energie en drive.",
    "paragraphs": [
      "Deze underground krachtpatser uit België staat bekend om zijn unieke sound, waarin meerdere genres naadloos samenvloeien tot één sterke muzikale trip.",
      "Met invloeden uit Hardtekk, Acidcore, Hardcore en Rap brengt Woebn een direct herkenbare stijl in zijn eigen producties en remixes. Hij groeit stevig door, bouwde al een sterke fanbase op en dropte zijn album \"Arte Pattatn\" als visitekaartje van zijn sound.",
      "Sinds zijn signing bij het Duitse label \"Best Of Hardtekk\" trekt hij die lijn nog harder door: meer druk, meer kracht en sets die de dansvloer losmaken en meteen die bass face bovenhalen."
    ],
    "bullets": [
      "Piektijd-sequencing",
      "High-BPM beweging",
      "Warehouse publiekscontrole"
    ],
    "links": [
      {
        "label": "soundcloud",
        "value": "Woebn",
        "href": "https://soundcloud.com/woebn"
      },
      {
        "label": "instagram",
        "value": "@_woebn_",
        "href": "https://www.instagram.com/_woebn_/"
      }
    ],
    "description": "Deze underground krachtpatser uit België staat bekend om zijn unieke sound, waarin meerdere genres naadloos samenvloeien tot één sterke muzikale trip.",
    "mediaKind": "photo",
    "focus": {
      "desktop": "43% 27%",
      "mobile": "43% 20%"
    }
  },
  {
    "slug": "noratn",
    "name": "NORATN",
    "role": "DJ / Producent",
    "scene": "tekno",
    "image": "/assets/media/artists/noratn.webp",
    "quote": "Energieke tek- en aciddruk met een diepe, hypnotische onderstroom.",
    "paragraphs": [
      "NORATN is een opkomende DJ en producer die zich beweegt tussen tek, acid en mental. Haar sound is energiek, diep en hypnotisch, met beats die blijven doorduwen.",
      "Ze staat bekend om krachtige sets en een eigen sound binnen de underground. Waar ze ook speelt, houdt ze de groove strak en de crowd mee van begin tot einde.",
      "Als nieuwe naam in de scene bouwt NORATN verder aan haar stijl, met een duidelijke drive om grenzen te verleggen in haar muziek."
    ],
    "bullets": [
      "Tek- en aciddruk",
      "Mentale groove-sequencing",
      "Hoog-energetische undergroundsets"
    ],
    "links": [
      {
        "label": "linktree",
        "value": "noratn__",
        "href": "https://linktr.ee/noratn__"
      }
    ],
    "description": "NORATN is een opkomende DJ en producer die zich beweegt tussen tek, acid en mental. Haar sound is energiek, diep en hypnotisch, met beats die blijven doorduwe",
    "mediaKind": "photo",
    "focus": {
      "desktop": "57% 31%",
      "mobile": "57% 23%"
    }
  },
  {
    "slug": "alexer",
    "name": "Alexer",
    "role": "DJ / Producer",
    "scene": "tekno",
    "image": "/assets/media/artists/alexer.webp",
    "quote": "Hypnotische grooves, warme melodieen en rauwe ritmes voor open airs en free parties.",
    "paragraphs": [
      "Alexer bouwt melancholische tekno- en tribe-sets die tussen gevoel en beweging hangen.",
      "Geen overproductie en geen franjes: gewoon sound die blijft rollen. Met releases zoals Galleon Groove, Tribal Motion en Rodeo Rubel ontwikkelde Alexer een eigen stijl waarin dromerige lijnen samenvallen met stevige kicks en organische percussie.",
      "Muziek die persoonlijk aanvoelt, maar tegelijk gemaakt is om uren op te blijven dansen."
    ],
    "bullets": [
      "Melancholische tekno",
      "Tribe-driven grooves",
      "Open-air en free-party flow"
    ],
    "links": [
      {
        "label": "soundcloud",
        "value": "alexer_23",
        "href": "https://soundcloud.com/alexer_23"
      },
      {
        "label": "instagram",
        "value": "@alexer__23",
        "href": "https://www.instagram.com/alexer__23/"
      },
      {
        "label": "website",
        "value": "Bandcamp",
        "href": "https://alexer23.bandcamp.com"
      },
      {
        "label": "facebook",
        "value": "Alexer",
        "href": "https://www.facebook.com/profile.php?id=61559690368958"
      }
    ],
    "description": "Alexer bouwt melancholische tekno- en tribe-sets die tussen gevoel en beweging hangen.",
    "mediaKind": "artwork"
  },
  {
    "slug": "spoorloos",
    "name": "Spoorloos",
    "role": "Tekno-producer / Live-artiest",
    "scene": "tekno",
    "image": "/assets/media/artists/spoorloos.webp",
    "quote": "Hybride livesets met zware kicks, tribale ritmes en pure tekno-energie.",
    "paragraphs": [
      "Spoorloos is een tekno-producer en live-artiest uit West-Vlaanderen (Brugge). Zijn energie is geinspireerd door de free party scene. Zijn sound beweegt zich tussen tekno, tribecore en harde underground techno, met duidelijke invloeden uit tribe, acid en industriele noise.",
      "In zijn livesets bouwt hij zijn muziek live op met een hybride setup van hardware en software. Machines zoals de Elektron Analog Rytm vormen het hart van zijn sound: zware kicks, tribale ritmes en vervormde texturen die gemaakt zijn voor donkere warehouses, soundsystems en lange nachten op de dansvloer.\n\nZijn muziek draait rond ritme, groove en rauwe energie. Distorted kicks, hypnotische percussie en atmosfeer vloeien samen tot een intense stroom van geluid die het publiek meeneemt in een hypnotische trip.",
      "Spoorloos blijft trouw aan de DIY-mentaliteit van de underground. Geen compromissen, geen flauwe filters. Alleen machines, ritme en pure tekno-energie."
    ],
    "bullets": [
      "Hybride hardware/software livesets",
      "Zware kicks en tribale ritmes",
      "DIY-underground aanpak"
    ],
    "links": [
      {
        "label": "instagram",
        "value": "@spoorloos23",
        "href": "https://instagram.com/spoorloos23"
      },
      {
        "label": "soundcloud",
        "value": "spoorloostekno",
        "href": "https://soundcloud.com/spoorloostekno"
      },
      {
        "label": "linktree",
        "value": "@spoorloos23",
        "href": "https://linktr.ee/spoorloos23"
      },
      {
        "label": "facebook",
        "value": "Brecht Timmerman",
        "href": "https://www.facebook.com/brecht.timmerman/"
      }
    ],
    "description": "Spoorloos is een tekno-producer en live-artiest uit West-Vlaanderen (Brugge). Zijn energie is geinspireerd door de free party scene. Zijn sound beweegt zich t",
    "mediaKind": "artwork"
  },
  {
    "slug": "wildcrd",
    "name": "W!LD.CRD",
    "role": "DJ",
    "scene": "tekno",
    "image": "/assets/media/artists/wildcrd.webp",
    "quote": "Hardgroove Techno, Acidcore en Tekno met pure energie en compromisloze drive.",
    "paragraphs": [
      "W!LD.CRD staat voor pure energie, opbouwende spanning en een compromisloze drive achter de decks.",
      "W!LD.CRD staat voor pure energie, opbouwende spanning en een compromisloze drive achter de decks. Met een sound die varieert van Hardgroove Techno en Acidcore tot Tekno, weet hij elke dansvloer mee te sleuren in een intense muzikale ervaring.\n\nAl meer dan vijftien jaar actief als DJ en de laatste drie jaar steeds zichtbaarder binnen de scene, combineert W!LD.CRD technische ervaring met een scherp gevoel voor publieksdynamiek. Zijn sets bouwen op vanuit groove en ritme, om uiteindelijk te ontploffen in een storm van harde kicks en opzwepende tracks.",
      "Naast zijn passie voor de underground scene is W!LD.CRD ook een veelzijdige all-round DJ. Die brede muzikale achtergrond geeft hem de flexibiliteit om elk publiek aan te voelen en zijn sets naar een onvergetelijk hoogtepunt te sturen."
    ],
    "bullets": [
      "Opbouwende spanning",
      "Hardgroove- en acidcore-druk",
      "Publieksdynamiek en piekmomenten"
    ],
    "links": [
      {
        "label": "soundcloud",
        "value": "W!LD.CRD",
        "href": "https://soundcloud.com/karimdevlaeminck"
      },
      {
        "label": "instagram",
        "value": "@wild.crd_kdv",
        "href": "https://www.instagram.com/wild.crd_kdv/"
      }
    ],
    "description": "W!LD.CRD staat voor pure energie, opbouwende spanning en een compromisloze drive achter de decks.",
    "mediaKind": "artwork"
  },
  {
    "slug": "jenesaispas",
    "name": "Jenesaispas",
    "role": "DJ / Live-set",
    "scene": "tekno",
    "image": "/assets/media/artists/jenesaispas.webp",
    "quote": "Gecontroleerde chaos met rauwe loodsenergie.",
    "paragraphs": [
      "Chaotische overgangen, onstabiele texturen en harde overgangscuts.",
      "Jenesaispas werkt met contrast: gefragmenteerde lagen, abrupte beweging en druk-eerst arrangementkeuzes.",
      "Korte transitievensters en doelbewuste schokken houden de vloer actief tijdens intense late segmenten."
    ],
    "bullets": [
      "Rauwe textuur",
      "Gebroken-ritme transities",
      "Snelle impactrouting"
    ],
    "links": [],
    "description": "Chaotische overgangen, onstabiele texturen en harde overgangscuts.",
    "mediaKind": "photo",
    "focus": {
      "desktop": "78% 24%",
      "mobile": "78% 18%"
    }
  },
  {
    "slug": "kulture",
    "name": "Kulture",
    "role": "DJ / Live-set",
    "scene": "tekno",
    "image": "/assets/media/artists/kulture.webp",
    "quote": "Percussieve druk en snelle floorfeedback.",
    "paragraphs": [
      "Percussief momentum met compacte harde sets en dansvloergerichte timing.",
      "Kulture leunt op ritme-eerst arrangement. Het profiel is direct, fysiek en afgestemd op hoog-energetische dansvloeren.",
      "Setdesign blijft strak: percussieve hooks, kick-forward loops en efficiente transities om publiekssnelheid te houden."
    ],
    "bullets": [
      "Percussieve structuur",
      "Rave-momentum",
      "Compacte sets met hoge impact"
    ],
    "links": [
      {
        "label": "soundcloud",
        "value": "Kulture",
        "href": "https://soundcloud.com/kulture23"
      },
      {
        "label": "instagram",
        "value": "@kulture_stn",
        "href": "https://www.instagram.com/kulture_stn/"
      }
    ],
    "description": "Percussief momentum met compacte harde sets en dansvloergerichte timing.",
    "mediaKind": "artwork"
  },
  {
    "slug": "kumatekz",
    "name": "Kumatekz",
    "role": "DJ / Live-set",
    "scene": "tekno",
    "image": "/assets/media/artists/kumatekz.webp",
    "quote": "Industrieel gewicht en laagfrequente autoriteit.",
    "paragraphs": [
      "Industriele accenten met zware laagfrequente balans en strakke setarchitectuur.",
      "Kumatekz brengt een metaalachtig palet en mechanische beweging in het collectief, gecentreerd op spanning en ontlading via bascontrole.",
      "Werkt het best in donkere zaalvensters waar laagfrequente impact en lange drukcurves volledig kunnen groeien."
    ],
    "bullets": [
      "Industrieel klankdesign",
      "Subbasbeheer",
      "Donkere-room opbouw"
    ],
    "links": [
      {
        "label": "soundcloud",
        "value": "KumaTEKZ",
        "href": "https://soundcloud.com/kumatekz23"
      }
    ],
    "description": "Industriele accenten met zware laagfrequente balans en strakke setarchitectuur.",
    "mediaKind": "artwork"
  },
  {
    "slug": "masschie",
    "name": "Masschie",
    "role": "DJ / Live-set",
    "scene": "tekno",
    "image": "/assets/media/artists/masschie.webp",
    "quote": "Acidlijnen, snelle beweging, geen verloren bars.",
    "paragraphs": [
      "Acidgedreven patronen met meedogenloze groovesecties voor indoor- en open-air momenten.",
      "Masschie combineert zure melodische druk met groovecontinuiteit en houdt de dansvloer vast zonder de dynamiek plat te slaan.",
      "Livevensters draaien rond stuwkracht en consistentie: snelle start, brede middendruk, harde afsluiting."
    ],
    "bullets": [
      "Acidfrasecontrole",
      "Open-air paraatheid",
      "Groovecontinuiteit"
    ],
    "links": [
      {
        "label": "soundcloud",
        "value": "Masschie",
        "href": "https://soundcloud.com/masschie_sc"
      }
    ],
    "description": "Acidgedreven patronen met meedogenloze groovesecties voor indoor- en open-air momenten.",
    "mediaKind": "photo",
    "focus": {
      "desktop": "64% 26%",
      "mobile": "64% 20%"
    }
  },
  {
    "slug": "mombietekk",
    "name": "Mombietekk",
    "role": "DJ / Live-set",
    "scene": "tekno",
    "image": "/assets/media/artists/mombietekk.webp",
    "quote": "Meedogenloze BPM-push met rave-eerst keuzes.",
    "paragraphs": [
      "Pittige high-BPM sets met focus op directe ravesequencing.",
      "Mombietekk zit in de snelle hoek van de kant en kiest voor beweging en impact boven decoratieve opbouw.",
      "Best geplaatst in late-night segmenten waar tempo agressief kan blijven en transities snel kunnen vuren."
    ],
    "bullets": [
      "High-BPM stuwkracht",
      "Rave-eerst sequencing",
      "Laatnachtelijke impact"
    ],
    "links": [
      {
        "label": "soundcloud",
        "value": "Mombietekk",
        "href": "https://soundcloud.com/gillian-mombert"
      }
    ],
    "description": "Pittige high-BPM sets met focus op directe ravesequencing.",
    "mediaKind": "photo",
    "focus": {
      "desktop": "48% 30%",
      "mobile": "48% 24%"
    }
  },
  {
    "slug": "psamtek",
    "name": "Psamtek",
    "role": "DJ / Live-set",
    "scene": "tekno",
    "image": "/assets/media/artists/psamtek.webp",
    "quote": "Closingdruk met gedisciplineerde sequentiecontrole.",
    "paragraphs": [
      "Specialist in closingsets met harde sequenties en meedogenloze eindsprintdruk.",
      "Psamtek is gebouwd voor eind-van-de-nacht momenten waar momentum scherp en fysiek moet blijven tot de laatste minuut.",
      "Deze kant legt nadruk op afsluitingsdesign: finale-opbouw, dichte ritmestapeling en hoog-energetische afsluiters."
    ],
    "bullets": [
      "Closing-set architectuur",
      "Harde sequentierouting",
      "Finale-energie"
    ],
    "links": [],
    "description": "Specialist in closingsets met harde sequenties en meedogenloze eindsprintdruk.",
    "mediaKind": "artwork"
  },
  {
    "slug": "de-kweker",
    "name": "De Kweker",
    "role": "Rapper",
    "scene": "hiphop",
    "image": "/assets/media/artists/de-kweker-feature.webp",
    "quote": "Geen rol, geen show. Gewoon eerlijke bars uit z'n hoofd.",
    "paragraphs": [
      "De Kweker is een rapper uit Brugge (8000). Hij maakt muziek vanuit wat hij zelf meemaakt en ziet.",
      "Brugge zit in alles wat hij doet. Niet als toeristische postkaart, maar als plek waar hij rondloopt, nadenkt en schrijft. Hij brengt verhalen over twijfel, trots, frustratie, vriendschap en alles daartussen, in z'n eigen taal.",
      "Als onderdeel van Rugged & Raw en Kwartier West bouwt hij aan z'n eigen lijn: sterke hooks, eerlijke bars en geen overbodige zever. De Kweker rapt niet om interessant te klinken, maar omdat hij anders te veel in z'n hoofd blijft zitten."
    ],
    "bullets": [
      "Verhalen uit Brugge in eigen taal",
      "Sterke hooks en eerlijke bars",
      "Maatschappelijke spiegel met scherpe knipoog"
    ],
    "links": [
      {
        "label": "website",
        "value": "kwkr.be",
        "href": "https://kwkr.be"
      },
      {
        "label": "instagram",
        "value": "@dekweker_",
        "href": "https://www.instagram.com/dekweker_/"
      },
      {
        "label": "facebook",
        "value": "De Kweker",
        "href": "https://www.facebook.com/p/De-Kweker-61570442235326/"
      },
      {
        "label": "tiktok",
        "value": "@de.kweker",
        "href": "https://www.tiktok.com/@de.kweker"
      },
      {
        "label": "youtube",
        "value": "@De.kweker",
        "href": "https://www.youtube.com/@De.kweker"
      },
      {
        "label": "spotify",
        "value": "De Kweker",
        "href": "https://open.spotify.com/artist/2v5Tuugqs8s4vaONc286EG"
      },
      {
        "label": "soundcloud",
        "value": "De Kweker",
        "href": "https://soundcloud.com/dekweker"
      }
    ],
    "description": "De Kweker is een rapper uit Brugge (8000), actief bij Kwartier West en Rugged & Raw. Muziek, video en officiële artiesteninfo via kwkr.be.",
    "mediaKind": "photo",
    "focus": {
      "desktop": "50% 24%",
      "mobile": "50% 18%"
    }
  },
  {
    "slug": "thorre",
    "name": "Thorre",
    "role": "Rapper",
    "scene": "hiphop",
    "image": "/assets/media/artists/thorre.webp",
    "quote": "Maatschappijkritische bars met relativering en humor, van euforie tot diepbedroefdheid.",
    "paragraphs": [
      "Sinds zijn zestiende schrijft Thorre teksten. Wat ooit simpele en vluchtige teksten waren, groeide na meer dan vijftien jaar uit tot diepzinnige, emotioneel gedreven verhalen.",
      "Hij houdt zichzelf en de wereld een spiegel voor via maatschappijkritische teksten met een relativerende, humoristische toets. Doorheen de jaren ontwikkelde hij een technische stijl gekenmerkt door multi-rijm, trouw aan de fundamenten van hiphop: bars.",
      "Thorre creeert het liefst concepttracks maar deinst niet terug voor een cypher of freestyle, met onder meer een finaleplek bij 'De Bestn Vant Westn' in 2024. Thorre rapt niet om gehoord te worden, maar omdat hij na jaren schrijven niet meer zonder kan."
    ],
    "bullets": [
      "Diepzinnige concepttracks",
      "Technische multi-rijm bars",
      "Cypher- en freestyle-energie"
    ],
    "links": [
      {
        "label": "facebook",
        "value": "Thorre",
        "href": "https://www.facebook.com/Thorre8560/"
      },
      {
        "label": "soundcloud",
        "value": "thorre8560",
        "href": "https://soundcloud.com/thorre8560"
      },
      {
        "label": "spotify",
        "value": "Thorre",
        "href": "https://open.spotify.com/artist/0umqiVi7wQcryg14XVu7AE"
      },
      {
        "label": "youtube",
        "value": "Thorre",
        "href": "https://www.youtube.com/channel/UCfWQnA8aHN498DUd8Q1i4qQ"
      },
      {
        "label": "instagram",
        "value": "@_thorregineel_",
        "href": "https://www.instagram.com/_thorregineel_/"
      },
      {
        "label": "tiktok",
        "value": "@thorre8560",
        "href": "https://www.tiktok.com/@thorre8560"
      }
    ],
    "description": "Sinds zijn zestiende schrijft Thorre teksten. Wat ooit simpele en vluchtige teksten waren, groeide na meer dan vijftien jaar uit tot diepzinnige, emotioneel g",
    "mediaKind": "photo",
    "focus": {
      "desktop": "50% 21%",
      "mobile": "50% 15%"
    }
  },
  {
    "slug": "krank",
    "name": "Krank",
    "role": "Rapper",
    "scene": "hiphop",
    "image": "/assets/media/artists/krank.webp",
    "quote": "No nonsense bars die je een spiegel voorhouden, met een kritische invalshoek.",
    "paragraphs": [
      "Krank is een West-Vlaamse rapper uit Knokke die sinds 2008 nummers maakt.",
      "Krank begon in de tijd bij De Feiten en bouwde daarna verder aan zijn eigen pad. Tot nu toe bracht hij twee underground solo releases uit, met een stijl die rechtuit blijft en niet rond de pot draait.\n\nZijn muzikale identiteit zit in bars die tegelijk nuchter en scherp zijn: no nonsense, jezelf durven bekijken en de realiteit niet zachter maken dan ze is.",
      "Live brengt Krank diezelfde directe energie naar voren: teksten met gewicht, kritische accenten en een West-Vlaamse gronding die dicht bij zichzelf blijft."
    ],
    "bullets": [
      "No nonsense bars",
      "Kritische invalshoeken",
      "West-Vlaamse underground"
    ],
    "links": [
      {
        "label": "spotify",
        "value": "Krank",
        "href": "https://open.spotify.com/artist/6UdtoDuyUapSM5w0zTpi9R?si=XJKheAXETGqEgFbgXUCeVQ"
      },
      {
        "label": "youtube",
        "value": "@Krankkkkkk",
        "href": "https://www.youtube.com/@Krankkkkkk"
      },
      {
        "label": "instagram",
        "value": "@krankkkkkk_",
        "href": "https://www.instagram.com/krankkkkkk_/"
      }
    ],
    "description": "Krank is een West-Vlaamse rapper uit Knokke die sinds 2008 nummers maakt.",
    "mediaKind": "photo",
    "focus": {
      "desktop": "68% 26%",
      "mobile": "68% 20%"
    }
  },
  {
    "slug": "thepanda",
    "name": "The P.A.N.D.A",
    "role": "Indie hiphopartiest",
    "scene": "hiphop",
    "image": "/assets/media/artists/thepanda.webp",
    "quote": "Knallende drums, soulful en jazzy old-school beats, en strakke bars recht uit hart en ziel.",
    "paragraphs": [
      "The P.A.N.D.A, aka The Persevering Alchemist Naughty Drum's Addict, is een indie hiphopartiest uit Vlaanderen.",
      "Hij is geboren en opgegroeid in de Vlaamse regio van Belgie, opgevoed door een sterke moeder die hem leerde overleven in een harde wereld. Muziek kreeg hij van thuis mee: via zijn vader leerde hij drummen en improviseren, via zijn moeder groeide hij op met hiphop. Tijdens zijn jeugd jamde hij constant met zijn vader, en met zijn moeder luisterde hij naar classics terwijl hij haar ook hoorde rappen.\n\nOp zijn negentiende kreeg hij de smaak van rap echt te pakken. Sindsdien bracht hij meerdere projecten onafhankelijk uit onder de naam \"PandaShaolin\" en stond hij live op podia in heel Belgie. Onderweg nam hij ook een MPC vast en begon hij met beatmaking en fingerdrumming. Terwijl hij zijn pen bleef scherpen en zijn skills uitbouwde, begon hij zich als artiest echt te definieren.",
      "Na een frisse start, ontstaan uit zelfreflectie en een heldere visie op waar hij naartoe wil, nodigt hij iedereen uit in The P.A.N.D.A Universe.\n\nVerwacht knockende drums die je doen bewegen, soulful, jazzy, old-school en ondeugende beats recht uit zijn vingertoppen. Daarbovenop brengt hij lyrisch strakke bars recht uit zijn bewustzijn, en vooral uit zijn hart en ziel.\n\nDeze jonge menace is nog maar net begonnen en denkt er niet aan om te vertragen. Muziek is zijn leven, dus hij blijft maken tot het einde."
    ],
    "bullets": [
      "MPC beatmaking en fingerdrumming",
      "Soulful en jazzy old-school beats",
      "Strakke bars uit bewustzijn, hart en ziel"
    ],
    "links": [
      {
        "label": "linktree",
        "value": "@TheP_A_N_D_A",
        "href": "https://linktr.ee/TheP_A_N_D_A"
      },
      {
        "label": "instagram",
        "value": "@thep_a_n_d_a",
        "href": "https://instagram.com/thep_a_n_d_a"
      },
      {
        "label": "spotify",
        "value": "The P.A.N.D.A",
        "href": "https://open.spotify.com/artist/5QYOZhN0BU8QOFrPAmnPG7?si=owRSOSnWRfuyTCqe5LHkMQ"
      }
    ],
    "description": "The P.A.N.D.A, aka The Persevering Alchemist Naughty Drum's Addict, is een indie hiphopartiest uit Vlaanderen.",
    "mediaKind": "photo",
    "focus": {
      "desktop": "50% 25%",
      "mobile": "50% 17%"
    }
  },
  {
    "slug": "duvve",
    "name": "Duvve",
    "role": "Rapper / Live-artiest",
    "scene": "hiphop",
    "image": "/assets/media/artists/duvve.webp",
    "quote": "Hoog-energie rap met podiumurgentie op bandniveau.",
    "paragraphs": [
      "Performancegerichte rapper met sterke focus op podiumbeweging en publieksreactie.",
      "Duvve brengt een fysiek actieve stijl in de line-up, gevormd door live circuits en crewgedreven shows waar tempo en betrokkenheid hoog blijven.",
      "De setstructuur is dynamisch: snelle tempowissels, directe hooks en publiekscues afgestemd op kleine clubs en grotere festivalslots."
    ],
    "bullets": [
      "Podiumcontrole",
      "Live publieksinteractie",
      "Samenwerkende shows"
    ],
    "links": [
      {
        "label": "youtube",
        "value": "TXMUSIC session",
        "href": "https://www.youtube.com/watch?v=xFmQNG0r0xE"
      }
    ],
    "description": "Performancegerichte rapper met sterke focus op podiumbeweging en publieksreactie.",
    "mediaKind": "photo",
    "focus": {
      "desktop": "50% 23%",
      "mobile": "50% 18%"
    }
  },
  {
    "slug": "bruce",
    "name": "Bruce",
    "role": "Producent",
    "scene": "hiphop",
    "image": "/assets/media/artists/bruce.webp",
    "quote": "Precies drumwerk en schaduwrijk klankdesign.",
    "paragraphs": [
      "Producer met focus op diepe drums, donkere melodische lagen en mixklare arrangementen.",
      "Bruce bouwt tracks vanuit ritme eerst. De productietaal is strak maar zwaar, met laagfrequente discipline en filmische transities.",
      "Studiogerichte werkwijze, beschikbaar voor schrijfsessies, maatproductie en collaboratieve arrangementstrajecten."
    ],
    "bullets": [
      "Beatproductie",
      "Arrangement en structuur",
      "Sessieklare sporen"
    ],
    "links": [],
    "description": "Producer met focus op diepe drums, donkere melodische lagen en mixklare arrangementen.",
    "mediaKind": "photo",
    "focus": {
      "desktop": "58% 24%",
      "mobile": "58% 18%"
    }
  },
  {
    "slug": "creamz",
    "name": "Creamz",
    "role": "Producent / Beatmaker",
    "scene": "hiphop",
    "image": "/assets/media/artists/creamz.webp",
    "quote": "Bounce-architectuur met gedetailleerd textuurwerk.",
    "paragraphs": [
      "Beatmaker die bounce-gedreven grooves vormt met gelaagde drumtexturen.",
      "Creamz ontwikkelt beats die ruimte laten voor vocaal karakter en tegelijk ritmische identiteit duwen. De kant is praktisch en klaar voor optreden.",
      "Best inzetbaar in studio- en schrijfkampen: ideeen schetsen, loops uitwerken en volledige songs ontwikkelen met artiesten."
    ],
    "bullets": [
      "Beatdesign",
      "Producer-sessies",
      "Dropgerichte arrangementen"
    ],
    "links": [],
    "description": "Beatmaker die bounce-gedreven grooves vormt met gelaagde drumtexturen.",
    "mediaKind": "artwork"
  },
  {
    "slug": "zwoantje",
    "name": "Zwoantje",
    "role": "Rapper",
    "scene": "hiphop",
    "image": "/assets/media/artists/zwoantje.webp",
    "mediaKind": "identity",
    "quote": "Nieuwe West-Vlaamse stem. Eerste track onderweg.",
    "paragraphs": [
      "Zwoantje is een West-Vlaamse rapper uit Brugge en sluit aan bij de Hip hop-sectie van Kwartier West.",
      "Ze staat aan het begin van haar releaseverhaal. Haar eerste track komt binnenkort."
    ],
    "bullets": [
      "Hip hop",
      "Brugge / West-Vlaanderen",
      "Eerste track binnenkort"
    ],
    "links": [],
    "description": "Zwoantje is een West-Vlaamse rapper uit Brugge en nieuw bij de Hip hop-sectie van Kwartier West. Haar eerste track komt binnenkort.",
    "status": "new",
    "announcement": {
      "eyebrow": "Nieuw / Hip hop",
      "title": "Zwoantje sluit aan bij Kwartier West.",
      "body": "Een nieuwe West-Vlaamse stem in de Hip hop-sectie. Haar eerste track komt binnenkort."
    }
  }
] as const satisfies readonly ArtistSource[];

function enrichArtist(source: ArtistSource, index: number): Artist {
  const sameAs = source.links.map((link) => link.href);
  return {
    ...source,
    variant: `artist-v${index % 4}` as Artist["variant"],
    title: `${source.name} | Kwartier West`,
    canonical: `${siteUrl}/artiesten/${source.slug}`,
    og: `${siteUrl}/assets/og/artists/${source.slug}.jpg`,
    schema: {
      "@context": "https://schema.org",
      "@type": "Person",
      name: source.name,
      url: `${siteUrl}/artiesten/${source.slug}`,
      image: `${siteUrl}${source.image}`,
      jobTitle: source.role,
      description: source.description,
      memberOf: { "@id": `${siteUrl}/#organization` },
      ...(sameAs.length ? { sameAs } : {}),
    },
  };
}

export const artists = artistSources.map(enrichArtist) as readonly Artist[];
export const artistBySlug = new Map<string, Artist>(artists.map((artist) => [artist.slug, artist]));
export const teknoArtists = artists.filter((artist) => artist.scene === "tekno");
export const hiphopArtists = artists.filter((artist) => artist.scene === "hiphop");
export const newArtists = artists.filter((artist) => artist.status === "new");

export function artistsForScene(scene: Scene) {
  return scene === "tekno" ? teknoArtists : hiphopArtists;
}

export function artistIndexLabel(slug: string) {
  const index = artists.findIndex((artist) => artist.slug === slug);
  return index < 0 ? "" : `${String(index + 1).padStart(2, "0")} / ${artists.length}`;
}

export function nextArtistInScene(artist: Artist) {
  const sceneArtists = artistsForScene(artist.scene);
  const index = sceneArtists.findIndex((item) => item.slug === artist.slug);
  return sceneArtists[(index + 1) % sceneArtists.length] ?? artist;
}
