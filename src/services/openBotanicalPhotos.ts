export interface OpenLicensePhoto {
  id: string;
  url: string;
  thumbUrl: string;
  license: string;
  author: string;
  source: 'Wikimedia Commons' | 'NaturaLista (CC)' | 'Dominio Público';
  title: string;
  isExactSpecies: boolean;
}

const PHOTO_CACHE_KEY = 'atlas_open_license_photos_v1';

interface CachedSpeciesPhotos {
  timestamp: number;
  photos: OpenLicensePhoto[];
}

function getCache(): Record<string, CachedSpeciesPhotos> {
  try {
    const raw = localStorage.getItem(PHOTO_CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading photo cache:', e);
  }
  return {};
}

function saveToCache(speciesCode: string, photos: OpenLicensePhoto[]) {
  try {
    const current = getCache();
    current[speciesCode] = {
      timestamp: Date.now(),
      photos: photos.slice(0, 8)
    };
    // Keep cache compact (max 250 species in localStorage)
    const keys = Object.keys(current);
    if (keys.length > 250) {
      const oldestKey = keys.sort((a, b) => current[a].timestamp - current[b].timestamp)[0];
      delete current[oldestKey];
    }
    localStorage.setItem(PHOTO_CACHE_KEY, JSON.stringify(current));
  } catch (e) {
    // Ignore quota errors
  }
}

function cleanHtml(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Queries Wikimedia Commons for copyright-free / Creative Commons images
 */
async function searchWikimediaOpenPhotos(query: string, isExactSpecies: boolean): Promise<OpenLicensePhoto[]> {
  try {
    const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      query
    )}&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=900&format=json&origin=*`;

    const res = await fetch(endpoint);
    if (!res.ok) return [];
    const data = await res.json();
    const pages = data.query?.pages ? Object.values(data.query.pages) : [];

    const results: OpenLicensePhoto[] = [];

    for (const page of pages as any[]) {
      const info = page?.imageinfo?.[0];
      if (!info) continue;

      const imageUrl: string = (info.thumburl || info.url || '').split('?')[0];
      if (!imageUrl || !/\.(jpg|jpeg|png|webp)$/i.test(imageUrl)) continue;
      // Exclude maps, icons, or herbarium barcodes if possible
      const lowerTitle = (page.title || '').toLowerCase();
      if (lowerTitle.includes('map') || lowerTitle.includes('logo') || lowerTitle.includes('icon')) continue;

      const ext = info.extmetadata || {};
      const rawLicense = cleanHtml(ext.LicenseShortName?.value || ext.UsageTerms?.value || 'CC BY-SA');
      const rawArtist = cleanHtml(ext.Artist?.value || ext.Credit?.value || 'Wikimedia Commons');

      const isPublicDomain =
        rawLicense.toLowerCase().includes('public domain') ||
        rawLicense.toLowerCase().includes('cc0') ||
        rawLicense.toLowerCase().includes('pd');

      results.push({
        id: `wiki-${page.pageid}`,
        url: imageUrl,
        thumbUrl: info.thumburl || imageUrl,
        license: isPublicDomain ? 'Dominio Público / CC0 (Sin Copyright)' : `${rawLicense} (Libre uso con atribución)`,
        author: rawArtist.slice(0, 50) || 'Acervo Wikimedia',
        source: isPublicDomain ? 'Dominio Público' : 'Wikimedia Commons',
        title: cleanHtml((page.title || '').replace(/^File:/i, '').replace(/\.[a-z]+$/i, '')),
        isExactSpecies
      });
    }

    return results;
  } catch (err) {
    return [];
  }
}

/**
 * Queries iNaturalist / NaturaLista CONABIO for strictly open-licensed photos (CC0, CC-BY, CC-BY-SA)
 */
async function searchINaturalistOpenPhotos(taxonName: string, isExactSpecies: boolean): Promise<OpenLicensePhoto[]> {
  try {
    const endpoint = `https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(
      taxonName
    )}&photo_license=cc0,cc-by,cc-by-sa&photos=true&quality_grade=research&per_page=6`;

    const res = await fetch(endpoint);
    if (!res.ok) return [];
    const data = await res.json();

    const results: OpenLicensePhoto[] = [];
    const seenUrls = new Set<string>();

    for (const obs of data.results || []) {
      for (const photo of obs.photos || []) {
        if (!photo?.url || !photo?.license_code) continue;
        const largeUrl = photo.url.replace('square', 'large');
        const mediumUrl = photo.url.replace('square', 'medium');
        if (seenUrls.has(largeUrl)) continue;
        seenUrls.add(largeUrl);

        const code = String(photo.license_code).toUpperCase();
        const isCC0 = code === 'CC0';
        const rawAttr = cleanHtml(photo.attribution || '')
          .replace(/^\(c\)\s*/i, '')
          .split(',')[0]
          .trim();

        results.push({
          id: `inat-${photo.id}`,
          url: largeUrl,
          thumbUrl: mediumUrl,
          license: isCC0 ? 'CC0 Dominio Público (Sin Copyright)' : `${code} (Licencia Abierta)`,
          author: rawAttr || obs.user?.name || obs.user?.login || 'NaturaLista México',
          source: isCC0 ? 'Dominio Público' : 'NaturaLista (CC)',
          title: `${obs.taxon?.name || taxonName} ${obs.place_guess ? `- ${obs.place_guess}` : ''}`,
          isExactSpecies
        });

        if (results.length >= 6) break;
      }
      if (results.length >= 6) break;
    }

    return results;
  } catch (err) {
    return [];
  }
}

/**
 * Fetches verified copyright-free / open-license botanical photos for an orchid species.
 * Prioritizes CC0 / Public Domain first, then CC-BY / CC-BY-SA.
 */
export async function fetchOpenLicensePhotosForSpecies(
  speciesCode: string,
  scientificName: string,
  genus: string,
  forceRefresh = false
): Promise<OpenLicensePhoto[]> {
  if (!forceRefresh) {
    const cached = getCache()[speciesCode];
    if (cached && cached.photos && cached.photos.length > 0) {
      return cached.photos;
    }
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return [];
  }

  // 1. Search exact species in parallel on Wikimedia Commons and iNaturalist Open Data
  const [wikiExact, inatExact] = await Promise.all([
    searchWikimediaOpenPhotos(scientificName, true),
    searchINaturalistOpenPhotos(scientificName, true)
  ]);

  let combined = [...inatExact, ...wikiExact];

  // Sort so CC0 / Public Domain come first, and exact species come first
  combined.sort((a, b) => {
    const aCC0 = a.license.includes('CC0') || a.license.includes('Dominio Público') ? 1 : 0;
    const bCC0 = b.license.includes('CC0') || b.license.includes('Dominio Público') ? 1 : 0;
    return bCC0 - aCC0;
  });

  // 2. If fewer than 2 photos found for exact species, supplement with open-license genus photos
  if (combined.length < 2 && genus) {
    const [wikiGenus, inatGenus] = await Promise.all([
      searchWikimediaOpenPhotos(`${genus} orchid`, false),
      searchINaturalistOpenPhotos(genus, false)
    ]);
    combined = [...combined, ...inatGenus, ...wikiGenus];
  }

  // Deduplicate by URL
  const unique: OpenLicensePhoto[] = [];
  const seen = new Set<string>();
  for (const item of combined) {
    if (!seen.has(item.url)) {
      seen.add(item.url);
      unique.push(item);
    }
  }

  if (unique.length > 0) {
    saveToCache(speciesCode, unique);
  }

  return unique;
}
