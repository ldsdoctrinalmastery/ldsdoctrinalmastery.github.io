# Background images

The pages look for these files. If they're missing, the page falls back to a clean dawn-sky gradient.

| File | Used by |
|---|---|
| `hero-landing.webp` | `/index.html` |
| `hero-crossing.webp` | `/crossroads/index.html` |

## Comic popups (lesson page)

The crossroads page has two hidden comic-relief popups triggered by tiny footnote markers (¹ ²) in the text. Drop the comic images here as:

| File | Triggered by |
|---|---|
| `comics/comic-halo.webp` | "¹" footnote in the quiz intro |
| `comics/comic-family.webp` | "²" footnote in the My Tech Audit lead |

If a comic file is missing, the popup still opens but shows a broken image — keep both files present or remove the corresponding `.footnote-mark` button from the lesson HTML.

## Easiest way to drop them in

1. Save the JPG/PNG locally
2. Convert + resize to webp on your machine. One-liner with ImageMagick: `magick input.jpg -resize 1920x -quality 80 hero-landing.webp` — or use https://squoosh.app in a browser
3. Drop the resulting `.webp` into this `assets/` folder (or `assets/comics/`) and commit

## Suggested matches (Hasui prints, public domain)

- **Landing page** (`hero-landing.webp`): atmospheric coastal/twilight — *Pine Islands at Matsushima* (the boat-with-pink-clouds print) or *Tsuki no Matsushima*
- **Crossroads page** (`hero-crossing.webp`): forest path — *Nikkō Kaidō* / *An Avenue at Nikkō* (1930)

Both are on Wikimedia Commons. Target ~1600–1920px wide, ≤400 KB. Compose so the upper portion of the image has the visual focus — the content column lays on top starting near the top.
