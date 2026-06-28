const smtc = require('../');

console.log('=== SMTC Next Smoke Test ===\n');

console.log('1. getStatus() before next:');
const before = smtc.getStatus();
console.log(`   Status: ${before.playbackStatus}`);
console.log(`   Track: ${before.title ?? 'N/A'} - ${before.artist ?? 'N/A'}`);
if (before.timeline) console.log(`   Position: ${before.timeline.position.toFixed(1)}s`);

console.log('\n2. next():');
console.log(JSON.stringify(smtc.next(), null, 2));

console.log('\n3. getStatus() after next:');
const after = smtc.getStatus();
console.log(`   Status: ${after.playbackStatus}`);
console.log(`   Track: ${after.title ?? 'N/A'} - ${after.artist ?? 'N/A'}`);
if (after.timeline) console.log(`   Position: ${after.timeline.position.toFixed(1)}s`);

console.log('\n=== Done ===');
