/**
 * Pulls a poster frame out of every video in public/video so the video bands
 * never flash black before playback starts (BUILD_BRIEF §6.4, §11).
 * Run: node scripts/build-posters.cjs
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('ffmpeg-static');
const sharp = require('sharp');

const VIDEO = path.join(__dirname, '..', 'public', 'video');
const POSTERS = path.join(__dirname, '..', 'public', 'posters');
const TMP = path.join(__dirname, '..', '.poster-tmp');

fs.mkdirSync(POSTERS, { recursive: true });
fs.mkdirSync(TMP, { recursive: true });

const videos = fs.readdirSync(VIDEO).filter((f) => f.endsWith('.mp4'));
for (const v of videos) {
  const base = path.basename(v, '.mp4');
  const raw = path.join(TMP, `${base}.png`);
  // grab ~1.5s in, past any fade-up from black
  execFileSync(ffmpeg, [
    '-y', '-loglevel', 'error', '-ss', '1.5', '-i', path.join(VIDEO, v),
    '-frames:v', '1', raw,
  ]);
  sharp(raw)
    .resize(1600, null, { withoutEnlargement: true })
    .jpeg({ quality: 72, progressive: true })
    .toFile(path.join(POSTERS, `${base}.jpg`))
    .then(() => console.log('poster:', base + '.jpg'));
}

process.on('exit', () => fs.rmSync(TMP, { recursive: true, force: true }));
