const smtc = require('../');

console.log('=== SMTC Pause Smoke Test ===\n');

console.log('1. getStatus() before pause:');
console.log(JSON.stringify(smtc.getStatus(), null, 2));

console.log('\n2. pause():');
console.log(JSON.stringify(smtc.pause(), null, 2));

console.log('\n3. getStatus() after pause:');
console.log(JSON.stringify(smtc.getStatus(), null, 2));

console.log('\n=== Done ===');
