/**
 * Global dispatcher configuration for undici
 *
 * IMPORTANT: setGlobalDispatcher() from undici sets a process-wide dispatcher
 * that affects ALL fetch() calls, not just those from this library. This is a
 * fundamental limitation of how Node.js native fetch works with undici.
 *
 * Design implications:
 * - Configuration must happen once, before any fetch calls
 * - Multiple GdeltClient instances cannot have different connection timeouts
 * - A warning is logged if reconfiguration is attempted with a different value
 */

import { Agent, setGlobalDispatcher } from 'undici';

/** Tracks whether the dispatcher has been configured */
let dispatcherConfigured = false;

/** Stores the currently configured timeout value */
let configuredTimeout: number | undefined;

/** Default connection timeout in milliseconds */
const DEFAULT_CONNECT_TIMEOUT = 60000;

/**
 * Configures the global undici dispatcher with the specified connect timeout.
 * This only takes effect on the first call; subsequent calls log a warning
 * if a different timeout is requested.
 *
 * @param connectTimeout - Connection timeout in milliseconds
 * @returns The actual timeout being used
 */
export function configureDispatcher(connectTimeout?: number): number {
  const timeout = connectTimeout ?? DEFAULT_CONNECT_TIMEOUT;

  if (!dispatcherConfigured) {
    setGlobalDispatcher(new Agent({
      connect: {
        timeout
      }
    }));
    dispatcherConfigured = true;
    configuredTimeout = timeout;
    return timeout;
  }

  // Already configured - warn if different timeout requested
  if (timeout !== configuredTimeout) {
    console.warn(
      `GdeltClient: connectTimeout (${timeout}ms) ignored. ` +
      `Global dispatcher already configured with ${configuredTimeout}ms. ` +
      `Only the first client's connectTimeout takes effect.`
    );
  }

  return configuredTimeout!;
}

/**
 * Returns the currently configured connect timeout, or undefined if not yet configured.
 * @returns The configured timeout in milliseconds, or undefined
 */
export function getConfiguredTimeout(): number | undefined {
  return configuredTimeout;
}

/**
 * Returns whether the dispatcher has been configured.
 * @returns True if the dispatcher has been configured
 */
export function isDispatcherConfigured(): boolean {
  return dispatcherConfigured;
}

/**
 * Resets the dispatcher state for testing purposes only.
 * WARNING: This does not actually reset the global dispatcher in undici.
 * It only resets the tracking state in this module.
 * @internal
 */
export function resetDispatcherStateForTesting(): void {
  dispatcherConfigured = false;
  configuredTimeout = undefined;
}
