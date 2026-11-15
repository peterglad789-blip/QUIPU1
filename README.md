# QUIPU: Interplanetary Survival Guide, Martian Map

NASA Space Apps Challenge 2026, team Kervin Espaze Program (Sebastián Palacios, Maximiliano Rutiaga, Petr Gladskiy).

QUIPU is a tablet-first decision-support tool for a crewed Marswalk at Jezero crater. Its central question: **can the astronaut get back safely?**

Live: https://peterglad789-blip.github.io/QUIPU1/

**Explore further. Discover more. Always make it back.**

## Survival system (Marswalk side panel)
- **Envelope:** an irregular boundary of every place the astronaut can reach *and walk back from* with the oxygen, battery and suit time available, keeping the reserve. Two Dijkstra searches over an 11 km × 11 km terrain grid (25 m cells): out from the start, and back to the chosen return point at a conservative speed. Slopes above the limit, hazard markers and missing terrain data shape the edge. Zones: safe, caution (thin margin), caution (terrain not measured), restricted. Tap any spot for the round-trip breakdown.
- **Simulate:** battery loss, extra O₂ use, slower walking, extra sampling, delays, radiation ×2–×10, relay loss and a blocked route segment. Every scenario reruns the plan check, the route, the envelope and the science options, then compares them with the planned mission and suggests actions. Reset never touches mission settings.
- **Science:** builds multi-stop expeditions (safety-first and science-optimised) on the same terrain costs and limits. Points follow a published table; preferences rank options but can never relax the reserve.
- **Offline mission mode (Comms):** everything is computed on the tablet; markers, notes, plan, settings and the last envelope are saved locally, with mission-file export/import and optional sync through the Worker.

## Sections
1. **Marswalk** (home): full-screen Jezero map, click-to-inspect, 10 draggable marker types, astronaut position, A* route planner on a 10 m terrain grid, round-trip survival analysis (GO / CAUTION / NO-GO from configurable limits), turnaround point, route comparison with science score, what-if scenarios, emergency return, mission timeline, field notebook, 30 s walk preview, first-person helmet view.
2. **Mars globe**: 3D globe with click-anywhere inspection (MOLA elevation, pressure model, sun, season), water-ice evidence, 7 Arsia Mons cave candidates, landing sites, rover traverses, orbiters.
3. **Sky over Jezero**: 3D sky with the Sun, Earth, Phobos and Deimos (JPL Horizons inside the snapshot window, model outside), follows the walk clock.
4. **Comms**: signal delay, relay availability and data freshness shown as separate things; DSN Now; offline sync queue.
5. **Solar system**: to-scale orbits from JPL elements, Earth–Mars light time, solar eruptions (DONKI).
6. **Readiness**: environment cards with data labels, suit and crew settings, checklist, mobility model (Pandolf, fixed leg force), 3D regolith habitat builder, acoustics.

**Yarbis**, the assistant (lower right), works offline from the app's own calculations. It can connect to an AI model through a server you deploy: see `server/README.md`. No API key is ever stored in the page.

## Files
- `index.html`: the whole app
- `sw.js`: offline cache (must sit next to `index.html`)
- `server/`: optional Cloudflare Worker for Yarbis AI mode

## Known limits
- Elevations exist only within about 150 m of Perseverance's waypoints. Elsewhere QUIPU has no terrain data, walks it at 85% speed and never calls it safe. A HiRISE DTM would make the envelope much sharper.
- O₂ uses the Pandolf load-carriage model scaled to Mars gravity; battery assumes a constant suit draw. Both are estimates.
- Sync needs the optional Cloudflare Worker with a KV namespace; without it data stays on each tablet.

## Data honesty
Every value is labelled measured, calculated, estimate, simulation, snapshot or not available. Terrain without rover data is never called safe. This is a demonstration, not a certified flight system.
