import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CircuitBreaker } from '../../src/utils/circuit-breaker.js';

const THRESHOLD = 3;
const COOLDOWN_MS = 10_000;

const failing = () => Promise.reject(new Error('down'));

async function trip(breaker: CircuitBreaker) {
  for (let i = 0; i < THRESHOLD; i++) {
    await expect(breaker.run(failing, null)).rejects.toThrow('down');
  }
}

describe('CircuitBreaker', () => {
  let onOpen: jest.Mock<(failures: number) => void>;
  let onClose: jest.Mock<() => void>;
  let breaker: CircuitBreaker;

  beforeEach(() => {
    jest.useFakeTimers();
    onOpen = jest.fn();
    onClose = jest.fn();
    breaker = new CircuitBreaker({
      failureThreshold: THRESHOLD,
      cooldownMs: COOLDOWN_MS,
      onOpen,
      onClose,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('passes the result through while closed', async () => {
    await expect(breaker.run(() => Promise.resolve('ok'), null)).resolves.toBe('ok');
  });

  it('keeps calling the action until the failure threshold is reached', async () => {
    const action = jest.fn(failing);

    for (let i = 0; i < THRESHOLD; i++) {
      await expect(breaker.run(action, null)).rejects.toThrow('down');
    }

    expect(action).toHaveBeenCalledTimes(THRESHOLD);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('returns the fallback without calling the action while open', async () => {
    await trip(breaker);
    const action = jest.fn(() => Promise.resolve('ok'));

    await expect(breaker.run(action, 'fallback')).resolves.toBe('fallback');
    expect(action).not.toHaveBeenCalled();
  });

  it('resets the failure count after a success', async () => {
    await expect(breaker.run(failing, null)).rejects.toThrow();
    await expect(breaker.run(failing, null)).rejects.toThrow();
    await breaker.run(() => Promise.resolve('ok'), null);
    await expect(breaker.run(failing, null)).rejects.toThrow();
    await expect(breaker.run(failing, null)).rejects.toThrow();

    await expect(breaker.run(() => Promise.resolve('ok'), 'fallback')).resolves.toBe('ok');
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('lets a single probe through after the cooldown and closes when it succeeds', async () => {
    await trip(breaker);
    jest.advanceTimersByTime(COOLDOWN_MS);

    let release!: (value: string) => void;
    const probe = jest.fn(() => new Promise<string>((resolve) => (release = resolve)));
    const pending = breaker.run(probe, 'fallback');
    const concurrent = jest.fn(() => Promise.resolve('ok'));

    await expect(breaker.run(concurrent, 'fallback')).resolves.toBe('fallback');
    expect(concurrent).not.toHaveBeenCalled();

    release('ok');
    await expect(pending).resolves.toBe('ok');
    expect(onClose).toHaveBeenCalledTimes(1);
    await expect(breaker.run(concurrent, 'fallback')).resolves.toBe('ok');
  });

  it('reopens for another cooldown when the probe fails', async () => {
    await trip(breaker);
    jest.advanceTimersByTime(COOLDOWN_MS);

    await expect(breaker.run(failing, null)).rejects.toThrow('down');

    const action = jest.fn(() => Promise.resolve('ok'));
    await expect(breaker.run(action, 'fallback')).resolves.toBe('fallback');
    expect(action).not.toHaveBeenCalled();
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
