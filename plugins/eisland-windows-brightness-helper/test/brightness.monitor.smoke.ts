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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */

/**
 * @file brightness.monitor.smoke.ts
 * @description 屏幕亮度监控器手动冒烟测试
 * @author 鸡哥
 */

import type * as brightTypes from '../';

const bright = require('../') as typeof brightTypes;
const { BrightnessMonitor } = bright;

const DURATION_MS = 15000;

console.log('=== Brightness Monitor Smoke Test ===');
console.log(`Monitoring for ${DURATION_MS / 1000}s...`);
console.log('Try adjusting screen brightness during the test...\n');

const monitor = new BrightnessMonitor();

let changeCount = 0;

monitor.on('brightness-changed', (brightness: number, prevBrightness?: number) => {
  changeCount++;
  if (prevBrightness !== undefined) {
    console.log(`[changed] ${prevBrightness}% → ${brightness}% (total: ${changeCount})`);
  } else {
    console.log(`[changed] ${brightness}% (first event, total: ${changeCount})`);
  }
});

monitor.on('error', (err: Error) => {
  console.error('[error]', err);
});

monitor.start();
console.log(`Monitor running: ${monitor.isRunning()}`);
console.log(`Last brightness: ${monitor.getLastBrightness()}`);

setTimeout(() => {
  console.log(`\n--- Final State ---`);
  console.log(`  isRunning:       ${monitor.isRunning()}`);
  console.log(`  lastBrightness:  ${monitor.getLastBrightness()}%`);
  console.log(`  changeCount:     ${changeCount}`);

  monitor.stop();
  console.log(`\nMonitor stopped: ${!monitor.isRunning()}`);
  console.log('\n=== Smoke Test Complete ===');
}, DURATION_MS);
