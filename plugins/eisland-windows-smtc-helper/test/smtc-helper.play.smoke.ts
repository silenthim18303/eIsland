const smtc = require('../');

console.log('=== SMTC Play Smoke Test ===\n');

console.log('1. getStatus() before play:');
console.log(JSON.stringify(smtc.getStatus(), null, 2));

console.log('\n2. play():');
console.log(JSON.stringify(smtc.play(), null, 2));

console.log('\n3. getStatus() after play:');
console.log(JSON.stringify(smtc.getStatus(), null, 2));

console.log('\n=== Done ===');
