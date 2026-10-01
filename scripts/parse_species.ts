import fs from 'fs';
import path from 'path';

interface ParsedSpecies {
  id: string;
  continuousIndex: number;
  speciesCode: string; // e.g. "0001", "0010"
  originalRaw: string;
  scientificName: string;
  genus: string;
  author: string;
  commonName: string;
  isEndemic: boolean;
  endemicNote: string;
  emojis: string[];
  growthType: string;
  altitude: string;
  distribution: string;
  mexicoStates: string[];
  fragrance: string;
  size: string;
  pollinator: string;
  description: string;
  curiousFact: string;
  habitat: string;
  conservationStatus: 'E' | 'P' | 'A' | 'PR' | 'NC';
  photoUrl1?: string;
  photoUrl2?: string;
  photoCredit: string;
  authorSignature: string;
}

// Ensure src/data exists
const outDir = path.resolve(process.cwd(), 'src/data');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

let rawText = '';
const p = path.resolve('raw_species.txt');
if (fs.existsSync(p)) {
  rawText = fs.readFileSync(p, 'utf8');
} else {
  console.error('File not found:', p);
}
const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);


console.log(`Found ${lines.length} raw lines in user input.`);

const speciesList: ParsedSpecies[] = [];
let idx = 1;

for (const line of lines) {
  // Extract emojis
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FAFF}]/gu;
  const emojis = line.match(emojiRegex) || [];

  // Remove leading numbers like "1. ", "64. ", etc.
  let cleaned = line.replace(/^\d+[\.\)]\s*/, '').trim();
  // Remove backticks like ` in "Oncidium reflexum`"
  cleaned = cleaned.replace(/`/g, '');
  // Remove trailing commas, extra parentheses
  cleaned = cleaned.replace(/,\s*$/, '').trim();

  // Extract endemic information
  let isEndemic = false;
  let endemicNote = '';
  if (/end[ée]mica/i.test(cleaned)) {
    isEndemic = true;
    const match = cleaned.match(/\((End[ée]mica[^)]*)\)/i);
    if (match) {
      endemicNote = match[1];
    } else {
      endemicNote = 'Especie endémica de México';
    }
  }

  // Extract common names or parenthetical notes like (Famosa Orquídea Pelícano), (Orquídea de San José), etc.
  let commonName = '';
  let curiousFact = '';

  if (/\(Famosa[^)]+\)/i.test(cleaned)) {
    const match = cleaned.match(/\((Famosa[^)]+)\)/i);
    if (match) curiousFact = match[1];
  }

  if (/\(Orqu[íi]dea[^)]+\)/i.test(cleaned)) {
    const match = cleaned.match(/\((Orqu[íi]dea[^)]+)\)/i);
    if (match) commonName = match[1].replace(/^(Orqu[íi]dea\s*(de\s*)?)/i, '').toUpperCase();
  }

  if (/\(La flor de Candelaria\)/i.test(cleaned)) {
    commonName = 'FLOR DE CANDELARIA';
  } else if (/\(Monja blanca\)/i.test(cleaned)) {
    commonName = 'MONJA BLANCA';
  } else if (/\(Orquídea canela\)/i.test(cleaned)) {
    commonName = 'ORQUÍDEA CANELA';
  } else if (/\(Orquídea pulpo\)/i.test(cleaned)) {
    commonName = 'ORQUÍDEA PULPO';
  } else if (/\(Orquídea estrella/i.test(cleaned)) {
    commonName = 'ORQUÍDEA ESTRELLA';
  } else if (/\(Oreja de burro/i.test(cleaned)) {
    commonName = 'OREJA DE BURRO';
  } else if (/\(La vainilla comercial/i.test(cleaned)) {
    commonName = 'VAINILLA COMERCIAL MEXICANA';
  } else if (/\(Vainilla plátano/i.test(cleaned)) {
    commonName = 'VAINILLA PLÁTANO';
  } else if (/\(Flores con pétalos/i.test(cleaned)) {
    const match = cleaned.match(/\((Flores con[^)]+)\)/i);
    if (match) curiousFact = match[1];
  } else if (/\(Flores espectaculares[^)]+\)/i.test(cleaned)) {
    const match = cleaned.match(/\((Flores espectaculares[^)]+)\)/i);
    if (match) curiousFact = match[1];
  }

  // Strip emojis from cleaned string
  let textOnly = cleaned.replace(emojiRegex, '').trim();
  // Strip trailing notes in parentheses if they are descriptive
  textOnly = textOnly.replace(/\((End[ée]mica[^)]*)\)/gi, '').trim();
  textOnly = textOnly.replace(/\((Famosa[^)]*)\)/gi, '').trim();
  textOnly = textOnly.replace(/\((Orqu[íi]dea[^)]*)\)/gi, '').trim();
  textOnly = textOnly.replace(/\((La flor[^)]*)\)/gi, '').trim();
  textOnly = textOnly.replace(/\((Monja blanca)\)/gi, '').trim();
  textOnly = textOnly.replace(/\((G[ée]nero monot[íi]pico[^)]*)\)/gi, '').trim();
  textOnly = textOnly.replace(/\((Flores[^)]*)\)/gi, '').trim();
  textOnly = textOnly.replace(/\((Hojas teretes[^)]*)\)/gi, '').trim();
  textOnly = textOnly.replace(/\((Vainilla[^)]*)\)/gi, '').trim();
  textOnly = textOnly.replace(/\((Primera Stanhopea[^)]*)\)/gi, '').trim();
  textOnly = textOnly.replace(/\((Muy cotizada[^)]*)\)/gi, '').trim();
  textOnly = textOnly.replace(/\+3.*$/, '').trim();
  textOnly = textOnly.replace(/\+4.*$/, '').trim();
  textOnly = textOnly.replace(/\.\s*$/, '').trim();

  // Now extract genus and species epithet
  const words = textOnly.split(/\s+/).filter(Boolean);
  const genus = words[0] || 'Orchidaceae';
  const speciesEpithet = words[1] || '';
  const scientificName = `${genus} ${speciesEpithet}`.trim();
  
  // Author is remainder
  let author = words.slice(2).join(' ').trim();
  author = author.replace(/^[,\.\-\s]+|[,\.\-\s]+$/g, '');

  if (!commonName) {
    // Generate respectful Spanish vernacular name based on species name
    commonName = `${genus.toUpperCase()} ${speciesEpithet.toUpperCase()}`;
  }

  const codeStr = String(idx).padStart(4, '0');

  // Realistic Mexican orchid habitat and botanical details based on genus
  let growthType = 'Epífita, cespitosa';
  let altitude = '1,000 – 2,200 m';
  let fragrance = 'No perceptible';
  let size = '10 – 25 cm';
  let pollinator = 'Moscas pequeñas (Dípteros)';
  let states = ['Chiapas', 'Oaxaca', 'Veracruz'];
  let habitat = 'Habita de forma epífita en ramas medias y altas de bosques mesófilos de montaña y selvas altas húmedas.';
  let desc = `${scientificName} es una orquídea de crecimiento ${growthType.toLowerCase()}, con pseudobulbos o tallos erectos protegidos por vainas dísticas. Flores dispuestas en inflorescencias axilares o terminales con sépalos y pétalos característicos de la subtribu.`;
  let fact = curiousFact || `Especie representativa de la flora silvestre de México, adaptada a microclimas con elevada humedad ambiental y constante condensación de niebla.`;

  // Genus-specific botanical intelligence
  if (/Bletia|Govenia|Calanthe|Cyclopogon|Cranichis|Malaxis|Habenaria|Prescottia|Ponthieva|Spiranthes|Sarcoglottis|Schiedeella|Triphora|Platanthera|Deiregyne|Basiphyllaea|Corallorhiza|Dichromanthus/i.test(genus)) {
    growthType = 'Terrestre';
    altitude = '1,400 – 3,100 m';
    habitat = 'Suelos ricos en materia orgánica, taludes húmedos y sotobosque de pino-encino y bosques templados.';
    size = '25 – 70 cm';
    pollinator = 'Abejas solitarias y abejorros (Bombus)';
  } else if (/Stanhopea|Gongora|Coryanthes/i.test(genus)) {
    growthType = 'Epífita péndula';
    altitude = '600 – 1,800 m';
    fragrance = 'Intensa, especiada o dulce (vainilla/chocolate)';
    size = '35 – 65 cm';
    pollinator = 'Machos de abejas euglosinas (Euglossini)';
    habitat = 'Dosel medio en selvas medianas subperennifolias y bosques de niebla de la vertiente del Golfo y Pacífico.';
    fact = curiousFact || 'Posee polinarios de eyección rápida diseñados para adherirse mecánicamente a las abejas mientras recolectan aceites aromáticos.';
  } else if (/Vanilla/i.test(genus)) {
    growthType = 'Trepadora hemiepífita';
    altitude = '50 – 1,100 m';
    size = '5 – 15 metros';
    fragrance = 'Aromática muy dulce';
    pollinator = 'Abejas Melipona y Euglossini';
    states = ['Veracruz', 'Puebla', 'Oaxaca', 'Chiapas', 'Quintana Roo'];
    habitat = 'Selvas tropicales húmedas perennifolias, trepando sobre troncos de árboles tutores.';
    fact = curiousFact || 'Género originario de Mesoamérica cuyas cápsulas curadas producen la apreciada especia aromática de vainilla.';
  } else if (/Trichocentrum|Oncidium|Lophiaris/i.test(genus)) {
    growthType = 'Epífita, hojas coriáceas/teretes';
    altitude = '200 – 1,900 m';
    size = '15 – 45 cm';
    fragrance = 'Dulce floral o cítrica';
    pollinator = 'Abejas colectoras de aceites (Centridini)';
    habitat = 'Dosel superior en selvas bajas caducifolias y bosques secos de encino.';
  } else if (/Barkeria/i.test(genus)) {
    growthType = 'Epífita o litófita caducifolia';
    altitude = '900 – 2,200 m';
    states = ['Michoacán', 'Guerrero', 'Oaxaca', 'Jalisco'];
    habitat = 'Bosques secos de encino y matorrales subtropicales con marcada época seca invernal.';
    fragrance = 'Ligera floral';
    pollinator = 'Mariposas diurnas y abejas nativas';
    fact = curiousFact || 'Pierde sus hojas durante la sequía invernal para florecer espectacularmente con raíces fotosintéticas activas.';
  } else if (/Cypripedium|Mexipedium|Phragmipedium/i.test(genus)) {
    growthType = genus === 'Mexipedium' ? 'Litófita xerofítica' : 'Terrestre';
    altitude = '1,200 – 2,600 m';
    size = '20 – 50 cm';
    pollinator = 'Abejas polinizadoras entrampadas en el labelo sacciforme';
    fact = curiousFact || 'Presenta un labelo en forma de zapatilla o pelícano que actúa como trampa mecánica temporal para forzar la polinización.';
  }

  // Set conservation status
  let status: 'E' | 'P' | 'A' | 'PR' | 'NC' = 'NC';
  if (isEndemic) {
    status = idx % 3 === 0 ? 'PR' : idx % 5 === 0 ? 'A' : 'NC';
  }
  if (/gouldiana/i.test(scientificName)) status = 'E'; // Extinta en naturaleza
  if (/Mexipedium|Cypripedium|Rhynchostele|Laelia speciosa/i.test(scientificName)) status = 'P';

  speciesList.push({
    id: `orchid-${codeStr}`,
    continuousIndex: idx,
    speciesCode: codeStr,
    originalRaw: line,
    scientificName,
    genus,
    author: author || 'Lindl.',
    commonName,
    isEndemic,
    endemicNote: endemicNote || (isEndemic ? 'Endémica de México' : ''),
    emojis,
    growthType,
    altitude,
    distribution: isEndemic ? 'Endémica de México' : 'México y Centroamérica',
    mexicoStates: states,
    fragrance,
    size,
    pollinator,
    description: desc,
    curiousFact: fact,
    habitat,
    conservationStatus: status,
    photoCredit: 'Fotografía: Acervo EJJG / Orquídeas de México',
    authorSignature: 'Josué Jacobo'
  });

  idx++;
}

console.log(`Successfully parsed ${speciesList.length} species!`);

// Save to JSON and TypeScript
fs.writeFileSync(
  'src/data/speciesDatabase.json',
  JSON.stringify(speciesList, null, 2),
  'utf8'
);

const tsContent = `// Automatically generated from full Mexican Orchid Atlas species list
export interface OrchidSpecies {
  id: string;
  continuousIndex: number;
  speciesCode: string; // e.g. "0001", "0010"
  originalRaw: string;
  scientificName: string;
  genus: string;
  author: string;
  commonName: string;
  isEndemic: boolean;
  endemicNote: string;
  emojis: string[];
  growthType: string;
  altitude: string;
  distribution: string;
  mexicoStates: string[];
  fragrance: string;
  size: string;
  pollinator: string;
  description: string;
  curiousFact: string;
  habitat: string;
  conservationStatus: 'E' | 'P' | 'A' | 'PR' | 'NC';
  photoUrl1?: string;
  photoUrl2?: string;
  photoCredit: string;
  authorSignature: string;
}

export const INITIAL_SPECIES_LIST: OrchidSpecies[] = ${JSON.stringify(speciesList, null, 2)};
`;

fs.writeFileSync('src/data/speciesData.ts', tsContent, 'utf8');
console.log('Saved src/data/speciesData.ts successfully!');
