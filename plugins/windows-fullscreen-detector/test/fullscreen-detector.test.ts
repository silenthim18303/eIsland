const assert = require('node:assert/strict');
const detector = require('../');

assert.equal(typeof detector.getForegroundFullscreenWindow, 'function');
assert.equal(typeof detector.getFullscreenWindows, 'function');
assert.equal(typeof detector.isAnyFullscreenWindow, 'function');

const foreground = detector.getForegroundFullscreenWindow();
assert.ok(foreground === null || typeof foreground === 'object');

const list = detector.getFullscreenWindows();
assert.ok(Array.isArray(list));
assert.equal(typeof detector.isAnyFullscreenWindow(), 'boolean');

for (const item of list) {
  assert.equal(typeof item.hwnd, 'string');
  assert.equal(typeof item.title, 'string');
  assert.equal(typeof item.processId, 'number');
  assert.equal(typeof item.isForeground, 'boolean');
  assert.equal(typeof item.bounds.left, 'number');
  assert.equal(typeof item.bounds.top, 'number');
  assert.equal(typeof item.bounds.right, 'number');
  assert.equal(typeof item.bounds.bottom, 'number');
  assert.equal(typeof item.bounds.width, 'number');
  assert.equal(typeof item.bounds.height, 'number');
  assert.equal(typeof item.monitor.isPrimary, 'boolean');
}

console.log('windows-fullscreen-detector test passed');