/**
 * 手动冒烟测试：根据 PID 获取图标
 * 运行：npm run smoke:pid
 */

const { getIconByPid } = require('../');
const { execSync } = require('child_process');

console.log('=== getIconByPid Smoke Test ===\n');

// 获取 explorer.exe 的 PID
let explorerPid = 0;
try {
  const result = execSync('tasklist /FI "IMAGENAME eq explorer.exe" /FO CSV /NH', { encoding: 'utf8' });
  const match = result.match(/"(\d+)"/);
  if (match) explorerPid = parseInt(match[1]);
} catch { /* ignore */ }

// 测试 1: 有效 PID
if (explorerPid > 0) {
  console.log(`1. getIconByPid(${explorerPid}) — explorer.exe`);
  const icon1 = getIconByPid(explorerPid);
  console.log(icon1 ? `   OK: ${icon1.length} bytes (PNG)` : '   FAIL: 未找到图标');
} else {
  console.log('1. SKIP: explorer.exe not found');
}

// 测试 2: Node.js 进程自身
console.log(`\n2. getIconByPid(${process.pid}) — current process`);
const icon2 = getIconByPid(process.pid);
console.log(icon2 ? `   OK: ${icon2.length} bytes (PNG)` : '   FAIL: 未找到图标');

// 测试 3: 无效 PID (0)
console.log('\n3. getIconByPid(0)');
const icon3 = getIconByPid(0);
console.log(icon3 === null ? '   OK: 正确返回 null' : `   FAIL: 期望 null，实际: ${icon3.length} bytes`);

// 测试 4: 不存在的 PID
console.log('\n4. getIconByPid(99999999)');
const icon4 = getIconByPid(99999999);
console.log(icon4 === null ? '   OK: 正确返回 null' : `   FAIL: 期望 null，实际: ${icon4.length} bytes`);

console.log('\n=== Done ===');
