const detector = require('../');

console.log({
  any: detector.isAnyFullscreenWindow(),
  fg: detector.getForegroundFullscreenWindow(),
  list: detector.getFullscreenWindows(),
});