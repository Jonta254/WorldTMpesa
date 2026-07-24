// Generates World Dev Portal store assets for Tcash: three showcase panels
// that are faithful device mockups of the REAL app screens (Home, Trade,
// Settlement receipt) plus a premium content card. Everything is drawn from
// the app's own design tokens (src/styles.css :root, dark theme) so the store
// listing and the shipped product read as one object — World rejects showcase
// art that misrepresents the app.
//
// Run: node scripts/gen-store-assets.mjs   (needs @resvg/resvg-js)
import { Resvg } from "@resvg/resvg-js";
import { writeFileSync } from "node:fs";

// ── tokens ─────────────────────────────────────────────────────────────
const BG0 = "#1c1712";
const BG1 = "#15130f";
const PANEL = "#211d16";
const TEXT = "#f6f1e7";
const MUTED = "#a79c87";
const COP = "#c97a3a";
const COP_HI = "#e3a466";
const SAGE = "#7fa37a";
const BORDER = "rgba(246,241,231,0.12)";
const HAIR = "rgba(246,241,231,0.10)";
const COP_SOFT = "rgba(201,122,58,0.16)";
const SAGE_SOFT = "rgba(127,163,122,0.16)";
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "Arial, Helvetica, sans-serif";

// ── tiny helpers ───────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
function T(x, y, size, fill, txt, o = {}) {
  const { f = "sans", w = 400, anchor = "start", italic = false, ls = 0 } = o;
  return `<text x="${x}" y="${y}" font-family="${f === "serif" ? SERIF : SANS}" font-size="${size}" fill="${fill}" font-weight="${w}" text-anchor="${anchor}"${italic ? ' font-style="italic"' : ""}${ls ? ` letter-spacing="${ls}"` : ""}>${esc(txt)}</text>`;
}
const hair = (x1, y, x2, c = HAIR) => `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${c}" stroke-width="1.5"/>`;
const rrect = (x, y, w, h, r, fill, stroke = "", sw = 0) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : ""}/>`;
const circle = (cx, cy, r, fill, stroke = "", sw = 0) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : ""}/>`;
const arrowUp = (cx, cy, s, c) => `<g stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M${cx} ${cy + s} L${cx} ${cy - s}"/><path d="M${cx - s * 0.72} ${cy - s * 0.28} L${cx} ${cy - s} L${cx + s * 0.72} ${cy - s * 0.28}"/></g>`;
const arrowDown = (cx, cy, s, c) => `<g stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M${cx} ${cy - s} L${cx} ${cy + s}"/><path d="M${cx - s * 0.72} ${cy + s * 0.28} L${cx} ${cy + s} L${cx + s * 0.72} ${cy + s * 0.28}"/></g>`;
const chevR = (cx, cy, s, c) => `<path d="M${cx - s * 0.4} ${cy - s} L${cx + s * 0.45} ${cy} L${cx - s * 0.4} ${cy + s}" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
const check = (cx, cy, s, c, w = 5) => `<path d="M${cx - s} ${cy + s * 0.05} L${cx - s * 0.25} ${cy + s * 0.72} L${cx + s} ${cy - s * 0.7}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
const refresh = (cx, cy, s, c) => `<g stroke="${c}" stroke-width="3.4" fill="none" stroke-linecap="round"><path d="M${cx + s} ${cy - 1} A ${s} ${s} 0 1 1 ${cx - s * 0.2} ${cy - s * 0.98}"/><path d="M${cx - s * 0.55} ${cy - s * 1.15} L${cx - s * 0.2} ${cy - s * 0.98} L${cx - s * 0.05} ${cy - s * 1.45}"/></g>`;
const statusBar = (W) =>
  `${T(44, 40, 26, TEXT, "9:41", { w: 600 })}` +
  `<g>${rrect(W - 96, 24, 40, 20, 5, "none", TEXT, 2)}<rect x="${W - 54}" y="30" width="4" height="8" rx="2" fill="${TEXT}"/><rect x="${W - 92}" y="28" width="26" height="12" rx="2" fill="${TEXT}"/></g>` +
  `<g fill="${TEXT}"><circle cx="${W - 150}" cy="34" r="3.5"/><circle cx="${W - 138}" cy="34" r="3.5"/><circle cx="${W - 126}" cy="34" r="3.5"/><circle cx="${W - 114}" cy="34" r="3.5"/></g>`;

const DEFS = `
  <linearGradient id="bg" x1="0" y1="0" x2="1080" y2="1920" gradientUnits="userSpaceOnUse">
    <stop stop-color="${BG0}"/><stop offset="1" stop-color="${BG1}"/>
  </linearGradient>
  <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1" >
    <stop stop-color="#5a3a20"/><stop offset="1" stop-color="#2a1f14"/>
  </linearGradient>
  <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(540 380) scale(560)">
    <stop stop-color="${COP}" stop-opacity="0.30"/><stop offset="1" stop-color="${COP}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="screen" x1="0" y1="0" x2="0" y2="1">
    <stop stop-color="${BG0}"/><stop offset="1" stop-color="${BG1}"/>
  </linearGradient>
  <linearGradient id="head" x1="0" y1="0" x2="1" y2="0">
    <stop stop-color="${TEXT}"/><stop offset="1" stop-color="${COP_HI}"/>
  </linearGradient>
  <filter id="soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="34"/></filter>`;

// ── panel card w/ faint lift (matches the app's Buy/Sell depth) ──────────
function actionCard(x, y, w, h, tint, icon, title, sub) {
  return (
    `<rect x="${x}" y="${y + 4}" width="${w}" height="${h}" rx="30" fill="#000" opacity="0.28" filter="url(#soft)"/>` +
    rrect(x, y, w, h, 30, PANEL, BORDER, 1.5) +
    `<rect x="${x}" y="${y}" width="${w}" height="2" rx="1" fill="rgba(246,241,231,0.06)"/>` +
    circle(x + 66, y + h / 2, 40, tint === COP ? COP_SOFT : SAGE_SOFT) +
    (tint === COP ? arrowUp(x + 66, y + h / 2, 16, COP) : arrowDown(x + 66, y + h / 2, 16, SAGE)) +
    T(x + 128, y + h / 2 - 8, 31, TEXT, title, { w: 700 }) +
    T(x + 128, y + h / 2 + 30, 22, MUTED, sub) +
    chevR(x + w - 38, y + h / 2, 12, MUTED)
  );
}

// ── SCREEN: Home ─────────────────────────────────────────────────────────
function homeScreen(W) {
  const R = W - 44;
  return `
    <rect width="${W}" height="1600" fill="url(#screen)"/>
    ${statusBar(W)}
    ${T(44, 118, 46, TEXT, "Tcash", { f: "serif", italic: true, w: 500 })}
    ${rrect(214, 92, 210, 38, 19, SAGE_SOFT)}${check(236, 111, 9, SAGE, 3)}${T(256, 118, 20, SAGE, "World verified", { w: 700 })}
    ${circle(R - 4, 110, 28, PANEL, BORDER, 1.5)}${T(R - 4, 120, 30, MUTED, "J", { f: "serif", anchor: "middle" })}
    ${T(44, 182, 26, MUTED, "Good evening, @jontAWorld")}
    ${T(44, 274, 82, TEXT, "KES 1,461.90", { f: "serif", w: 500 })}
    ${circle(R - 4, 250, 26, "none", BORDER, 1.5)}${refresh(R - 4, 252, 12, MUTED)}
    ${T(44, 322, 25, MUTED, "Portfolio in KES")}${T(R, 322, 25, MUTED, "Wallet →", { anchor: "end" })}
    ${hair(44, 356, R, BORDER)}
    ${T(44, 400, 21, MUTED, "HOLDINGS", { w: 700, ls: 2 })}
    ${circle(R - 214, 394, 5, COP)}${T(R - 42, 400, 19, MUTED, "LIVE RATES", { w: 700, ls: 1, anchor: "end" })}${refresh(R - 12, 396, 10, MUTED)}
    ${hair(44, 434, R, BORDER)}
    ${T(44, 490, 42, TEXT, "29.83 WLD", { f: "serif" })}${T(44, 528, 24, MUTED, "≈ KES 1,422.99")}
    ${T(R, 490, 40, TEXT, "KES 47.71", { f: "serif", anchor: "end" })}${T(R, 528, 24, MUTED, "per WLD", { anchor: "end" })}
    ${hair(44, 566, R, BORDER)}
    ${T(44, 622, 42, TEXT, "0.3 USDC", { f: "serif" })}${T(44, 660, 24, MUTED, "≈ KES 38.91")}
    ${T(R, 622, 40, TEXT, "KES 129.48", { f: "serif", anchor: "end" })}${T(R, 660, 24, MUTED, "per USDC", { anchor: "end" })}
    ${hair(44, 698, R, BORDER)}
    ${actionCard(44, 728, W - 88, 120, COP, "up", "Buy crypto", "Pay with M-Pesa, receive WLD or USDC")}
    ${actionCard(44, 868, W - 88, 120, SAGE, "down", "Sell crypto", "Send WLD or USDC, cash out to M-Pesa")}
    ${T(W / 2 - 96, 1044, 25, MUTED, "Receive")}${T(W / 2 + 40, 1044, 25, MUTED, "History")}
    ${T(44, 1122, 21, MUTED, "RECENT", { w: 700, ls: 2 })}${T(R, 1122, 22, COP, "All →", { anchor: "end", w: 700 })}
    ${circle(74, 1180, 27, "none", BORDER, 1.5)}${arrowUp(74, 1180, 12, MUTED)}
    ${T(116, 1172, 28, TEXT, "21.0702 WLD", { w: 600 })}${T(116, 1206, 22, MUTED, "22/07/2026")}
    ${T(R, 1172, 30, TEXT, "KES 1,200.00", { f: "serif", anchor: "end" })}${T(R, 1206, 22, SAGE, "Done", { anchor: "end", w: 700 })}
    ${hair(44, 1250, R, BORDER)}
    ${T(44, 1298, 23, MUTED, "Invite a friend · code ")}${T(292, 1298, 23, COP, "TC-JONTAWORLD", { w: 700 })}${T(R, 1298, 24, COP, "Share", { anchor: "end", w: 700 })}
    ${bottomNav(W, "home")}
  `;
}

// ── bottom tab bar ──────────────────────────────────────────────────────
function bottomNav(W, active) {
  const y = 1372;
  const cy = 1416;
  const items = [
    ["Home", 96], ["Wallet", 236], [null, W / 2], ["History", W - 90],
  ];
  let g = hair(0, y, W, BORDER);
  g += `<rect x="0" y="${y}" width="${W}" height="${1600 - y}" fill="rgba(21,19,15,0.6)"/>`;
  // home
  g += `<g transform="translate(${96 - 14},${cy - 24})" stroke="${active === "home" ? COP : MUTED}" stroke-width="3" fill="none" stroke-linejoin="round"><path d="M2 12 L14 2 L26 12"/><path d="M5 11 V24 H23 V11"/></g>`;
  g += T(96, cy + 32, 19, active === "home" ? COP : MUTED, "Home", { anchor: "middle", w: 600 });
  // wallet
  g += `<g transform="translate(${236 - 15},${cy - 22})" stroke="${MUTED}" stroke-width="3" fill="none" stroke-linejoin="round"><rect x="1" y="4" width="28" height="20" rx="4"/><circle cx="23" cy="14" r="2.5" fill="${MUTED}" stroke="none"/></g>`;
  g += T(236, cy + 32, 19, MUTED, "Wallet", { anchor: "middle", w: 600 });
  // trade FAB (raised copper)
  g += circle(W / 2, cy - 6, 46, COP);
  g += `<g transform="translate(${W / 2},${cy - 6})" stroke="${BG1}" stroke-width="4.5" fill="none" stroke-linecap="round"><path d="M-16 -6 H16"/><path d="M-16 6 H16"/><path d="M-16 -6 V-1"/><path d="M16 6 V1"/></g>`;
  g += T(W / 2, cy + 48, 19, MUTED, "Trade", { anchor: "middle", w: 600 });
  // history
  g += `<g transform="translate(${W - 90},${cy - 22})" stroke="${MUTED}" stroke-width="3" fill="none" stroke-linecap="round"><circle cx="0" cy="14" r="13"/><path d="M0 6 V14 L6 18"/></g>`;
  g += T(W - 90, cy + 32, 19, MUTED, "History", { anchor: "middle", w: 600 });
  return g;
}

// ── SCREEN: Trade (Buy) ──────────────────────────────────────────────────
function tradeScreen(W) {
  const R = W - 44;
  const iw = W - 88;
  return `
    <rect width="${W}" height="1600" fill="url(#screen)"/>
    ${statusBar(W)}
    ${rrect(44, 96, iw, 104, 22, "none", BORDER, 1.5)}
    <rect x="44" y="96" width="${iw / 2}" height="104" rx="22" fill="${COP_SOFT}"/>
    <rect x="44" y="192" width="${iw / 2}" height="4" fill="${COP}"/>
    ${T(44 + iw / 4, 142, 34, COP, "Buy", { anchor: "middle", w: 700 })}${T(44 + iw / 4, 176, 20, MUTED, "Pay KES", { anchor: "middle" })}
    ${T(44 + (iw * 3) / 4, 142, 34, MUTED, "Sell", { anchor: "middle", w: 700 })}${T(44 + (iw * 3) / 4, 176, 20, MUTED, "Receive KES", { anchor: "middle" })}
    ${rrect(44, 232, iw, 96, 20, PANEL, BORDER, 1.5)}
    ${circle(96, 280, 26, COP_SOFT)}${arrowDown(96, 280, 13, COP)}
    ${T(140, 272, 27, TEXT, "@jontAWorld", { w: 700 })}${T(140, 304, 21, MUTED, "Crypto delivered here after admin review")}
    ${T(44, 384, 24, MUTED, "Amount to pay")}
    ${rrect(44, 404, iw, 120, 22, PANEL, BORDER, 1.5)}
    ${T(76, 484, 68, TEXT, "1,000", { f: "serif", w: 500 })}${T(R - 20, 480, 34, MUTED, "KES", { anchor: "end", w: 600 })}
    ${T(44, 580, 24, MUTED, "Asset")}
    ${rrect(44, 600, iw, 96, 22, PANEL, BORDER, 1.5)}${T(80, 660, 32, TEXT, "WLD", { w: 600 })}${chevR(R - 34, 648, 10, MUTED)}
    ${T(44, 742, 22, MUTED, "Limits: KES 600 – KES 20,000")}
    ${rrect(44, 772, iw, 196, 24, "rgba(201,122,58,0.06)", "rgba(201,122,58,0.22)", 1.5)}
    ${T(80, 838, 26, MUTED, "You pay")}${T(R - 34, 838, 30, TEXT, "KES 1,000", { anchor: "end", w: 700 })}
    ${hair(80, 876, R - 34, BORDER)}
    ${T(80, 924, 26, MUTED, "You receive")}${T(R - 34, 924, 32, COP, "20.96 WLD", { anchor: "end", w: 700 })}
    ${T(80, 954, 20, MUTED, "Tcash fee included · Manual review required")}
    ${rrect(44, 1006, iw, 104, 26, COP)}${T(W / 2, 1070, 32, BG1, "Confirm buy order", { anchor: "middle", w: 700 })}
    ${bottomNav(W, "trade")}
  `;
}

// ── SCREEN: Settlement receipt ───────────────────────────────────────────
function receiptScreen(W) {
  const R = W - 44;
  const iw = W - 88;
  const cx = W / 2;
  let notches = "";
  for (let nx = 90; nx < R; nx += 34) notches += `<line x1="${nx}" y1="712" x2="${nx + 18}" y2="712" stroke="${BORDER}" stroke-width="2"/>`;
  return `
    <rect width="${W}" height="1600" fill="url(#screen)"/>
    ${statusBar(W)}
    ${T(44, 122, 34, TEXT, "Tcash", { f: "serif", italic: true, w: 500 })}
    ${T(R, 122, 19, MUTED, "SETTLEMENT RECEIPT", { anchor: "end", w: 700, ls: 1 })}
    ${hair(44, 156, R, BORDER)}
    ${circle(cx, 268, 58, SAGE_SOFT, SAGE, 2.5)}${check(cx, 268, 26, SAGE, 6)}
    ${T(cx, 384, 42, TEXT, "Payment submitted", { anchor: "middle", w: 700 })}
    ${T(cx, 436, 24, MUTED, "Admin will verify your M-Pesa payment and", { anchor: "middle" })}
    ${T(cx, 468, 24, MUTED, "release 20.96 WLD to your wallet.", { anchor: "middle" })}
    ${T(cx, 560, 21, MUTED, "YOU PAID", { anchor: "middle", w: 700, ls: 2 })}
    ${T(cx, 646, 76, TEXT, "KES 1,000.00", { anchor: "middle", f: "serif", w: 500 })}
    ${circle(44, 712, 18, BG1)}${circle(R, 712, 18, BG1)}${notches}
    ${T(80, 800, 26, MUTED, "Order type")}${T(R - 34, 800, 28, TEXT, "Buy WLD", { anchor: "end", w: 600 })}
    ${hair(80, 838, R - 34, BORDER)}
    ${T(80, 890, 26, MUTED, "You receive")}${T(R - 34, 890, 28, TEXT, "20.96 WLD", { anchor: "end", w: 600 })}
    ${hair(80, 928, R - 34, BORDER)}
    ${T(80, 980, 26, MUTED, "M-Pesa code")}${T(R - 34, 980, 28, TEXT, "QWE123XYZ", { anchor: "end", w: 600 })}
    ${rrect(44, 1036, iw, 86, 18, "rgba(201,122,58,0.06)", "rgba(201,122,58,0.20)", 1.5)}
    ${T(80, 1088, 20, COP, "REF", { w: 700, ls: 2 })}${T(R - 34, 1088, 28, TEXT, "A1B2C3D4", { anchor: "end", w: 600 })}
    ${rrect(44, 1156, iw, 96, 24, COP)}${T(cx, 1216, 30, BG1, "View in History", { anchor: "middle", w: 700 })}
    ${bottomNav(W, "trade")}
  `;
}

// ── device frame wrapper ─────────────────────────────────────────────────
// Places a 664-wide screen render inside a phone that bleeds off the bottom
// of a 1080x1920 branded panel, with a headline above.
function showcase(kicker, head1, head2, screenFn) {
  const SW = 664;
  const px = 180, py = 452, pw = 720, ph = 1560; // phone outer (bleeds past 1920)
  const sx = px + 28, sy = py + 28, sr = 60;
  return `<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
    <defs>${DEFS}
      <clipPath id="screenClip"><rect x="${sx}" y="${sy}" width="${SW}" height="${1920 - sy}" rx="${sr}"/></clipPath>
    </defs>
    <rect width="1080" height="1920" fill="url(#bg)"/>
    <circle cx="540" cy="360" r="560" fill="url(#glow)"/>
    ${T(540, 196, 30, COP, kicker, { anchor: "middle", w: 800, ls: 6 })}
    ${T(540, 300, 66, "url(#head)", head1, { anchor: "middle", w: 800 })}
    ${T(540, 380, 66, "url(#head)", head2, { anchor: "middle", w: 800 })}
    <ellipse cx="540" cy="1900" rx="360" ry="60" fill="#000" opacity="0.5" filter="url(#soft)"/>
    ${rrect(px, py, pw, ph, 92, "#0a0806", "url(#rim)", 6)}
    ${rrect(px + 12, py + 12, pw - 24, ph - 24, 82, "#050403")}
    <g clip-path="url(#screenClip)"><g transform="translate(${sx},${sy})">${screenFn(SW)}</g></g>
    <rect x="${sx}" y="${sy}" width="${SW}" height="${1920 - sy}" rx="${sr}" fill="none" stroke="rgba(246,241,231,0.06)" stroke-width="1.5"/>
  </svg>`;
}

// ── content card: 1035x720, no marketing text, bottom 282px (94@3x) clear ─
function contentCard() {
  const SW = 664;
  // phone tucked upper-right, tilted, showing the Home hero; left holds a
  // soft glow + the settlement stamp motif. Bottom band stays clean.
  return `<svg width="1035" height="720" viewBox="0 0 1035 720" xmlns="http://www.w3.org/2000/svg">
    <defs>${DEFS}
      <clipPath id="ccScreen"><rect x="0" y="0" width="${SW}" height="1160" rx="60"/></clipPath>
      <radialGradient id="ccglow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(320 210) scale(430)">
        <stop stop-color="${COP}" stop-opacity="0.42"/><stop offset="1" stop-color="${COP}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="ccScrim" x1="0" y1="360" x2="0" y2="720" gradientUnits="userSpaceOnUse">
        <stop stop-color="${BG1}" stop-opacity="0"/><stop offset="0.55" stop-color="${BG1}"/><stop offset="1" stop-color="${BG1}"/>
      </linearGradient>
    </defs>
    <rect width="1035" height="720" fill="url(#bg)"/>
    <circle cx="320" cy="210" r="420" fill="url(#ccglow)"/>
    <g transform="translate(560,60) rotate(-7)">
      ${rrect(0, 0, 430, 760, 60, "#0a0806", "url(#rim)", 5)}
      ${rrect(8, 8, 414, 744, 54, "#050403")}
      <g clip-path="url(#ccScreen)"><g transform="translate(23,23) scale(0.578)">${homeScreen(SW)}</g></g>
    </g>
    <!-- brand motif (no text): verified/human-reviewed stamp -->
    <g transform="translate(232,232)">
      ${circle(0, 0, 96, SAGE_SOFT, SAGE, 3)}${check(0, 0, 46, SAGE, 9)}
    </g>
    <!-- keep the bottom band calm: World overlays the app name + Open button here -->
    <rect x="0" y="360" width="1035" height="360" fill="url(#ccScrim)"/>
  </svg>`;
}

// ── render ───────────────────────────────────────────────────────────────
const out = (name, svg, w) => {
  const png = new Resvg(svg, { fitTo: { mode: "width", value: w } }).render().asPng();
  writeFileSync(new URL(`../public/${name}`, import.meta.url), png);
  console.log(`wrote public/${name} (${(png.length / 1024).toFixed(0)} KB)`);
};

out("content_card_image.png", contentCard(), 1035);
out("showcase_img_1.png", showcase("TCASH", "Your wallet,", "in shillings", homeScreen), 1080);
out("showcase_img_2.png", showcase("BUY & SELL", "WLD & USDC", "in a tap", tradeScreen), 1080);
out("showcase_img_3.png", showcase("EVERY ORDER", "Checked by", "a real person", receiptScreen), 1080);
