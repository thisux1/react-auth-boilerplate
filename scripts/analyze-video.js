const { execSync } = require('child_process');
const ffprobePath = require('@ffprobe-installer/ffprobe').path;

const videoPath = 'C:\\Users\\thiago\\Downloads\\upscaled-video (1).mp4';

const result = execSync(
    `"${ffprobePath}" -v quiet -print_format json -show_format -show_streams "${videoPath}"`
).toString();

console.log(result);
