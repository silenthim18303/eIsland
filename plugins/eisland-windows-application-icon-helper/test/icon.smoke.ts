/**
 * 手动冒烟测试：验证三个图标获取函数
 * 运行：npm run smoke
 */

const { getIconByProcessName, getIconByPid, getIconByPath } = require('../');

console.log('=== Application Icon Helper Smoke Test ===\n');

// 测试 1: 根据进程名获取图标
console.log('1. getIconByProcessName("notepad")');
const icon1 = getIconByProcessName('notepad');
console.log(icon1 ? `   OK: ${icon1.length} bytes (PNG)` : '   FAIL: 未找到图标');

// 测试 2: 根据 PID 获取图标
console.log('\n2. getIconByPid(4) — System process');
const icon2 = getIconByPid(4);
console.log(icon2 ? `   OK: ${icon2.length} bytes (PNG)` : '   FAIL: 未找到图标');

// 测试 3: 根据路径获取图标
const exePath = process.execPath;
console.log(`\n3. getIconByPath("${exePath}")`);
const icon3 = getIconByPath(exePath);
console.log(icon3 ? `   OK: ${icon3.length} bytes (PNG)` : '   FAIL: 未找到图标');

// 测试 4: 无效进程名
console.log('\n4. getIconByProcessName("nonexistent_process_12345")');
const icon4 = getIconByProcessName('nonexistent_process_12345');
console.log(icon4 === null ? '   OK: 正确返回 null' : `   FAIL: 期望 null，实际: ${icon4.length} bytes`);

// 测试 5: 无效路径
console.log('\n5. getIconByPath("C:\\nonexistent\\file.exe")');
const icon5 = getIconByPath('C:\\nonexistent\\file.exe');
console.log(icon5 === null ? '   OK: 正确返回 null' : `   FAIL: 期望 null，实际: ${icon5.length} bytes`);

console.log('\n=== Done ===');
