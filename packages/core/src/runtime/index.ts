/**
 * BetterPwaRuntime — the main entry point.
 *
 * Wires together: State Engine, Lifecycle Bus, SW Registration,
 * Permission Orchestrator, Update Controller, Presets, and Cold Start.
 */
import { better } from "@better-logger/core";
import { StateEngine } from "../state/engine.js";
import { LifecycleBus } from "../lifecycle/bus.js";
import { registerServiceWorker } from "../lifecycle/sw-register.js";
import { PermissionEngine } from "../permissions/orchestrator.js";
import { UpdateController } from "../updates/controller.js";
import { ColdStartEngine } from "../boot/cold-start.js";
import { presets } from "../presets/index.js";
import type {
  BetterPwaConfig,
  BetterPwaPlugin,
  LifecycleEvent,
  LifecycleEventCallback,
  Unsubscribe,
  PwaState,
  StateKeys,
  StateSubscriber,
  PermissionResults,
  PermissionRequestOptions,
  UpdateStatus,
  GradualRolloutOptions,
  AppState,
  TransitionRecord,
} from "../types.js";

/**
 * Runtime instance returned by createPwa().
 */
class BetterPwaRuntime {
  #config: BetterPwaConfig;
  #stateEngine: StateEngine;
  #lifecycleBus: LifecycleBus;
  #permissionEngine: PermissionEngine;
  #updateController: UpdateController;
  #coldStartEngine: ColdStartEngine;
  #plugins: BetterPwaPlugin[] = [];
  #destroyed = false;

  constructor(config: BetterPwaConfig) {
    this.#config = { ...config };
    this.#stateEngine = new StateEngine();
    this.#lifecycleBus = new LifecycleBus();
    this.#permissionEngine = new PermissionEngine();
    this.#updateController = new UpdateController();
    this.#coldStartEngine = new ColdStartEngine(config);
    this.#registerTransitions();
    better.log.info("better-pwa:init", { config });
  }

  /** Initialize the runtime (async setup) */
  async init(): Promise<this> {
    await this.#stateEngine.init();

    // Register service worker
    if (this.#config.swUrl) {
      const registration = await registerServiceWorker(
        {
          swUrl: this.#config.swUrl,
          scope: this.#config.scope,
          onUpdateFound: (reg) => {
            this.#updateController.handleUpdateFound(reg);
          },
        },
        this.#lifecycleBus
      );

      if (registration) {
        this.#updateController = new UpdateController(registration);
      }
    }

    // Run cold start
    const bootResult = await this.#coldStartEngine.boot();

    // Transition to boot state
    await this.#lifecycleBus.transition("BOOT", {
      config: this.#config,
      state: this.#stateEngine.snapshot(),
    });

    // Transition based on boot result
    await this.#lifecycleBus.transition(bootResult.state, {
      config: this.#config,
      state: this.#stateEngine.snapshot(),
    });

    // Initialize plugins
    for (const plugin of this.#plugins) {
      try {
        plugin.onInit?.(this);
      } catch (err) {
        better.log.warn("better-pwa:plugin-init-error", { plugin: plugin.name, error: err });
      }
    }

    better.log.info("better-pwa:ready", { state: bootResult.state });
    return this;
  }

  // ─── State Engine API ───────────────────────────────────────────────────

  state = () => {
    const engine = this.#stateEngine;
    return {
      snapshot: (): Readonly<PwaState> => engine.snapshot(),
      subscribe: (keys: StateKeys[], cb: StateSubscriber): Unsubscribe =>
        engine.subscribe(keys, cb),
      set: async <T extends StateKeys>(key: T, value: PwaState[T]): Promise<void> =>
        engine.set(key, value),
      reset: async (): Promise<void> => engine.reset(),
    };
  };

  // ─── Lifecycle API ──────────────────────────────────────────────────────

  lifecycle = () => {
    const bus = this.#lifecycleBus;
    return {
      state: (): AppState => bus.state(),
      onTransition: (cb: (from: AppState, to: AppState, metadata: Record<string, unknown>) => void): Unsubscribe =>
        bus.onTransition(cb),
      blockedTransitions: (): TransitionRecord[] => bus.getBlockedTransitions(),
    };
  };

  // ─── Permissions API ────────────────────────────────────────────────────

  permissions = () => {
    const engine = this.#permissionEngine;
    return {
      request: (perms: string[], opts?: PermissionRequestOptions): Promise<PermissionResults> =>
        engine.request(perms, opts),
      status: (): PermissionResults => engine.status(),
      on: (event: "denied", cb: (permission: string, fallback: { show: (opts: Record<string, string>) => void }) => void): Unsubscribe =>
        engine.on(event, cb),
    };
  };

  // ─── Update API ─────────────────────────────────────────────────────────

  update = () => {
    const controller = this.#updateController;
    return {
      setStrategy: (s: "soft" | "hard" | "gradual" | "on-reload", o?: GradualRolloutOptions): void =>
        controller.setStrategy(s, o),
      on: (e: "update_available", cb: (version: string) => void): Unsubscribe =>
        controller.on(e, cb),
      activate: (): Promise<void> => controller.activate(),
      status: (): UpdateStatus => controller.status(),
    };
  };

  // ─── Event Bus ──────────────────────────────────────────────────────────

  on<T extends LifecycleEvent>(type: T["type"], cb: LifecycleEventCallback<T>): Unsubscribe {
    return this.#lifecycleBus.on(type, cb);
  }

  // ─── Plugin System ──────────────────────────────────────────────────────

  use(plugin: BetterPwaPlugin): void {
    this.#plugins.push(plugin);
    better.log.info("better-pwa:plugin-registered", { name: plugin.name, version: plugin.version });
  }

  // ─── Cleanup ────────────────────────────────────────────────────────────

  async destroy(): Promise<void> {
    if (this.#destroyed) return;
    this.#destroyed = true;

    this.#stateEngine.destroy();
    this.#lifecycleBus.destroy();
    this.#permissionEngine.destroy();
    this.#updateController.destroy();
    this.#plugins = [];

    better.log.info("better-pwa:destroyed");
  }

  // ─── Private ────────────────────────────────────────────────────────────

  #registerTransitions(): void {
    const bus = this.#lifecycleBus;

    bus.registerTransition({
      from: "IDLE", to: "BOOT",
      guard: () => true, action: async () => {}, onFail: () => "DEGRADED",
    });
    bus.registerTransition({
      from: "BOOT", to: "READY",
      guard: () => true, action: async () => {}, onFail: () => "DEGRADED",
    });
    bus.registerTransition({
      from: "BOOT", to: "DEGRADED",
      guard: () => true, action: async () => {}, onFail: () => "DEGRADED",
    });
    bus.registerTransition({
      from: "READY", to: "OFFLINE",
      guard: (ctx) => ctx.state.isOffline, action: async () => {}, onFail: () => "READY",
    });
    bus.registerTransition({
      from: "OFFLINE", to: "SYNCING",
      guard: (ctx) => !ctx.state.isOffline, action: async () => {}, onFail: () => "OFFLINE",
    });
    bus.registerTransition({
      from: "SYNCING", to: "STABLE",
      guard: () => true, action: async () => {}, onFail: () => "DEGRADED",
    });
    bus.registerTransition({
      from: "READY", to: "UPDATING",
      guard: (ctx) => Boolean(ctx.state.hasUpdate), action: async () => {}, onFail: () => "READY",
    });
    bus.registerTransition({
      from: "UPDATING", to: "READY",
      guard: () => true, action: async () => {}, onFail: () => "DEGRADED",
    });
    bus.registerTransition({
      from: "READY", to: "STABLE",
      guard: () => true, action: async () => {}, onFail: () => "READY",
    });
  }
}

/**
 * Create a new PWA runtime instance.
 *
 * ```ts
 * const pwa = createPwa({ preset: 'saas', swUrl: '/sw.js' });
 * await pwa.init();
 * ```
 */
function createPwa(config: BetterPwaConfig): BetterPwaRuntime {
  if (config.preset) {
    const preset = presets[config.preset as keyof typeof presets];
    if (preset) {
      config = { updateStrategy: preset.updateStrategy, ...config };
    }
  }
  return new BetterPwaRuntime(config);
}

export { BetterPwaRuntime, createPwa };
export type { BetterPwaConfig };
