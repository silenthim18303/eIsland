/**
 * 手动冒烟测试：根据进程名获取图标
 * 运行：npm run smoke:process-name
 */

const { getIconByProcessName } = require('../');

console.log('=== getIconByProcessName Smoke Test ===\n');

// 测试 1: 有效进程名（explorer 始终运行）
console.log('1. getIconByProcessName("explorer")');
const icon1 = getIconByProcessName('explorer');
console.log(icon1 ? `   OK: ${icon1.length} bytes (PNG)` : '   FAIL: 未找到图标');

// 测试 2: 不带 .exe 后缀
console.log('\n2. getIconByProcessName("svchost")');
const icon2 = getIconByProcessName('svchost');
console.log(icon2 ? `   OK: ${icon2.length} bytes (PNG)` : '   FAIL: 未找到图标');

// 测试 3: 带 .exe 后缀
console.log('\n3. getIconByProcessName("explorer.exe")');
const icon3 = getIconByProcessName('explorer.exe');
console.log(icon3 ? `   OK: ${icon3.length} bytes (PNG)` : '   FAIL: 未找到图标');

// 测试 4: 不存在的进程
console.log('\n4. getIconByProcessName("nonexistent_process_12345")');
const icon4 = getIconByProcessName('nonexistent_process_12345');
console.log(icon4 === null ? '   OK: 正确返回 null' : `   FAIL: 期望 null，实际: ${icon4.length} bytes`);

// 测试 5: 空字符串
console.log('\n5. getIconByProcessName("")');
const icon5 = getIconByProcessName('');
console.log(icon5 === null ? '   OK: 正确返回 null' : `   FAIL: 期望 null，实际: ${icon5.length} bytes`);

console.log('\n=== Done ===');
