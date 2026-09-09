import type { AiModelFailure } from '@/lib/ai/errors';

export type AiRetryAction = 'NEXT_MODEL' | 'NEXT_KEY' | 'STOP';

const STOP_STATUSES = new Set([400, 402, 403, 422]);
const BACKOFF_STATUSES = new Set([408, 429, 500, 502, 503, 524, 529]);

export function classifyAiFailure(status?: number): AiRetryAction {
  if (status === 401) return 'NEXT_KEY';
  if (status !== undefined && STOP_STATUSES.has(status)) return 'STOP';
  return 'NEXT_MODEL';
}

export function shouldBackoffBeforeNextModel(status?: number): boolean {
  return status !== undefined && BACKOFF_STATUSES.has(status);
}

export function shouldTryNextCredentialAfterSweep(failures: AiModelFailure[]): boolean {
  if (!failures.length) return false;

  // Do not rotate credentials after a quota/rate-limit response. A different key
  // must not be used as a mechanism to bypass provider limits.
  if (failures.some((failure) => failure.status === 429 || failure.status === 402)) {
    return false;
  }

  if (failures.some((failure) => failure.status !== undefined && STOP_STATUSES.has(failure.status))) {
    return false;
  }

  return true;
}
