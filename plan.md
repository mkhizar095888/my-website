# VarenzoX — implementation plan

## Product scope
A responsive, one-page marketing agency site for VarenzoX. The page presents AI automation, Meta Ads, Google Ads, web development, social media handling, and AI services; builds trust with an agency overview, benefits, process, work samples, and a lead-generation form; and uses the supplied VarenzoX growth graphic as a visual reference and proof asset.

## Design direction
- **Design movement:** monochrome editorial brutalism softened with a premium digital-studio finish.
- **Core principles:** 1) high contrast and decisive type, 2) information revealed through motion, 3) proof over promises, 4) precise details with generous negative space.
- **Color philosophy:** near-black is the canvas, off-white is the voice, graphite is the structure, and a restrained signal-green accent marks action and momentum. The page stays fundamentally black and white while preserving the energy of the supplied reference.
- **Layout paradigm:** an asymmetric, full-bleed narrative rather than centered card grids. Sections alternate between offset copy blocks, diagonal rules, and horizontal proof bands.
- **Signature elements:** oversized outlined numerals, a thin animated signal-line motif, and pill-shaped “live” labels for momentum.
- **Interaction philosophy:** every interaction should clarify a choice or reveal depth. Service cards expand into outcomes; work filters narrow proof; the contact form provides immediate feedback.
- **Animation:** short, ease-out reveals on scroll; soft 3D lift on cards; a slow moving radial grid in the hero; no looping motion that competes with reading. Respect `prefers-reduced-motion`.
- **Typography system:** Space Grotesk for display and body, IBM Plex Mono for metadata, labels, and numerical proof. Display type is tight, sentence case, with italic emphasis reserved for a few words.
- **Brand essence:** a growth systems studio for ambitious teams who want marketing, technology, and automation working as one. Personality: exacting, kinetic, direct.
- **Brand voice:** confident, concise, specific. Example lines: “Make growth compound.” / “Less busywork. More signal.”
- **Wordmark & logo:** a custom V mark with a bright crossbar, paired with a compact VarenzoX wordmark. The V implies forward motion, while the crossbar gives the mark a distinct digital signature.
- **Signature brand color:** Signal Green `#c9ff5a`, used only for action states, active indicators, and one or two proof highlights.

## Implementation approach
- Use a lightweight Node static server on port 3000 for the managed preview.
- Keep the site dependency-light: semantic HTML, CSS custom properties, and vanilla JavaScript for interactions.
- Implement all requested sections in `index.html`, with responsive styles in `styles.css` and behavior in `script.js`.
- Reuse the supplied growth graphic from project storage in the work/proof section, rendered in grayscale with a framed overlay so it supports the black-and-white system.
- Include `public/manus-routes.json` with the single `/` route.
- Add client-side inquiry validation and a success state without pretending to send a backend request.

## Project structure
- `index.html` — page structure, copy, SEO metadata, inline icon system.
- `styles.css` — tokens, responsive layout, motion, accessibility, and component styling.
- `script.js` — navigation, reveal observer, service accordion, work filters, counters, form state, and cursor/hover affordances.
- `server.mjs` — small static HTTP server honoring `PORT` and serving `public/` assets.
- `public/manus-routes.json` — route manifest required by Webdev.
- `app.config.ts` — project branding metadata.
- `TODO.md` — implementation outcomes and acceptance clauses.
