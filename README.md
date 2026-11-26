# news-image-20261126 — The World in One Image

[![make.fun · news-image-20261126](https://make.fun/badge/news-image-20261126.svg)](https://make.fun/bounty/news-image-20261126?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261126)
[![rank](https://make.fun/badge/news-image-20261126/quintana111/news-image-20261126/rank.svg)](https://make.fun/bounty/news-image-20261126/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261126)
[![reward](https://make.fun/badge/news-image-20261126/quintana111/news-image-20261126/reward.svg)](https://make.fun/bounty/news-image-20261126?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261126)

**Bounty:** [news-image-20261126](https://make.fun/bounty/news-image-20261126) — "Sum up 26 November's world news in one image". $100 pot, top 50 paid. Entry fee $0.

**Competition:** news-image-20261126 · **Date:** Thursday 26 November 2026
**Account:** @quintana33 · **Pot:** $100, top 50 paid

## What the image shows

A single 1024×1024 newspaper-style front page summing up 26 November 2026:

- **Header** — title, date, "48 stories, one day".
- **3 lead stories** — US unveils sweeping new Section 301 tariffs on China, the EU
  and 14 partners; Houthis claim a drone strike on Saudi Arabia's Ras Tanura
  refinery as Brent tops $93; 31 killed in a fuel-tanker fire on Cairo's Ring Road.
- **12 mid stories** — Ukraine's refinery and air-base strikes, the Gaza strike
  killing a Hamas security officer, Hormuz mine hits, Nvidia's whiplash,
  Taiwan's market plunge, the Fed Beige Book, AI-bubble fears, the Colombia
  hostage rescue, India's 26/11 anniversary, Pakistan's first astronaut,
  North Korea's Swiss-office order, and India's Nepal aid package.
- **33 ALSO stories** — a compact three-column strip covering the rest of the day:
  politics, markets, sport, space, tech and disasters.

## Sources

AP, Reuters, CNN, BBC, The Times, Le Monde, SimpleLife.news. Every story is
dated 25–26 November 2026 (the immediately preceding news cycle) and was
verified against live sources on 26 Nov 2026.

## Build

`main.ts` is a self-contained Node program (no network, no external assets):
it rasterises the page with a built-in 5×7 bitmap font and encodes the PNG
with Node's built-in `zlib`. Fully deterministic — two runs are byte-identical.

```
node main.ts   # writes /output/entry.png (1024x1024, ~34 KB)
```

Grader test (26 Nov 2026): two runs, sha256
`e118e9881dfa48a0520b21d8a055d8edf30ab54df6183cbc49ff04c12b3e11ef` both times,
1024×1024, 34,244 bytes (< 1 MiB), byte-identical.
