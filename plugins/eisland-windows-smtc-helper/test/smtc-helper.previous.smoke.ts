const smtc = require('../');

console.log('=== SMTC Previous Smoke Test ===\n');

console.log('1. getStatus() before previous:');
console.log(JSON.stringify(smtc.getStatus(), null, 2));

console.log('\n2. previous():');
console.log(JSON.stringify(smtc.previous(), null, 2));

console.log('\n3. getStatus() after previous:');
console.log(JSON.stringify(smtc.getStatus(), null, 2));

console.log('\n=== Done ===');
