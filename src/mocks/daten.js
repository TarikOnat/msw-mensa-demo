// Beispieldaten für die Demo. Kein echter Speiseplan.

// Datum als "JJJJ-MM-TT" in Ortszeit, relativ zu heute
function datumIn(tage) {
  const d = new Date()
  d.setDate(d.getDate() + tage)
  const zweistellig = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${zweistellig(d.getMonth() + 1)}-${zweistellig(d.getDate())}`
}

export const datum = { heute: datumIn(0), morgen: datumIn(1) }

// Preise in Euro: Studierende / Bedienstete / Gäste
const preis = (studierende, bedienstete, gaeste) => ({ studierende, bedienstete, gaeste })

export const speiseplaene = {
  heute: {
    tag: 'heute',
    datum: datum.heute,
    mensa: 'Campus-Mensa',
    gerichte: [
      {
        id: 1,
        name: 'Linsen-Dal',
        beilage: 'mit Basmatireis und Koriander',
        kategorie: 'vegan',
        preise: preis(2.1, 3.8, 4.9),
        bild: '/bilder/linsen-dal.svg',
      },
      {
        id: 2,
        name: 'Spinat-Lasagne',
        beilage: 'mit Tomatensalat',
        kategorie: 'vegetarisch',
        preise: preis(2.5, 4.2, 5.4),
        bild: '/bilder/spinat-lasagne.svg',
      },
      {
        id: 3,
        name: 'Hähnchen-Curry',
        beilage: 'mit Jasminreis und Mango-Chutney',
        kategorie: 'Fleisch',
        preise: preis(3.2, 5.1, 6.3),
        bild: '/bilder/haehnchen-curry.svg',
      },
      {
        id: 4,
        name: 'Seelachs',
        beilage: 'mit Kartoffelpüree und Erbsen',
        kategorie: 'Fisch',
        preise: preis(3.45, 5.3, 6.6),
        bild: '/bilder/seelachs.svg',
      },
    ],
  },
  morgen: {
    tag: 'morgen',
    datum: datum.morgen,
    mensa: 'Campus-Mensa',
    gerichte: [
      {
        id: 5,
        name: 'Gemüse-Chili sin Carne',
        beilage: 'mit Fladenbrot',
        kategorie: 'vegan',
        preise: preis(1.95, 3.6, 4.7),
        bild: '/bilder/gemuese-chili.svg',
      },
      {
        id: 6,
        name: 'Käsespätzle',
        beilage: 'mit Röstzwiebeln und Gurkensalat',
        kategorie: 'vegetarisch',
        preise: preis(2.4, 4.1, 5.2),
        bild: '/bilder/kaesespaetzle.svg',
      },
      {
        id: 7,
        name: 'Currywurst',
        beilage: 'mit Pommes frites',
        kategorie: 'Fleisch',
        preise: preis(2.9, 4.6, 5.8),
        bild: '/bilder/currywurst.svg',
      },
    ],
  },
}
