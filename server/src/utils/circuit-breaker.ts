interface CircuitBreakerOptions {
  failureThreshold: number;
  cooldownMs: number;
  onOpen?: (failures: number) => void;
  onClose?: () => void;
}

/**
 * Stops calling a failing dependency for `cooldownMs` after `failureThreshold` consecutive failures.
 * After the cooldown one caller is let through as a probe; the others keep getting the fallback until it settles.
 */
export class CircuitBreaker {
  private failures = 0;
  private openUntil = 0;

  constructor(private readonly options: CircuitBreakerOptions) {}

  /** Runs the action, or returns the fallback without calling it while the circuit is open; failures are rethrown. */
  async run<T, F = T>(action: () => Promise<T>, fallback: F): Promise<T | F> {
    const now = Date.now();

    if (now < this.openUntil) {
      return fallback;
    }

    if (this.failures >= this.options.failureThreshold) {
      this.openUntil = now + this.options.cooldownMs;
    }

    try {
      const result = await action();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordSuccess(): void {
    const wasTripped = this.failures >= this.options.failureThreshold;
    this.failures = 0;
    this.openUntil = 0;
    if (wasTripped) this.options.onClose?.();
  }

  private recordFailure(): void {
    this.failures += 1;
    if (this.failures >= this.options.failureThreshold) {
      const wasClosed = this.openUntil === 0;
      this.openUntil = Date.now() + this.options.cooldownMs;
      if (wasClosed) this.options.onOpen?.(this.failures);
    }
  }
}
