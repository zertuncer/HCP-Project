## HCP Directory – Map, List & Google Sheets Integration (EN)

### Summary
This project displays healthcare providers (HCP) by country on an interactive world map, with a searchable list and a full table view. Data is fetched from Google Sheets, with smart header aliasing/normalization and merging across sources. A canonical country list is used to ensure consistent map coloring and interactions.

---

## Features
- Clickable SVG world map with country coloring
- Searchable country list with green-border highlight for matches
- `table.html` full data table with client-side search
- Google Sheets integration via “Publish to web” (CSV) and multi-source merge
- Flexible header aliasing and normalization
- Canonical country names (e.g., “USA” → “United States”) for reliable mapping
- Robust deduplication to avoid accidental merges
- Event-driven updates: UI initializes after data loads

---

## Architecture & Data Flow
1) Google Sheets → CSV (Publish to web). Multiple CSVs can be merged.
2) `js/hcp-data.js` fetches CSVs, maps headers via aliases, normalizes rows, canonicalizes country names, and aggregates.
3) Deduplication removes duplicates (contact-first strategy).
4) `hcpDataLoaded` is dispatched. The map (`js/hcp-map.js`), page (`js/hcp-page.js`), and table (`js/table-page.js`) initialize/refresh on this event.

---

## Google Sheets Setup
- In your Sheet, use “File → Share → Publish to web → CSV” to get a public CSV URL.
- Header names can vary; the system maps them using aliases (e.g., “Provider’s Name”, “Full Name”, “Name” → `name`).
- It’s recommended to make Country a controlled/select field. If your current form doesn’t enforce country selection, inconsistencies may appear; we created a separate test form and solved header mismatches with a pivot/normalization approach.
- To merge additional sources, append their CSV URLs to `EXTRA_CSV_URLS`.

---

## Header / Pivot Normalization
Since column names and orders may differ across forms/tabs, we created a “Normalized/Pivot” sheet that outputs a single table with unified headers (e.g., `country, name, title, city, state, hospital, phone, email, website`). The published CSV then points to this normalized tab.

Recommended steps:
1. Create a new tab: “Normalized”
2. Fix the first row to target headers: `country, name, title, city, state, hospital, phone, email, website`
3. Bring data from source tabs using one of:
   - Pivot/QUERY mapping: Map each source column to the target headers and merge them.
   - ARRAYFORMULA-based copy: Normalize values column by column.
   - (Advanced) Apps Script ETL: Implement header mapping and validation in script.
4. In “File → Share → Publish to web → CSV”, publish the Normalized tab and set its URL as `SHEET_CSV_URL`.

Notes:
- The code already includes alias-based header matching, but a normalized pivot tab provides a deterministic layer against real-world header/name/order differences.
- Make the Country field controlled/required where possible; free-text entries can reduce match quality.

### Published CSV Sources
- Main table: `gid=1129810585` CSV
  - https://docs.google.com/spreadsheets/d/e/2PACX-1vTunnylJjB9N5UskPvjhZl-PcquYy0IEL6ypHGjNUiluaSu7gsIag_YSufKOVwJV7S4ReYHfxZnv2_o/pub?gid=1129810585&single=true&output=csv
- Form responses (Live): `gid=485084067` CSV
  - https://docs.google.com/spreadsheets/d/e/2PACX-1vTunnylJjB9N5UskPvjhZl-PcquYy0IEL6ypHGjNUiluaSu7gsIag_YSufKOVwJV7S4ReYHfxZnv2_o/pub?gid=485084067&single=true&output=csv
- Pivot/Normalized (Recommended `SHEET_CSV_URL`): `gid=329927952` CSV
  - https://docs.google.com/spreadsheets/d/e/2PACX-1vTunnylJjB9N5UskPvjhZl-PcquYy0IEL6ypHGjNUiluaSu7gsIag_YSufKOVwJV7S4ReYHfxZnv2_o/pub?gid=329927952&single=true&output=csv

---

## Configuration
- Location: `js/hcp-data.js`
- Main flags:
  - `ENABLE_REMOTE_DATA`: toggle remote data fetching
  - `SHEET_CSV_URL`: main CSV (Publish to web)
  - `EXTRA_CSV_URLS`: additional CSVs (optional)
  - `REMOTE_REPLACE_MODE`: when true, only remote data is used

Example:
```javascript
// js/hcp-data.js
const ENABLE_REMOTE_DATA = true;
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/.../pub?output=csv';
const EXTRA_CSV_URLS = [];
const REMOTE_REPLACE_MODE = true;
```

---

## Canonical Country List
- File: `js/countries.js`
- The map, list, and data rely on these canonical names (e.g., “Türkiye” → “Turkey”, “USA” → “United States”).

---

## Deduplication Logic
If contact exists:
`country::name::contact::city::state::hospital`

Otherwise:
`country::name::title::city::state::hospital`

This avoids collapsing multi-location entries while removing true duplicates.

---

## Map & Interactions
- File: `js/hcp-map.js`
- After data loads, countries are colored, and hover/click handlers are attached.
- Finding country elements uses multiple selectors and ISO-ID mappings for robustness.

---

## Search & Highlight
- Matching countries get a green border and glow animation (`.country-highlight`).
- The list and map are synchronized.

---

## Table View
- Files: `table.html` and `js/table-page.js`
- Renders all rows with client-side search.

---

## Integration Options
- Map + list only: We can provide just these components for you to wire into your system.
- Use our current flow: Currently there’s no moderation; all form submissions appear immediately. We can add admin/moderation.
- Your moderation endpoints: Provide REST/GraphQL endpoints; we’ll adapt the data flow accordingly.

### Engagement/Integration Choice
- Grant me access so I can configure and maintain the flow.
- Connect this system to your existing platforms and endpoints.
- Use this system as-is.

Note: The system currently ingests data directly from the published Google Form/Sheet and has no admin/moderation layer. If you prefer moderation, I can add it (e.g., an approval column in the Sheet, an admin UI, or integration with your approve/reject endpoints).

---

## Known Conflict/Risk Scenarios and Mitigations
- Country as free text: Variants like "USA/US/United States" can break coloring/filtering.
  - Mitigation: Canonical country list with aliases/ISO-2 mapping; make Country a required select field.
- Header/order differences: Mapping issues during integration.
  - Mitigation: Create a Pivot/Normalized tab and publish it as `SHEET_CSV_URL`; code-side aliasing remains in place.
- Duplicate/colliding entries: Same person across multiple locations/contacts may be merged or duplicated.
  - Mitigation: Contact-first dedup key; prefer unique contact or add a unique ID. We can tune rules per project.
- Timing: Late data can make the map appear uncolored initially.
  - Mitigation: Re-init via `hcpDataLoaded` (already wired in the flow).
- SVG-country name mismatch: Map class names vs data country names may differ.
  - Mitigation: Alias canonicalization and ISO-ID fallbacks; add custom alias as needed.
- No moderation: All submissions appear immediately.
  - Mitigation: Add approval column in Sheet, an admin UI, or external approve/reject API.
- Privacy: Public CSV; sensitive data risk.
  - Mitigation: Exclude sensitive info or switch to authenticated endpoints.

---

## Deployment
- Static hosting via GitHub Pages / Netlify / Vercel.
- Once `SHEET_CSV_URL` and flags are set, the client fetches data automatically.

---

## Troubleshooting
- "CSV missing country column": Expand header aliases or standardize Sheet headers. Prefer Publish-to-web CSV.
- "Map is uncolored": Ensure `hcpDataLoaded` is handled; verify `ENABLE_REMOTE_DATA` and `SHEET_CSV_URL`.
- "No hover/click name": Add alias for the problematic country to canonicalization/ID mapping.
- "Counts mismatch": Check dedup keys and multi-location duplicates in sources.

---

## Security & Privacy
- Data is loaded client-side from public CSV; do not include sensitive data.
- If moderation is added, auth/authorization follows your policies.

---

## Contributing & Support
- PRs for aliases, country mappings, and fixes are welcome.
- Share your integration/moderation requirements; we can configure and deliver accordingly.


