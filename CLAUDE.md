# גיבורי העיר (City Heroes)

Liora's side project (started 2026-11-09): a learning game for **Bar and Yarden, two boys
aged 5**. Goal: practice letters, numbers, basic reading, basic writing and basic math.
Liora is a beginner with no programming experience: explain simply, in Hebrew.

## How it works
- Plain HTML/CSS/JS, no build, no install: double-click `index.html` (works from file://).
  Scripts are plain globals (no ES modules, they fail on file://). Desktop shortcut
  "גיבורי העיר" opens it in Edge with `icon.ico` (rendered from `icon.svg`).
- The game **speaks** (browser speechSynthesis, he-IL), because the kids can't read
  instructions. Speech text uses niqqud; on-screen text doesn't. This PC has
  "Microsoft Asaf" (Windows Hebrew voice); Edge also has natural online voices (preferred).
- Kids are boys: speech uses masculine singular ("מצא", "בחר").
- Heroes (2026-11-09, Liora's names): **בר איש האש** (red suit, flame emblem, fireball, flames behind him) and **ירדן איש הברק** (blue suit, lightning emblem and bolts). Set by `power` in `HEROES` (`js/data.js`); drawn in `js/art.js` with gradients.
- Flow: choose hero (separate progress in
  localStorage `city-heroes-v1`) → illustrated city map (`js/map.js`): the hero token walks
  along the road to the place clicked → mission intro (hero vs villain) → 5 challenges →
  reward → hero base.
- **Look (2026-11-09, Liora asked for "Marvel-style"):** an *original* comic-book superhero
  style (thick black outlines, hard shadows, halftone dots, "בּוּם!" bursts, Karantina
  display font + Rubik). No Marvel characters, names or logos. Villain: **ד״ר בלגן**
  (Dr. Balagan, original), who messes up each place.
- **21 worlds** (2026-11-09, Liora asked for at least 20, each with real content and design): `ZONES` in `js/data.js` (story, storyText, teaches = shown in the parents corner), tasks in `ZONE_CHALLENGES` (`js/challenges.js` for the first 9 worlds, `js/challenges2.js` for the 12 newer ones: circus balloons, bakery candles/ten-frame, treasure number grid/number line, under-the-sea same-word/color words, music drum syllables, lab patterns/odd one out/sorting, forest connect-the-dots letters, fire station house numbers/ladder, stadium scores, dragon memory game, color studio color-by-number/letter, ice palace before/after, dominoes, number bonds). 52 task types. Bosses: robot, dragon, villain.
- Map (`js/map.js`): tall scrolling map (1600×2640), 4 places per row snaking up from "התחלה" at the bottom to the fortress at the top; positions come from the order of `ZONES`. Place drawings in `PLACE_ART`. The hero token walks the road and the page scrolls with it.
- Level per place = 1 + missions done there / 3 (max 3).
- Mistakes are never punished; after 2 wrong tries the answer glows. Stars: ≤1 mistake 3★.
- Rewards cycle: 2 base parts, then a superpower (drawn on the hero), then medals.
- Typing uses key *positions* (e.code) mapped to the Hebrew layout.
- Tracing: canvas mask of the letter (Arial bold); pass at ≥62% covered, reset if >40%
  of the ink is outside.
- Words with syllable count `s` (0 = skip; words ending in patach ganuv are skipped).
- Math is shown left-to-right. Numbers use Rubik (Karantina digits are hard to read).
- **Published 2026-11-09** (Liora approved a public repo, names Bar/Yarden kept): https://github.com/Alma-ai-hub/city-heroes, live at https://alma-ai-hub.github.io/city-heroes/ (GitHub Pages from `main`, root). Pushing to `main` updates the site in ~1 min. `gh` is at `C:\Program Files\GitHub CLI\gh.exe`. Commits use the GitHub noreply email (repo-local git config). Progress is per device/browser (localStorage). Commit and push after each working step.
