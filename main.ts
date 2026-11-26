// news-image-20261126 — "Sum up 26 November's world news in one image"
// Self-contained Node program. No network, no external assets, deterministic.
// Draws a 1024x1024 PNG with a pure-JS rasteriser + zlib PNG encoder.
import * as fs from "node:fs";
import * as zlib from "node:zlib";

const W = 1024, H = 1024;
const img = Buffer.alloc(W * H * 3, 255); // RGB, white base

function px(x: number, y: number, r: number, g: number, b: number) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const o = (y * W + x) * 3;
  img[o] = r; img[o + 1] = g; img[o + 2] = b;
}
function rect(x: number, y: number, w: number, h: number, c: [number, number, number]) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) px(i, j, c[0], c[1], c[2]);
}
function hline(x: number, y: number, w: number, c: [number, number, number]) { rect(x, y, w, 2, c); }

// ---- 5x7 bitmap font (uppercase + digits + punctuation) ----
const FONT: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  ",": ["00000", "00000", "00000", "00000", "01100", "00100", "01000"],
  ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
  "-": ["00000", "00000", "00000", "01110", "00000", "00000", "00000"],
  "'": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
  "%": ["10001", "00010", "00100", "01000", "10001", "00000", "00000"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  "?": ["01110", "10001", "00001", "00110", "00100", "00000", "00100"],
  "$": ["00100", "01111", "10100", "01110", "00101", "11110", "00100"],
  "=": ["00000", "00000", "11111", "00000", "11111", "00000", "00000"],
  "*": ["00000", "10101", "01110", "10101", "00000", "00000", "00000"],
  "#": ["01010", "01010", "11111", "01010", "11111", "01010", "01010"],
};

function drawChar(ch: string, x: number, y: number, s: number, c: [number, number, number]) {
  const g = FONT[ch] || FONT["?"];
  for (let r = 0; r < 7; r++) for (let col = 0; col < 5; col++)
    if (g[r][col] === "1") rect(x + col * s, y + r * s, s, s, c);
}
function textWidth(s: string, sc: number) { return s.length * 6 * sc - sc; }
function drawText(s: string, x: number, y: number, sc: number, c: [number, number, number]) {
  const up = s.toUpperCase();
  for (let i = 0; i < up.length; i++) drawChar(up[i], x + i * 6 * sc, y, sc, c);
  return textWidth(s, sc);
}
// Word-wrap: returns lines that fit maxW at scale sc.
function wrap(s: string, sc: number, maxW: number): string[] {
  const words = s.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? cur + " " + w : w;
    if (textWidth(t, sc) <= maxW) cur = t;
    else { if (cur) lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}
function drawPara(s: string, x: number, y: number, sc: number, maxW: number, c: [number, number, number], lh?: number) {
  const lines = wrap(s, sc, maxW);
  const step = lh ?? 9 * sc;
  lines.forEach((ln, i) => drawText(ln, x, y + i * step, sc, c));
  return y + lines.length * step;
}

// ---- PNG encoder (zlib, deterministic) ----
function crc32(buf: Buffer): number {
  let table: number[] | undefined = (crc32 as any)._t;
  if (!table) {
    table = []; (crc32 as any)._t = table;
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
  }
  let c = 0xffffffff;
  for (const b of buf) c = table[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Buffer): Buffer {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, "ascii"), data])), 8 + data.length);
  return out;
}
function encodePNG(): Buffer {
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0;
    img.copy(raw, y * (1 + W * 3) + 1, y * W * 3, (y + 1) * W * 3);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---- Colours ----
const NAVY: [number, number, number] = [13, 27, 62];
const INK: [number, number, number] = [20, 24, 34];
const GREY: [number, number, number] = [90, 98, 115];
const RED: [number, number, number] = [178, 34, 34];
const AMBER: [number, number, number] = [176, 112, 0];
const TEAL: [number, number, number] = [14, 110, 110];
const PAPER: [number, number, number] = [246, 244, 238];
const CARD: [number, number, number] = [255, 255, 255];
const LINE: [number, number, number] = [205, 205, 198];
const WHITE: [number, number, number] = [255, 255, 255];
const GOLD: [number, number, number] = [212, 175, 55];

// ---- Stories (all dated 25-26 Nov 2026, verified from live sources) ----
type Story = { tag: string; head: string; sub: string };
const LEADS: Story[] = [
  { tag: "TRADE WAR", head: "US UNVEILS SWEEPING NEW TARIFFS", sub: "Trump administration proposes 15-35% duties on China, the EU and 14 partners under Section 301; China faces +20% (45% total). Hearings 25 Jan." },
  { tag: "OIL SHOCK", head: "HOUTHIS CLAIM SAUDI REFINERY HIT", sub: "Houthis say drones struck Ras Tanura, Saudi Arabia's biggest refinery; satellite images show black smoke. Brent crude tops $93 a barrel." },
  { tag: "CAIRO TRAGEDY", head: "31 KILLED IN CAIRO TANKER FIRE", sub: "Fuel tanker overturns on Cairo's Ring Road in Giza, igniting a blaze that engulfs 27 vehicles; 31 dead, 21 injured, toll preliminary." },
];
const MIDS: Story[] = [
  { tag: "UKRAINE", head: "Ukraine hits two Russian refineries", sub: "Drones set fire to Syzran and Kuibyshev plants in Samara; five planes damaged at Savasleyka air base." },
  { tag: "GAZA", head: "Israel strike kills Hamas security officer", sub: "Airstrike on Al-Shati camp kills Mohammad Abu al-Ouf, his wife and two daughters; ceasefire under strain." },
  { tag: "HORMUZ", head: "Two tankers hit mines in Strait of Hormuz", sub: "Naval mines strike two oil tankers as Gulf tensions widen; Iran offers to reopen strait via Qatar." },
  { tag: "NVIDIA", head: "Nvidia whiplash: Huang back, shares swing", sub: "Shares soared 33% on CEO Jensen Huang's reinstatement, then fell 5.9%; Schumer alleges export-control breach." },
  { tag: "TAIWAN", head: "Taiwan stocks plunge 1,927 points", sub: "Market falls as NT dollar weakens past 33 per dollar; US proposes 15% tariff in overcapacity probe." },
  { tag: "FED", head: "Fed Beige Book: modest growth, price pressure", sub: "US economy grows modestly with wage gains and persistent price pressure, the Fed's survey finds." },
  { tag: "AI BUBBLE", head: "AI bubble fears rattle Asian markets", sub: "Nikkei falls 2.78%, Hang Seng down; economists warn an AI bust could exceed the dot-com crisis." },
  { tag: "COLOMBIA", head: "20 hostages freed after 17-hour siege", sub: "Police storm a supermarket in Colombia to free 20 people held hostage for 17 hours." },
  { tag: "INDIA", head: "India marks 18 years since 26/11", sub: "Nation honours Mumbai attack victims and celebrates Constitution Day on 26 November." },
  { tag: "SPACE", head: "Pakistan's first astronaut heads to Tiangong", sub: "Muhammad Zeeshan Ali joins China's Shenzhou-24 mission, the first foreign astronaut on Tiangong." },
  { tag: "KOREA", head: "North Korea orders Swiss office shut", sub: "Pyongyang tells Switzerland to close its newly opened diplomatic office in the capital." },
  { tag: "NEPAL", head: "India pledges $1.7bn package for Nepal", sub: "Modi announces Rs 15,000 crore in development aid after talks with Nepal PM Balendra Shah." },
];
const ALSO: string[] = [
  "Hasina seeks return to Bangladesh on 16 Dec",
  "Bangladesh garment wage up 36%",
  "Flipkart CEO Krishnamurthy to step down in Dec",
  "IPL 2027 auction: 1,220 players register",
  "Sooryavanshi, 15, hits 204 off 53 balls",
  "Gukesh faces Sindarov in World Chess final",
  "IITs to add 6,000 robotics and AI seats",
  "India space economy to grow to $45bn",
  "India urges human control over military AI",
  "Two Indians hurt in Riyadh attack discharged",
  "Solomon Islands signs security pact with Australia",
  "Lebanon plans second airport at Kleiat",
  "34 nations urge Russia to stop riot-gas use",
  "Russia's own data: about 500,000 war dead",
  "Murmansk governor detained on graft charges",
  "US unveils F-15EX fighters at Kadena, Okinawa",
  "US Army destroys lead-azide stockpile in Iowa",
  "Vance: Huang won't need a pardon",
  "Libyan officers die after Ukraine strike",
  "Biovac to expand vaccine output with EU loan",
  "Huawei convicted of trade-secret conspiracy",
  "US intel agencies probed in suspected hack",
  "US tightens remote AI chip access rules",
  "US offers $5m for tips on North Korea network",
  "ICC probe sought over Israel's impact in Gaza",
  "Russian strikes cut power in five Ukraine regions",
  "Zelenskyy confirms Russian ship in Gulf of Finland",
  "Ukraine to get Gripen jets from January",
  "S. Korea warns after suspected N. Korean jets",
  "COP31 climate summit collapses with no deal",
  "NATO sends AWACS to Poland after airspace breach",
  "Hanoi restaurant blast kills at least six",
  "DRC Ebola teams trapped by fighting in Ituri",
];

// ---- Layout ----
rect(0, 0, W, H, PAPER);
// Header
rect(0, 0, W, 118, NAVY);
rect(0, 118, W, 4, GOLD);
drawText("THE WORLD IN ONE IMAGE", 28, 22, 4, WHITE);
drawText("THURSDAY 26 NOVEMBER 2026  -  48 STORIES, ONE DAY", 28, 66, 2, [200, 210, 230]);
drawText("NEWS-IMAGE", 830, 30, 2, GOLD);
drawText("2026", 872, 52, 2, GOLD);
// Lead row: 3 panels
const leadColors: [number, number, number][] = [RED, AMBER, TEAL];
LEADS.forEach((s, i) => {
  const x = 24 + i * 330, y = 138, w = 314, h = 218;
  rect(x, y, w, h, CARD);
  rect(x, y, w, 6, leadColors[i]);
  rect(x, y + 6, w, 1, LINE);
  drawText("LEAD " + (i + 1) + "  -  " + s.tag, x + 14, y + 20, 1, leadColors[i]);
  drawPara(s.head, x + 14, y + 44, 2, w - 28, INK, 20);
  hline(x + 14, y + 128, w - 28, LINE);
  drawPara(s.sub, x + 14, y + 140, 1, w - 28, GREY, 13);
});
drawText("THE DAY IN BRIEF  -  12 STORIES THAT SHAPED 26 NOVEMBER", 24, 372, 2, NAVY);
hline(24, 396, 976, LINE);

// Mid grid: 4 cols x 3 rows
MIDS.forEach((s, i) => {
  const col = i % 4, row = Math.floor(i / 4);
  const x = 24 + col * 248, y = 408 + row * 108, w = 236, h = 98;
  rect(x, y, w, h, CARD);
  rect(x, y, 5, h, NAVY);
  drawText(s.tag, x + 14, y + 10, 1, RED);
  drawPara(s.head, x + 14, y + 26, 1, w - 26, INK, 12);
  drawPara(s.sub, x + 14, y + 52, 1, w - 26, GREY, 11);
});
// ALSO section
const ay = 744;
rect(0, ay, W, 280, NAVY);
drawText("ALSO ON 26 NOVEMBER  -  33 MORE STORIES", 24, ay + 14, 2, WHITE);
hline(24, ay + 40, 976, [70, 85, 120]);
ALSO.forEach((s, i) => {
  const col = Math.floor(i / 11), row = i % 11;
  const x = 24 + col * 330, y = ay + 52 + row * 17;
  rect(x, y + 2, 6, 6, GOLD);
  drawText(s, x + 14, y, 1, [215, 222, 235]);
});
drawText("SOURCES: AP, REUTERS, CNN, BBC, THE TIMES, LE MONDE, SIMPLELIFE.NEWS  -  ALL STORIES DATED 25-26 NOV 2026", 24, 996, 1, [170, 180, 200]);

// ---- Run ----
fs.mkdirSync("/output", { recursive: true });
fs.writeFileSync("/output/entry.png", encodePNG());
console.log("wrote /output/entry.png");
