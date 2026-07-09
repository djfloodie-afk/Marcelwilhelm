# Tagebuch-Landingpage

Eine schlanke One-Page-Landingpage zur Bewerbung von KDP-Tagebüchern über
Affiliate-Links. Alle Inhalte werden aus `data/books.json` geladen – am
HTML musst du dafür nie etwas ändern.

## Projektstruktur

```
/
├── index.html          Struktur der Seite (enthält KEINE Buchdaten)
├── css/
│   └── styles.css       Sämtliches Design (Farben, Layout, Animationen)
├── js/
│   └── app.js           Lädt books.json, rendert Hero/Grid, Suche/Filter/Sortierung
├── data/
│   └── books.json       Alle Bücher – einzige Datei, die du im Alltag bearbeitest
├── images/
│   ├── hero/             Bild fürs Hero-Feature, falls gewünscht
│   ├── books/             Alle Buch-Cover (WebP empfohlen)
│   └── icons/             Platz für eigene Icons (optional, aktuell ungenutzt)
└── README.md
```

## Wie die Seite funktioniert

Beim Laden holt `js/app.js` per `fetch()` die Datei `data/books.json` und
baut daraus automatisch auf:

- das **Hero-Buch** (das Buch mit `"featured": true`)
- das **Buch-Grid** mit allen Covern
- die **Genre-Filterliste** (aus allen vorkommenden `genre`-Werten)
- **Suche** nach Titel, **Sortierung** nach Neu / Bestseller / Alphabetisch

## 1. Neues Buch hinzufügen

1. Cover als `.webp` in `images/books/` legen, z. B. `mein-neues-buch.webp`
2. In `data/books.json` einen neuen Eintrag ans Ende der Liste anhängen:

```json
{
  "title": "Mein neues Tagebuch",
  "subtitle": "Design 1",
  "description": "Kurze, einladende Beschreibung des Buchs.",
  "image": "images/books/mein-neues-buch.webp",
  "amazon": "https://amzn.to/DEIN-LINK",
  "badge": "Neu",
  "rating": 5,
  "genre": "Achtsamkeit",
  "featured": false
}
```

3. Speichern. Fertig – kein HTML anfassen, kein Deploy-Schritt nötig
   außer dem Hochladen der aktualisierten Datei.

> Für dasselbe Buch in mehreren Cover-Designs (z. B. 3 Varianten mit
> jeweils eigenem Affiliate-Link): einfach 3 separate Einträge mit
> gleichem `title`, aber unterschiedlichem `subtitle`, `image` und
> `amazon` anlegen – wie bei "Rettungsdienst Tagebuch" im Beispieldatensatz.

## 2. Bild austauschen

- **Gleicher Dateiname:** Datei in `images/books/` einfach überschreiben,
  fertig. Der Browser cached WebP-Bilder aber teils hart – bei Bedarf den
  Dateinamen leicht ändern (z. B. `cover-v2.webp`) und in `books.json`
  unter `"image"` anpassen.
- **Neuer Dateiname:** Bild hochladen und den `"image"`-Pfad im
  entsprechenden JSON-Eintrag anpassen.

Empfehlung für Cover-Bilder: **WebP**, Seitenverhältnis ca. **3:4**,
Breite ca. 600–800 px reicht für die Darstellung im Grid völlig aus und
hält die Ladezeit niedrig. Alle Bilder werden ohnehin per
`loading="lazy"` erst geladen, wenn sie in den sichtbaren Bereich
scrollen.

## 3. Neues Genre anlegen

Kein separater Schritt nötig: Trag im Buch-Eintrag einfach einen neuen
Wert bei `"genre"` ein (z. B. `"genre": "Familie"`). Die
Genre-Filterleiste liest alle vorkommenden Genres automatisch aus
`books.json` aus und zeigt sie an – auch ganz neue.

## 4. Neues Badge erstellen

Auch hier: kein Code nötig. `"badge"` ist ein freier Text, z. B.
`"Bestseller"`, `"Neu"`, `"Limitiert"` oder leer (`""`), wenn ein Buch
kein Badge zeigen soll. Das Badge erscheint automatisch auf der
Vorderseite der Karte.

## Datenfelder in `books.json`

| Feld          | Typ     | Beschreibung                                              |
|---------------|---------|-------------------------------------------------------------|
| `title`       | string  | Buchtitel                                                    |
| `subtitle`    | string  | Zusatz, z. B. Design-Name                                    |
| `description` | string  | Kurzbeschreibung auf der Kartenrückseite                     |
| `image`       | string  | Relativer Pfad zum Cover, z. B. `images/books/xy.webp`        |
| `amazon`      | string  | Affiliate-Link zu genau diesem Buch/Design                   |
| `badge`       | string  | Freitext-Label auf dem Cover, leer lassen für kein Badge      |
| `rating`      | number  | 1–5, wird als Sterne dargestellt                              |
| `genre`       | string  | Steuert die Genre-Filterleiste                                |
| `featured`    | boolean | `true` = dieses Buch erscheint im Hero (nur bei einem Buch!)  |

## Lokal testen

Weil `app.js` die JSON-Datei per `fetch()` nachlädt, blockieren Browser
das aus Sicherheitsgründen, wenn du `index.html` einfach doppelklickst
(`file://`-Protokoll). Zum lokalen Testen einen einfachen lokalen
Server starten, z. B.:

```bash
# Python (meist vorinstalliert)
python3 -m http.server 8000

# oder mit Node.js
npx serve .
```

Danach im Browser `http://localhost:8000` öffnen.

## Deployment auf static.run

Einfach den kompletten Ordnerinhalt (inkl. `css/`, `js/`, `data/`,
`images/`) hochladen, `index.html` bleibt im Root. Da ausschließlich
relative Pfade verwendet werden, funktioniert das ohne weitere
Anpassungen.

## Nicht vergessen

Für eine deutsche Affiliate-Seite ist ein **Impressum** (und je nach
Aufbau eine Datenschutzerklärung) gesetzlich vorgeschrieben. Das ist
bewusst nicht Teil dieser Vorlage, da es echte, individuelle Angaben
braucht – bitte separat ergänzen.
