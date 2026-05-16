import { beforeEach, describe, expect, it, vi } from 'vitest';

const { handleMock, onMock } = vi.hoisted(() => ({
  handleMock: vi.fn(),
  onMock: vi.fn(),
}));
const { execMock } = vi.hoisted(() => ({ execMock: vi.fn() }));

vi.mock('electron', () => ({
  ipcMain: {
    handle: handleMock,
    on: onMock,
  },
}));

vi.mock('child_process', () => ({
  exec: execMock,
}));

vi.mock('systeminformation', () => ({
  cpu: vi.fn(async () => ({ manufacturer: 'X', brand: 'Y', cores: 4, physicalCores: 2, speed: 3.2, speedMax: 4.0 })),
  currentLoad: vi.fn(async () => ({ currentLoad: 40, cpus: [{ load: 30 }, { load: 50 }] })),
  cpuTemperature: vi.fn(async () => ({ main: 55, max: 66, cores: [50, 60] })),
  mem: vi.fn(async () => ({ total: 1000, used: 400, available: 600 })),
  graphics: vi.fn(async () => ({ controllers: [{ vendor: 'N', model: 'G', utilizationGpu: 70, vram: 2048, temperatureGpu: 65 }] })),
  fsSize: vi.fn(async () => [{ size: 1000, used: 200, mount: 'C:', fs: 'NTFS' }]),
  diskLayout: vi.fn(async () => [{ temperature: 42 }]),
}));

import { registerSystemIpcHandlers } from '../system';

describe('system ipc handlers', () => {
  const handleHandlers = new Map<string, (...args: any[]) => any>();
  const onHandlers = new Map<string, (...args: any[]) => any>();

  beforeEach(() => {
    handleHandlers.clear();
    onHandlers.clear();
    handleMock.mockReset();
    onMock.mockReset();
    execMock.mockReset();

    handleMock.mockImplementation((channel: string, handler: (...args: any[]) => any) => {
      handleHandlers.set(channel, handler);
    });
    onMock.mockImplementation((channel: string, handler: (...args: any[]) => any) => {
      onHandlers.set(channel, handler);
    });
  });

  it('registers handlers and delegates process/window queries', async () => {
    const queryRunningNonSystemProcessNames = vi.fn(async () => ['a.exe']);
    const queryRunningNonSystemProcessesWithIcons = vi.fn(async () => [{ name: 'a.exe', iconDataUrl: null }]);
    const queryOpenWindowsWithIcons = vi.fn(async () => [{ id: '1', title: 't', processName: 'a', processPath: null, processId: 1, iconDataUrl: null }]);
    const queryFocusedWindow = vi.fn(async () => null);

    registerSystemIpcHandlers({
      queryRunningNonSystemProcessNames,
      queryRunningNonSystemProcessesWithIcons,
      queryOpenWindowsWithIcons,
      queryFocusedWindow,
    });

    await expect(handleHandlers.get('system:running-processes:get')?.()).resolves.toEqual(['a.exe']);
    await expect(handleHandlers.get('system:running-processes:with-icons:get')?.()).resolves.toEqual([{ name: 'a.exe', iconDataUrl: null }]);
    await expect(handleHandlers.get('system:open-windows:with-icons:get')?.()).resolves.toHaveLength(1);
    await expect(handleHandlers.get('system:focused-window:get')?.()).resolves.toBeNull();
  });

  it('returns performance snapshot payload', async () => {
    registerSystemIpcHandlers({
      queryRunningNonSystemProcessNames: vi.fn(async () => []),
      queryRunningNonSystemProcessesWithIcons: vi.fn(async () => []),
      queryOpenWindowsWithIcons: vi.fn(async () => []),
      queryFocusedWindow: vi.fn(async () => null),
    });

    const snapshot = await handleHandlers.get('system:performance-snapshot:get')?.({}, { cpu: 'cpu:0', gpu: 'gpu:0', disk: 'fs:0' });

    expect(snapshot.cpu.loadPercent).toBeGreaterThanOrEqual(0);
    expect(snapshot.memory.totalBytes).toBe(1000);
    expect(snapshot.gpu?.model).toBe('G');
    expect(snapshot.disk.totalBytes).toBe(1000);
  });

  it('opens task manager event on win32', () => {
    registerSystemIpcHandlers({
      queryRunningNonSystemProcessNames: vi.fn(async () => []),
      queryRunningNonSystemProcessesWithIcons: vi.fn(async () => []),
      queryOpenWindowsWithIcons: vi.fn(async () => []),
      queryFocusedWindow: vi.fn(async () => null),
    });

    onHandlers.get('system:open-task-manager')?.();
    expect(execMock).toHaveBeenCalledWith('taskmgr');
  });
});
