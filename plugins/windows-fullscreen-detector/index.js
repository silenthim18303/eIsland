const path = require('node:path');

if (process.platform !== 'win32') {
  throw new Error('@eisland/windows-fullscreen-detector only supports Windows.');
}

const candidates = [
  path.join(__dirname, 'build', 'Release', 'windows_fullscreen_detector.node'),
  path.join(__dirname, 'build', 'Debug', 'windows_fullscreen_detector.node'),
];

let nativeBinding;
let lastError;

for (const candidate of candidates) {
  try {
    nativeBinding = require(candidate);
    break;
  } catch (error) {
    lastError = error;
  }
}

if (!nativeBinding) {
  throw lastError ?? new Error('Unable to load windows_fullscreen_detector native binding.');
}

module.exports = nativeBinding;