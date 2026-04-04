// test/setup.ts — Global test setup for all packages
import 'fake-indexeddb/auto';
import { BroadcastChannel } from 'broadcastchannel-polyfill';

// Polyfill BroadcastChannel for jsdom
if (typeof globalThis.BroadcastChannel === 'undefined') {
  (globalThis as unknown as Record<string, unknown>).BroadcastChannel = BroadcastChannel;
}

// Mock navigator.serviceWorker for all tests
const mockServiceWorker = {
  ready: Promise.resolve({} as ServiceWorkerRegistration),
  register: vi.fn().mockResolvedValue({} as ServiceWorkerRegistration),
  getRegistration: vi.fn().mockResolvedValue(undefined as ServiceWorkerRegistration | undefined),
  getRegistrations: vi.fn().mockResolvedValue([] as ServiceWorkerRegistration[]),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

Object.defineProperty(globalThis.navigator, 'serviceWorker', {
  value: mockServiceWorker,
  writable: true,
});

// Mock navigator.onLine
Object.defineProperty(globalThis.navigator, 'onLine', {
  value: true,
  writable: true,
});

// Mock navigator.connection
Object.defineProperty(globalThis.navigator, 'connection', {
  value: {
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
  writable: true,
});

// Mock window.matchMedia
globalThis.matchMedia = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Mock IDB
globalThis.indexedDB = globalThis.indexedDB || (globalThis as unknown as Record<string, unknown>).indexedDB;

// Mock storage manager
Object.defineProperty(navigator, 'storage', {
  value: {
    estimate: vi.fn().mockResolvedValue({ usage: 1000, quota: 1000000000 }),
    persist: vi.fn().mockResolvedValue(true),
    persisted: vi.fn().mockResolvedValue(false),
  },
  writable: true,
});

// Mock beforeinstallprompt
Object.defineProperty(window, 'BeforeInstallPromptEvent', {
  value: class BeforeInstallPromptEvent extends Event {},
  writable: true,
  configurable: true,
});

// Silence better-logger in tests
try {
  const { better } = await import('@better-logger/core');
  better.setEnabled(false);
} catch {
  // Logger not available yet, skip
}
