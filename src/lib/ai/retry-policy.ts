import type { AiModelFailure } from '@/lib/ai/errors';

export type AiRetryAction = 'NEXT_MODEL' | 'NEXT_KEY' | 'STOP';

const STOP_STATUSES = new Set([400, 402, 422]);
const BACKOFF_STATUSES = new Set([408, 429, 500, 502, 503, 524, 529]);

const MODEL_SCOPED_403_PATTERNS = [
  /only available on agentic harnesses/i,
  /model .* (?:is )?not available/i,
  /model access/i,
  /not available for (?:this|your) application/i,
];

const ACCOUNT_SCOPED_403_PATTERNS = [
  /guardrail restrictions/i,
  /data policy/i,
  /privacy/i,
  /permission/i,
  /organization/i,
];

function classifyForbidden(message: string): AiRetryAction {
  if (MODEL_SCOPED_403_PATTERNS.some((pattern) => pattern.test(message))) {
    return 'NEXT_MODEL';
  }

  if (ACCOUNT_SCOPED_403_PATTERNS.some((pattern) => pattern.test(message))) {
    return 'STOP';
  }

  // A generic 403 can still be specific to one model/provider. Prefer trying
  // another already validated model rather than aborting the whole sweep.
  return 'NEXT_MODEL';
}

export function classifyAiFailure(status?: number, message = ''): AiRetryAction {
  if (status === 401) return 'NEXT_KEY';
  if (status === 403) return classifyForbidden(message);
  if (status !== undefined && STOP_STATUSES.has(status)) return 'STOP';
  return 'NEXT_MODEL';
}

export function shouldBackoffBeforeNextModel(status?: number): boolean {
  return status !== undefined && BACKOFF_STATUSES.has(status);
}

export function shouldTryNextCredentialAfterSweep(failures: AiModelFailure[]): boolean {
  if (!failures.length) return false;

  // A 429/402 reflects provider/account limiting, so do not use another key as
  // a mechanism to evade the same limit after the model sweep is exhausted.
  if (failures.some((failure) => failure.status === 429 || failure.status === 402)) {
    return false;
  }

  if (
    failures.some(
      (failure) =>
        failure.status !== undefined &&
        (STOP_STATUSES.has(failure.status) ||
          (failure.status === 403 && classifyForbidden(failure.message) === 'STOP')),
    )
  ) {
    return false;
  }

  return true;
}
