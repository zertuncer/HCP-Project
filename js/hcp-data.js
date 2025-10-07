// HCP Data - now loaded from Google Sheet CSV
// Local data removed - all data comes from remote CSV


// Initialize with empty data - will be replaced by CSV data
hcpData = {};

// Country coordinates for map positioning
const countryCoordinates = {
  "Argentina": { lat: -38.4161, lng: -63.6167 },
  "Australia": { lat: -25.2744, lng: 133.7751 },
  "Austria": { lat: 47.5162, lng: 14.5501 },
  "Brazil": { lat: -14.2350, lng: -51.9253 },
  "Canada": { lat: 56.1304, lng: -106.3468 },
  "Chile": { lat: -35.6751, lng: -71.5430 },
  "Colombia": { lat: 4.5709, lng: -74.2973 },
  "Czech Republic": { lat: 49.8175, lng: 15.4730 },
  "Denmark": { lat: 56.2639, lng: 9.5018 },
  "Germany": { lat: 51.1657, lng: 10.4515 },
  "Greece": { lat: 39.0742, lng: 21.8243 },
  "Israel": { lat: 31.0461, lng: 34.8516 },
  "Italy": { lat: 41.8719, lng: 12.5674 },
  "Japan": { lat: 36.2048, lng: 138.2529 },
  "Netherlands": { lat: 52.1326, lng: 5.2913 },
  "New Zealand": { lat: -40.9006, lng: 174.8860 },
  "Norway": { lat: 60.4720, lng: 8.4689 },
  "Poland": { lat: 51.9194, lng: 19.1451 },
  "Saudi Arabia": { lat: 23.8859, lng: 45.0792 },
  "South Korea": { lat: 35.9078, lng: 127.7669 },
  "Spain": { lat: 40.4637, lng: -3.7492 },
  "Sweden": { lat: 60.1282, lng: 18.6435 },
  "Switzerland": { lat: 46.8182, lng: 8.2275 },
  "Turkey": { lat: 38.9637, lng: 35.2433 },
  "United Kingdom": { lat: 55.3781, lng: -3.4360 },
  "United States": { lat: 37.0902, lng: -95.7129 },
  "United Arab Emirates": { lat: 23.4241, lng: 53.8478 }
};

// Helper function to get country data
function getCountryData(countryName) {
  return hcpData[countryName] || [];
}

// Helper function to get all countries with data
function getAllCountries() {
  return Object.keys(hcpData);
}

// Helper function to get country coordinates
function getCountryCoordinates(countryName) {
  return countryCoordinates[countryName] || null;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { hcpData, countryCoordinates };
}

// === Remote data loader (Google Sheet CSV) ===
// Toggle to enable loading data from a published Google Sheet CSV
// Set this to true and provide SHEET_CSV_URL below to replace/augment local hcpData
/* eslint-disable no-unused-vars */
const ENABLE_REMOTE_DATA = true; // enabled for published Google Sheet CSV
// Example: https://docs.google.com/spreadsheets/d/SHEET_ID/pub?gid=GID&single=true&output=csv
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTunnylJjB9N5UskPvjhZl-PcquYy0IEL6ypHGjNUiluaSu7gsIag_YSufKOVwJV7S4ReYHfxZnv2_o/pub?gid=1129810585&single=true&output=csv';
// Optional: provide additional published CSV URLs to be MERGED into the dataset
const EXTRA_CSV_URLS = [
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTunnylJjB9N5UskPvjhZl-PcquYy0IEL6ypHGjNUiluaSu7gsIag_YSufKOVwJV7S4ReYHfxZnv2_o/pub?gid=329927952&single=true&output=csv'
];
// Optional: hint exact header text for country column as it appears in your Sheet
// e.g. COUNTRY_HEADER_HINT = 'What country?'
const COUNTRY_HEADER_HINT = 'What country?';
// If true, ignore bundled hcpData and use ONLY data coming from the Sheet
const REMOTE_REPLACE_MODE = true;

// Map varying header names to our canonical keys
const HEADER_ALIASES = {
  country: [
    'country', 'ülke',
    'what country?'
  ],
  name: [
    'name', 'provider', "provider's name", 'isim',
    "what is the provider's name?"
  ],
  title: [
    'title', 'specialty title',
    'what is their title?'
  ],
  city: [
    'city', 'şehir',
    'what city are they in?'
  ],
  state: [
    'state', 'region', 'bölge', 'il',
    'what state or region?'
  ],
  hospital: [
    'hospital', 'hospital/university', 'affiliation',
    'what hospital system or university are they affiliated with?'
  ],
  contact: [
    'contact', 'website/phone/email', 'contact info',
    'how can they be contacted? what is their website/phone/email/etc?'
  ],
  info: [
    'info', 'additional information', 'highlights',
    'tell us a bit about them'
  ],
  notes: [
    'notes', 'extra notes',
    'what else can you share about them?'
  ],
  recommender: [
    'recommender', 'referrer', 'referral',
    "if you're willing to be contacted by a fellow looper or have your name used as a referral, please provide your contact information (name, phone number, email)"
  ]
};

function normalizeHeaderToken(token) {
  if (!token) return '';
  // Remove surrounding quotes if present, then trim and lowercase
  const unquoted = token.replace(/^"([\s\S]*)"$/,'$1');
  return unquoted.trim().toLowerCase();
}

// Create a canonical form to match headers robustly: lowercase, strip accents and non-letters
function canonicalizeHeader(token) {
  return (token || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z]/g, ''); // keep only a-z
}

function findHeaderIndex(headers, keys, headersCanonical) {
  for (const key of keys) {
    const canon = canonicalizeHeader(key);
    const idx = headersCanonical.indexOf(canon);
    if (idx !== -1) return idx;
  }
  return -1;
}

// CSV line splitter with quote support (handles commas inside quotes and doubled quotes)
function splitCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        // Check for escaped quote
        if (i + 1 < line.length && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        out.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
  }
  out.push(cur);
  return out;
}

// Build a robust de-duplication key. Prefer contact when available; otherwise use name+title+location+hospital.
function buildDedupKey(name, city, state, hospital, contact, title, country) {
  const norm = (v) => (v || '').toString().trim().toLowerCase();
  const c = norm(country);
  const n = norm(name);
  const ct = norm(contact);
  const t = norm(title);
  const ci = norm(city);
  const st = norm(state);
  const h = norm(hospital);
  if (ct) {
    // If contact matches, also include city/state/hospital to avoid collapsing multi-location entries
    return `${c}::${n}::${ct}::${ci}::${st}::${h}`;
  }
  return `${c}::${n}::${t}::${ci}::${st}::${h}`;
}

// Map incoming country names to canonical list when possible
function mapToCanonicalCountry(name) {
  if (!name || !Array.isArray(window.CANONICAL_COUNTRIES)) return name;
  // exact match
  if (window.CANONICAL_COUNTRIES.includes(name)) return name;
  // simple alias normalization
  const aliases = {
    'Cote d\'Ivoire': "Cote d'Ivoire",
    'Ivory Coast': "Cote d'Ivoire",
    'Korea, South': 'Korea, South',
    'South Korea': 'Korea, South',
    'Korea, North': 'Korea, North',
    'North Korea': 'Korea, North',
    'United States of America': 'United States',
    'USA': 'United States',
    'UK': 'United Kingdom',
    'Türkiye': 'Turkey',
    'UAE': 'United Arab Emirates',
    'Viet Nam': 'Vietnam',
    'Russian Federation': 'Russia',
    'Macedonia (FYROM)': 'Macedonia',
    'Congo (Kinshasa)': 'Congo, Democratic Republic of the',
    'Congo (Brazzaville)': 'Congo, Republic of the'
  };
  if (aliases[name]) return aliases[name];
  // case-insensitive match
  const lower = name.toLowerCase();
  const found = window.CANONICAL_COUNTRIES.find(c => c.toLowerCase() === lower);
  return found || name;
}

async function loadHcpDataFromSheet() {
  if (!ENABLE_REMOTE_DATA || !SHEET_CSV_URL) return;
  let response;
  try {
    response = await fetch(SHEET_CSV_URL, { cache: 'no-store' });
  } catch (err) {
    console.warn('Failed to fetch sheet CSV:', err);
    return;
  }
  if (!response.ok) {
    console.warn('Sheet CSV HTTP error', response.status);
    return;
  }
  const csv = await response.text();
  const lines = csv.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return;

  const rawHeaders = splitCsvLine(lines[0]).map(h => normalizeHeaderToken(h));
  const canonHeaders = rawHeaders.map(h => canonicalizeHeader(h));
  // Debug headers once
  try {
    console.debug('CSV header (raw):', lines[0]);
    console.debug('CSV header tokens:', rawHeaders);
    console.debug('CSV header canonical:', canonHeaders);
  } catch (_) {}

  const indexOf = (canonical) => findHeaderIndex(
    rawHeaders,
    HEADER_ALIASES[canonical] || [canonical],
    canonHeaders
  );

  let idxCountry = indexOf('country');
  // If a hint is provided, try exact match (normalized)
  if (idxCountry === -1 && COUNTRY_HEADER_HINT) {
    const hintCanon = canonicalizeHeader(COUNTRY_HEADER_HINT);
    const posH = canonHeaders.indexOf(hintCanon);
    if (posH !== -1) idxCountry = posH;
  }
  // Fallback: try to find any header containing 'country'
  if (idxCountry === -1) {
    const pos = canonHeaders.findIndex(h => h.includes('country'));
    if (pos !== -1) idxCountry = pos;
  }
  // Additional fallback: search raw headers with regex /country/i
  if (idxCountry === -1) {
    const pos2 = rawHeaders.findIndex(h => /country/i.test(h));
    if (pos2 !== -1) idxCountry = pos2;
  }
  // Last resort: try to match the exact Google form phrasing
  if (idxCountry === -1) {
    const pos3 = rawHeaders.findIndex(h => h.replace(/\s+/g,' ').trim() === 'what country?');
    if (pos3 !== -1) idxCountry = pos3;
  }
  if (idxCountry === -1) {
    console.warn('CSV missing country column.');
    return;
  }

  const remote = {};
  const remoteSeen = new Set();
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    let countryName = (cols[idxCountry] || '').trim();
    countryName = mapToCanonicalCountry(countryName);
    if (!countryName) continue;

    const safe = (idx) => (idx >= 0 ? (cols[idx] || '').trim() : '');
    const idxName = indexOf('name');
    const idxTitle = indexOf('title');
    const idxCity = indexOf('city');
    const idxState = indexOf('state');
    const idxHospital = indexOf('hospital');
    const idxContact = indexOf('contact');
    const idxInfo = indexOf('info');
    const idxNotes = indexOf('notes');
    const idxRecommender = indexOf('recommender');

    const key = buildDedupKey(
      safe(idxName), safe(idxCity), safe(idxState), safe(idxHospital), safe(idxContact), safe(idxTitle), countryName
    );
    if (remoteSeen.has(key)) continue;
    if (!remote[countryName]) remote[countryName] = [];
    remote[countryName].push({
      name: safe(idxName) || 'N/A',
      title: safe(idxTitle) || 'N/A',
      city: safe(idxCity),
      state: safe(idxState),
      hospital: safe(idxHospital),
      contact: safe(idxContact),
      info: safe(idxInfo),
      notes: safe(idxNotes),
      recommender: safe(idxRecommender) || 'N/A'
    });
    remoteSeen.add(key);
  }

  // Merge in additional CSV sources (if any)
  for (const extraUrl of EXTRA_CSV_URLS) {
    if (!extraUrl) continue;
    let extraResp;
    try {
      extraResp = await fetch(extraUrl, { cache: 'no-store' });
      if (!extraResp.ok) continue;
    } catch (_) { continue; }
    const extraCsv = await extraResp.text();
    const extraLines = extraCsv.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (extraLines.length < 2) continue;

    const extraHeaders = splitCsvLine(extraLines[0]).map(h => normalizeHeaderToken(h));
    const extraCanon = extraHeaders.map(h => canonicalizeHeader(h));
    const extraIndexOf = (canonical) => findHeaderIndex(
      extraHeaders,
      HEADER_ALIASES[canonical] || [canonical],
      extraCanon
    );
    let eCountry = extraIndexOf('country');
    if (eCountry === -1 && COUNTRY_HEADER_HINT) {
      const hintCanon = canonicalizeHeader(COUNTRY_HEADER_HINT);
      const posH = extraCanon.indexOf(hintCanon);
      if (posH !== -1) eCountry = posH;
    }
    if (eCountry === -1) {
      const pos = extraCanon.findIndex(h => h.includes('country'));
      if (pos !== -1) eCountry = pos;
    }
    if (eCountry === -1) {
      const pos2 = extraHeaders.findIndex(h => /country/i.test(h));
      if (pos2 !== -1) eCountry = pos2;
    }
    if (eCountry === -1) {
      const pos3 = extraHeaders.findIndex(h => h.replace(/\s+/g,' ').trim() === 'what country?');
      if (pos3 !== -1) eCountry = pos3;
    }
    if (eCountry === -1) continue;

    const eName = extraIndexOf('name');
    const eTitle = extraIndexOf('title');
    const eCity = extraIndexOf('city');
    const eState = extraIndexOf('state');
    const eHospital = extraIndexOf('hospital');
    const eContact = extraIndexOf('contact');
    const eInfo = extraIndexOf('info');
    const eNotes = extraIndexOf('notes');
    const eRec = extraIndexOf('recommender');
    const esafe = (row, idx) => (idx >= 0 ? (row[idx] || '').trim() : '');

    for (let i = 1; i < extraLines.length; i++) {
      const cols = splitCsvLine(extraLines[i]);
      let c = (cols[eCountry] || '').trim();
      c = mapToCanonicalCountry(c);
      if (!c) continue;
      const key = buildDedupKey(
        esafe(cols, eName), esafe(cols, eCity), esafe(cols, eState), esafe(cols, eHospital), esafe(cols, eContact), esafe(cols, eTitle), c
      );
      if (remoteSeen.has(key)) continue;
      if (!remote[c]) remote[c] = [];
      remote[c].push({
        name: esafe(cols, eName) || 'N/A',
        title: esafe(cols, eTitle) || 'N/A',
        city: esafe(cols, eCity),
        state: esafe(cols, eState),
        hospital: esafe(cols, eHospital),
        contact: esafe(cols, eContact),
        info: esafe(cols, eInfo),
        notes: esafe(cols, eNotes),
        recommender: esafe(cols, eRec) || 'N/A'
      });
      remoteSeen.add(key);
    }
  }

  // Fold any non-canonical country keys into their canonical counterparts
  const folded = {};
  Object.keys(remote).forEach((k) => {
    const canon = mapToCanonicalCountry(k);
    if (!folded[canon]) folded[canon] = [];
    folded[canon].push(...(remote[k] || []));
  });

  if (REMOTE_REPLACE_MODE) {
    // Replace entirely with remote data
    Object.keys(hcpData).forEach(k => { delete hcpData[k]; });
    // Initialize all canonical countries to ensure map iteration finds all
    if (Array.isArray(window.CANONICAL_COUNTRIES)) {
      window.CANONICAL_COUNTRIES.forEach(c => { if (!folded[c]) folded[c] = []; });
    }
    Object.keys(folded).forEach(country => {
      hcpData[country] = folded[country];
    });
  } else {
    // Merge remote data with existing hcpData (avoid duplicates by country+name+city+hospital)
    Object.keys(folded).forEach(country => {
      const existing = Array.isArray(hcpData[country]) ? hcpData[country] : [];
      const incoming = folded[country] || [];
      const seen = new Set(
        existing.map(x => buildDedupKey(x.name,x.city,x.state,x.hospital,x.contact,x.title,country))
      );
      const merged = existing.slice();
      incoming.forEach(x => {
        const key = buildDedupKey(x.name,x.city,x.state,x.hospital,x.contact,x.title,country);
        if (!seen.has(key)) {
          merged.push(x);
          seen.add(key);
        }
      });
      hcpData[country] = merged;
    });
  }

  // Notify listeners that remote data has been loaded and hcpData is updated
  try {
    const event = new CustomEvent('hcpDataLoaded', { detail: { source: 'sheet', count: Object.keys(hcpData).length } });
    window.dispatchEvent ? window.dispatchEvent(event) : document.dispatchEvent(event);
  } catch (e) {
    // no-op if CustomEvent is not available
  }
}

/* eslint-enable no-unused-vars */