/**
 * Builds the hero "opening plate" — the photograph of the real aircraft that is
 * held at rest and dissolved away as the scrub begins.
 *
 * It cannot just be the raw product photo. The frames are 16:9 with their edges
 * feathered to --void and a specific grade; a 4:3 daylight photo dropped on top
 * of them dissolves badly — you get letterbox bars, a hard rectangle edge, and a
 * visible jump in colour temperature at the hand-off. So the photo is
 * conformed to the sequence: same aspect, same feather, same grade family.
 *
 * Output: public/img/opening-<product>.webp
 * Run:    node scripts/build-openers.cjs   (wired into `npm run openers`)
 */
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const PUBLIC = path.join(__dirname, '..', 'public');
const VOID = { r: 0x06, g: 0x06, b: 0x06 };
const W = 1600;
const H = 900; // match the frame sequences exactly

const OPENERS = {
  scout: {
    src: path.join(PUBLIC, 'img', 'photo-scout.jpg'),
    // matched to the Scout frame grade so the cross-dissolve does not shift
    // colour temperature halfway through
    saturation: 0.55,
    brightness: 0.98,
    vignette: 0.55,
    vignetteInner: 0.3,
    feather: 0.13,
  },
  munition: {
    src: path.join(PUBLIC, 'img', 'photo-munition.jpg'),
    saturation: 0.62,
    brightness: 1.0,
    vignette: 0.5,
    vignetteInner: 0.32,
    feather: 0.11,
  },
};

function vignetteOverlay(w, h, strength, inner, feather) {
  const fx = Math.round(feather * 100);
  const fy = Math.round(feather * 1.35 * 100);
  return Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="v" cx="50%" cy="50%" r="72%">
        <stop offset="${Math.round(inner * 100)}%" stop-color="#060606" stop-opacity="0"/>
        <stop offset="100%" stop-color="#060606" stop-opacity="${strength}"/>
      </radialGradient>
      <linearGradient id="l" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#060606" stop-opacity="1"/><stop offset="${fx}%" stop-color="#060606" stop-opacity="0"/></linearGradient>
      <linearGradient id="r" x1="1" y1="0" x2="0" y2="0"><stop offset="0%" stop-color="#060606" stop-opacity="1"/><stop offset="${fx}%" stop-color="#060606" stop-opacity="0"/></linearGradient>
      <linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#060606" stop-opacity="1"/><stop offset="${fy}%" stop-color="#060606" stop-opacity="0"/></linearGradient>
      <linearGradient id="b" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#060606" stop-opacity="1"/><stop offset="${fy}%" stop-color="#060606" stop-opacity="0"/></linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#v)"/>
    <rect width="${w}" height="${h}" fill="url(#l)"/>
    <rect width="${w}" height="${h}" fill="url(#r)"/>
    <rect width="${w}" height="${h}" fill="url(#t)"/>
    <rect width="${w}" height="${h}" fill="url(#b)"/>
  </svg>`);
}

(async () => {
  for (const [key, cfg] of Object.entries(OPENERS)) {
    if (!fs.existsSync(cfg.src)) {
      console.log(`openers: ${key} — no source photo, skipped`);
      continue;
    }
    const out = path.join(PUBLIC, 'img', `opening-${key}.webp`);
    // cover-fit to the frame aspect so the dissolve has no letterbox mismatch
    const buf = await sharp(cfg.src)
      .resize(W, H, { fit: 'cover', position: 'centre' })
      .modulate({ saturation: cfg.saturation, brightness: cfg.brightness })
      .removeAlpha()
      .png()
      .toBuffer();

    await sharp(buf)
      .composite([{ input: vignetteOverlay(W, H, cfg.vignette, cfg.vignetteInner, cfg.feather), blend: 'over' }])
      .flatten({ background: VOID })
      .webp({ quality: 82, effort: 4 })
      .toFile(out);

    const kb = Math.round(fs.statSync(out).size / 1024);
    console.log(`openers: ${key} -> img/opening-${key}.webp (${W}x${H}, ${kb} KB)`);
  }
})();
