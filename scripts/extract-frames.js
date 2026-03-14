const { execSync } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');

const videoPath = 'C:\\Users\\thiago\\Downloads\\upscaled-video (1).mp4';
const outputDir = path.join(__dirname, '..', 'frontend', 'public', 'hero-frames');

// Clean output directory
if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true });
}
fs.mkdirSync(outputDir, { recursive: true });

// Video: HEVC H.265, 2730x1534, 30fps, 7.03s, 211 frames
//
// Extracting at NATIVE 30fps for maximum smoothness
// Scaling to 1920w for web
const fps = 30;
const width = 1920;
const jpegQuality = 5; // ffmpeg jpeg quality (2=best, 31=worst)

console.log(`Extracting frames at ${fps}fps (native rate), ${width}px wide...`);
console.log(`Output: ${outputDir}\n`);

// Step 1: Extract as JPEG
const jpegCmd = [
    `"${ffmpegPath}"`,
    `-i "${videoPath}"`,
    `-vf "fps=${fps},scale=${width}:-1"`,
    `-q:v ${jpegQuality}`,
    `-an`,
    `-y`,
    `"${path.join(outputDir, 'frame_%03d.jpg')}"`
].join(' ');

console.log('Step 1: Extracting JPEGs...');
execSync(jpegCmd, { stdio: 'inherit' });

// Step 2: Convert each JPEG to WebP
console.log('\nStep 2: Converting to WebP (quality 80)...');
const jpgFiles = fs.readdirSync(outputDir)
    .filter(f => f.endsWith('.jpg'))
    .sort();

let converted = 0;
for (const jpg of jpgFiles) {
    const webp = jpg.replace('.jpg', '.webp');
    const convertCmd = [
        `"${ffmpegPath}"`,
        `-i "${path.join(outputDir, jpg)}"`,
        `-c:v libwebp`,
        `-quality 80`,
        `-y`,
        `"${path.join(outputDir, webp)}"`
    ].join(' ');
    execSync(convertCmd, { stdio: 'pipe' });
    converted++;
    if (converted % 50 === 0) console.log(`  ${converted}/${jpgFiles.length} done...`);
}

// Step 3: Remove original JPEGs
for (const jpg of jpgFiles) {
    fs.unlinkSync(path.join(outputDir, jpg));
}

// Stats
const webpFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.webp')).sort();
let totalSize = 0;
for (const f of webpFiles) {
    totalSize += fs.statSync(path.join(outputDir, f)).size;
}

console.log(`\n✅ Extracted and converted ${webpFiles.length} frames`);
console.log(`Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`Average per frame: ${(totalSize / webpFiles.length / 1024).toFixed(1)} KB`);
console.log(`First: ${webpFiles[0]}, Last: ${webpFiles[webpFiles.length - 1]}`);
