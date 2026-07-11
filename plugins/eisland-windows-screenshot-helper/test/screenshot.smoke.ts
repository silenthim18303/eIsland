const fs = require('node:fs');
const path = require('node:path');

const dllPath = path.join(__dirname, '..', 'src', 'bin', 'Release', 'net10.0-windows10.0.19041.0', 'win-x64', 'native', 'eIslandScreenshotHelper.dll');
if (!fs.existsSync(dllPath)) {
  throw new Error('Native DLL not found. Run npm run build first.');
}

const { capturePrimaryDisplayPng } = require('..');
const result = capturePrimaryDisplayPng();
if (!result || !Buffer.isBuffer(result.data) || result.data.length === 0) {
  throw new Error('Failed to capture primary display PNG.');
}

console.log(`Captured ${result.size} bytes as ${result.format}.`);