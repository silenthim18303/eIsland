const smtc = require('../');

console.log('=== SMTC Pause Smoke Test ===\n');

console.log('1. getStatus() before pause:');
const before = smtc.getStatus();
console.log(`   Status: ${before.playbackStatus}`);
console.log(`   Track: ${before.title ?? 'N/A'} - ${before.artist ?? 'N/A'}`);
if (before.timeline) console.log(`   Position: ${before.timeline.position.toFixed(1)}s`);

console.log('\n2. pause():');
console.log(JSON.stringify(smtc.pause(), null, 2));

console.log('\n3. getStatus() after pause:');
const after = smtc.getStatus();
console.log(`   Status: ${after.playbackStatus}`);
if (after.timeline) console.log(`   Position: ${after.timeline.position.toFixed(1)}s`);

console.log('\n=== Done ===');
