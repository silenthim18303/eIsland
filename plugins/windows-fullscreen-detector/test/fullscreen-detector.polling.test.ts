const assert = require('node:assert/strict');

const POLL_TIMES = 5;
const POLL_INTERVAL_MS = 200;

type FullscreenWindowRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

type FullscreenWindowMonitor = FullscreenWindowRect & {
  isPrimary: boolean;
};

type FullscreenWindowInfo = {
  hwnd: string;
  title: string;
  processId: number;
  bounds: FullscreenWindowRect;
  monitor: FullscreenWindowMonitor;
  isForeground: boolean;
};

type PollFrame = {
  any: boolean;
  foreground: FullscreenWindowInfo | null;
  windows: FullscreenWindowInfo[];
};

type MockDetector = {
  getReadCount: () => number;
  isAnyFullscreenWindow: () => boolean;
  getForegroundFullscreenWindow: () => FullscreenWindowInfo | null;
  getFullscreenWindows: () => FullscreenWindowInfo[];
};

type MockWaiter = {
  calls: number[];
  wait: (ms: number) => Promise<void>;
};

type DetectorSnapshot = {
  index: number;
  any: boolean;
  foregroundTitle: string | null;
  fullscreenWindowCount: number;
  foregroundWindowCount: number;
};

type PollOptions = {
  times: number;
  intervalMs: number;
  wait: (ms: number) => Promise<void>;
};

const fullscreenWindow: FullscreenWindowInfo = {
  hwnd: '0x1',
  title: 'Mock Fullscreen App',
  processId: 1001,
  bounds: { left: 0, top: 0, right: 1920, bottom: 1080, width: 1920, height: 1080 },
  monitor: { left: 0, top: 0, right: 1920, bottom: 1080, width: 1920, height: 1080, isPrimary: true },
  isForeground: true,
};

const mockFrames: PollFrame[] = [
  { any: false, foreground: null, windows: [] },
  { any: false, foreground: null, windows: [] },
  { any: true, foreground: fullscreenWindow, windows: [fullscreenWindow] },
  { any: true, foreground: fullscreenWindow, windows: [fullscreenWindow] },
  { any: false, foreground: null, windows: [] },
];

function createMockDetector(frames: PollFrame[]): MockDetector {
  let readIndex = 0;

  return {
    getReadCount: () => readIndex,
    isAnyFullscreenWindow: () => frames[Math.min(readIndex, frames.length - 1)].any,
    getForegroundFullscreenWindow: () => frames[Math.min(readIndex, frames.length - 1)].foreground,
    getFullscreenWindows: () => {
      const frame = frames[Math.min(readIndex, frames.length - 1)];
      readIndex += 1;
      return frame.windows;
    },
  };
}

function createMockWaiter(): MockWaiter {
  const calls: number[] = [];

  return {
    calls,
    wait: async (ms: number) => {
      calls.push(ms);
    },
  };
}

function takeSnapshot(detector: MockDetector, index: number): DetectorSnapshot {
  const any = detector.isAnyFullscreenWindow();
  const foreground = detector.getForegroundFullscreenWindow();
  const fullscreenWindows = detector.getFullscreenWindows();

  assert.equal(typeof any, 'boolean');
  assert.ok(foreground === null || typeof foreground === 'object');
  assert.ok(Array.isArray(fullscreenWindows));

  return {
    index,
    any,
    foregroundTitle: foreground?.title ?? null,
    fullscreenWindowCount: fullscreenWindows.length,
    foregroundWindowCount: fullscreenWindows.filter((item: FullscreenWindowInfo) => item.isForeground).length,
  };
}

async function pollDetector(detector: MockDetector, options: PollOptions): Promise<DetectorSnapshot[]> {
  const snapshots: DetectorSnapshot[] = [];

  for (let index = 0; index < options.times; index += 1) {
    snapshots.push(takeSnapshot(detector, index));
    if (index < options.times - 1) {
      await options.wait(options.intervalMs);
    }
  }

  return snapshots;
}

async function main() {
  const detector = createMockDetector(mockFrames);
  const waiter = createMockWaiter();

  const snapshots = await pollDetector(detector, {
    times: POLL_TIMES,
    intervalMs: POLL_INTERVAL_MS,
    wait: waiter.wait,
  });

  assert.equal(detector.getReadCount(), POLL_TIMES);
  assert.equal(snapshots.length, POLL_TIMES);
  assert.deepEqual(waiter.calls, [POLL_INTERVAL_MS, POLL_INTERVAL_MS, POLL_INTERVAL_MS, POLL_INTERVAL_MS]);
  assert.deepEqual(snapshots.map((snapshot) => snapshot.any), [false, false, true, true, false]);
  assert.deepEqual(snapshots.map((snapshot) => snapshot.fullscreenWindowCount), [0, 0, 1, 1, 0]);
  assert.deepEqual(snapshots.map((snapshot) => snapshot.foregroundWindowCount), [0, 0, 1, 1, 0]);

  console.log('windows-fullscreen-detector polling test passed');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});