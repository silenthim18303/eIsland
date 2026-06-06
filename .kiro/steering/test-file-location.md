---
inclusion: always
---

# 测试文件目录规范

新增或移动测试文件时，不要把测试文件和被测文件放在同一目录下。

要求：

- `*.test.ts`、`*.test.tsx` 必须放在就近的 `test/` 子目录中。
- 被测文件保留在原模块目录，例如 `utils/tabNavigation.ts`。
- 对应测试文件放在 `utils/test/tabNavigation.test.ts`。
- 移动测试文件后，必须同步修正相对导入路径。
- 不要为了移动测试文件改动被测文件逻辑。