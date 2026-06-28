const smtc = require('../');

console.log('=== SMTC Next Smoke Test ===\n');

console.log('1. getStatus() before next:');
console.log(JSON.stringify(smtc.getStatus(), null, 2));

console.log('\n2. next():');
console.log(JSON.stringify(smtc.next(), null, 2));

console.log('\n3. getStatus() after next:');
console.log(JSON.stringify(smtc.getStatus(), null, 2));

console.log('\n=== Done ===');
