import { CircuitBreaker } from './utils/circuit-breaker.js';
import { logger } from './utils/logger.js';

const FAILURE_THRESHOLD = 5;
const COOLDOWN_MS = 10_000;

/** Shared by every Redis consumer so one outage trips the circuit for all of them. */
export const redisBreaker = new CircuitBreaker({
  failureThreshold: FAILURE_THRESHOLD,
  cooldownMs: COOLDOWN_MS,
  onOpen: (failures) =>
    logger.error('Redis circuit opened, skipping Redis calls', {
      failures,
      cooldownMs: COOLDOWN_MS,
    }),
  onClose: () => logger.info('Redis circuit closed'),
});
