# AGENTS.md

本规范作用于当前目录及其所有子目录。

## 目标

在 `MiniGameTab` 新增/重构小游戏时，必须遵循统一模块化架构。禁止把完整游戏引擎和渲染细节直接内联在 `MiniGameTab.tsx`。

## 新小游戏目录规范（强制）

新增小游戏 `xxx` 时，必须按以下结构落地：

```text
games/
  GameXxx.tsx                # 门面导出文件（与 Game2048 / GameGomoku 一致）
  xxx/
    index.ts                 # 模块统一导出
    config/
      types.ts               # 类型与常量
    hooks/
      useGameXxxEngine.ts    # 状态与核心逻辑
    components/
      GameXxx.tsx            # 组件入口（forwardRef + useImperativeHandle）
      GameXxxBoard.tsx       # 纯渲染层
    utils/
      *.ts                   # 纯函数工具（规则/计算/存储）
```

## 职责边界（强制）

- `MiniGameTab.tsx` 只负责：
  - 游戏切换与页面布局
  - 右侧信息面板展示
  - 调用游戏组件暴露的控制句柄（如 `restart`）
  - 通过 `onStateChange` 接收状态快照
- 游戏内部逻辑（落子、胜负判定、缩放、存储恢复）必须放在 `games/xxx` 模块中。
- 不允许在 `MiniGameTab.tsx` 出现大型游戏状态机或游戏规则实现。

## 导出规范（强制）

- `games/xxx/index.ts` 负责导出组件与类型。
- `games/GameXxx.tsx` 作为对外稳定入口，统一转发导出。
- 业务方（如 `MiniGameTab`）只从 `./games/GameXxx` 引入，不直接跨层引用 `games/xxx/*` 内部文件。

## 状态与持久化规范

- 游戏状态类型定义在 `config/types.ts`。
- 本地存储读写与校验放在 `hooks` + `utils/storage.ts`，不得散落在页面层。
- 存储键必须使用常量命名，并由页面层注入（如 `storageKey`），避免硬编码在多个文件。

## 变更验收清单

提交前必须满足：

1. `MiniGameTab.tsx` 未出现新增游戏的核心规则代码。
2. 新游戏具备独立 `games/xxx` 模块结构。
3. `GameXxx.tsx` 与 `games/xxx/index.ts` 导出链完整。
4. 现有 UI 行为不回退（重开、状态展示、本地存档恢复）。
