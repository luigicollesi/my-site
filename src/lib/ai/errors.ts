export type AiAttemptOutcome =
  | 'http_error'
  | 'timeout'
  | 'empty'
  | 'guard_rejected'
  | 'deadline';

export type AiModelFailure = {
  model: string;
  status?: number;
  message: string;
  credentialIndex?: number;
  outcome?: AiAttemptOutcome;
  durationMs?: number;
};

export class AiModelsUnavailableError extends Error {
  status: number;
  failures: AiModelFailure[];

  constructor(message: string, failures: AiModelFailure[] = [], status = 503) {
    super(message);
    this.name = 'AiModelsUnavailableError';
    this.status = status;
    this.failures = failures;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Erro desconhecido';
}

export function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }

  const maybeStatus = (error as { status?: unknown }).status ?? (error as { code?: unknown }).code;
  return typeof maybeStatus === 'number' ? maybeStatus : undefined;
}

export function isTimeoutError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const searchable = `${error.name} ${error.message}`.toLowerCase();
  return searchable.includes('timeout') || searchable.includes('timed out') || searchable.includes('abort');
}
