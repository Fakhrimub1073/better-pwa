/**
 * @better-pwa/adapter-react — React hooks for better-pwa.
 * Phase 1: Stub. Full implementation in v0.3.
 */
export interface PwaStateShape {
  isOffline: boolean;
  isInstalled: boolean;
}

export function usePwaState(): PwaStateShape {
  return { isOffline: false, isInstalled: false };
}

export function usePwaUpdate() {
  return { activate: async () => {} };
}
