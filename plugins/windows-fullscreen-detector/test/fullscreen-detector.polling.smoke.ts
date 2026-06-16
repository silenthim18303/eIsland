const detector = require('../');

const POLL_TIMES = Number.parseInt(process.env.FULLSCREEN_POLL_TIMES ?? '15', 10);
const POLL_INTERVAL_MS = Number.parseInt(process.env.FULLSCREEN_POLL_INTERVAL_MS ?? '500', 10);

type FullscreenWindowInfo = {
  title: string;
  processId: number;
  isForeground: boolean;
  bounds: unknown;
  monitor: unknown;
};

type DetectorSnapshot = ReturnType<typeof takeSnapshot>;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function takeSnapshot(index: number) {
  const foreground = detector.getForegroundFullscreenWindow() as FullscreenWindowInfo | null;
  const fullscreenWindows = detector.getFullscreenWindows() as FullscreenWindowInfo[];

  return {
    index,
    any: detector.isAnyFullscreenWindow() as boolean,
    foregroundTitle: foreground?.title ?? null,
    foregroundProcessId: foreground?.processId ?? null,
    fullscreenWindowCount: fullscreenWindows.length,
    foregroundWindowCount: fullscreenWindows.filter((item) => item.isForeground).length,
    windows: fullscreenWindows.map((item) => ({
      title: item.title,
      processId: item.processId,
      isForeground: item.isForeground,
      bounds: item.bounds,
      monitor: item.monitor,
    })),
  };
}

async function main() {
  const snapshots: DetectorSnapshot[] = [];

  for (let index = 0; index < POLL_TIMES; index += 1) {
    const snapshot = takeSnapshot(index);
    snapshots.push(snapshot);
    console.log(snapshot);

    if (index < POLL_TIMES - 1) {
      await wait(POLL_INTERVAL_MS);
    }
  }

  console.log({
    pollTimes: POLL_TIMES,
    pollIntervalMs: POLL_INTERVAL_MS,
    snapshots: snapshots.length,
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});