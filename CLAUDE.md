# גיבורי העיר (City Heroes)

Liora's side project (started 2026-11-09): a learning game for **Bar and Yarden, two boys
aged 5**. Goal: practice letters, numbers, basic reading, basic writing and basic math.
Liora is a beginner with no programming experience: explain simply, in Hebrew.

## How it works
- Plain HTML/CSS/JS, no build, no install: double-click `index.html` (works from file://).
  Scripts are plain globals (no ES modules, they fail on file://).
- The game **speaks** (browser speechSynthesis, he-IL), because the kids can't read
  instructions. Speech text uses niqqud; on-screen text doesn't. This PC has
  "Microsoft Asaf" (Windows Hebrew voice); Edge also has natural online voices (preferred).
- Kids are boys: speech uses masculine singular ("מצא", "בחר").
- Flow: choose hero (Bar / Yarden, separate progress in localStorage `city-heroes-v1`)
  → city map with 4 zones → mission of 5 challenges → reward → hero base.
- Zones and challenge types (`ZONE_CHALLENGES` in `js/challenges.js`):
  letters (find letter by name, first sound, missing letter), reading (read word → pick
  picture, picture → pick word), writing (build from tiles, type on keyboard, trace with
  mouse), numbers (count, sequence, + / − within 10; robot falls asleep).
- Level per zone = 1 + missions done there / 3 (max 3).
- Mistakes are never punished; after 2 wrong tries the answer glows. Stars: ≤1 mistake 3★.
- Rewards cycle: 2 base parts, then a superpower (drawn on the hero), then medals.
- Typing uses key *positions* (e.code) mapped to the Hebrew layout, so it works even when
  Windows is on English.
- Tracing: canvas mask of the letter (Arial bold); pass at ≥62% covered, reset if >40%
  of the ink is outside.
- Math is shown left-to-right (equations and sequences).
- Pictures are emoji; heroes, base and robot are original SVG (`js/art.js`).
- Git repo is local only (not published). Commit after each working step.
