/*
 * eIsland - A sleek, Apple Dynamic Island inspired floating widget for Windows, built with Electron.
 * https://github.com/JNTMTMTM/eIsland
 *
 * Copyright (C) 2026 JNTMTMTM
 * Copyright (C) 2026 pyisland.com
 *
 * Original author: JNTMTMTM[](https://github.com/JNTMTMTM)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 */

const smtc = require('../');

console.log('=== SMTC Helper Smoke Test ===\n');

console.log('1. getStatus():');
const status = smtc.getStatus();
console.log(JSON.stringify(status, null, 2));

console.log('\n2. play():');
const playResult = smtc.play();
console.log(JSON.stringify(playResult, null, 2));

console.log('\n3. getStatus() after play:');
const statusAfterPlay = smtc.getStatus();
console.log(JSON.stringify(statusAfterPlay, null, 2));

console.log('\n4. pause():');
const pauseResult = smtc.pause();
console.log(JSON.stringify(pauseResult, null, 2));

console.log('\n5. getStatus() after pause:');
const statusAfterPause = smtc.getStatus();
console.log(JSON.stringify(statusAfterPause, null, 2));

console.log('\n6. next():');
const nextResult = smtc.next();
console.log(JSON.stringify(nextResult, null, 2));

console.log('\n7. previous():');
const prevResult = smtc.previous();
console.log(JSON.stringify(prevResult, null, 2));

console.log('\n=== Smoke Test Complete ===');
