import {
  AiModelsUnavailableError,
  getErrorMessage,
  getErrorStatus,
  isTimeoutError,
  type AiModelFailure,
} from '@/lib/ai/errors';
import { validateAiResponse } from '@/lib/ai/response-guard';
import {
  classifyAiFailure,
  shouldBackoffBeforeNextModel,
  shouldTryNextCredentialAfterSweep,
} from '@/lib/ai/retry-policy';
import type {
  AiChatCompletionParams,
  AiChatCompletionResult,
  AiProviderClient,
} from '@/lib/ai/types';

const GLOBAL_AI_DEADLINE_MS = 25_000;
const RETRY_BACKOFF_MS = 150;

export type AiAttemptOrchestratorParams = {
  client: AiProviderClient;
  models: string[];
  completion: AiChatCompletionParams;
  debug?: boolean;
};

function logAttempt(
  debug: boolean | undefined,
  data: {
    credentialIndex: number;
    model: string;
    outcome: string;
    durationMs: number;
    status?: number;
    action?: string;
  },
): void {
  if (!debug) return;

  console.debug(
    `[AI][attempt] keyIndex=${data.credentialIndex} model=${data.model} outcome=${data.outcome} ` +
      `status=${data.status ?? 'none'} action=${data.action ?? 'return'} durationMs=${data.durationMs}`,
  );
}

async function backoffWithinDeadline(deadlineAt: number): Promise<void> {
  const remainingMs = deadlineAt - Date.now();
  if (remainingMs <= 0) return;

  await new Promise<void>((resolve) => {
    setTimeout(resolve, Math.min(RETRY_BACKOFF_MS, remainingMs));
  });
}

function unavailable(failures: AiModelFailure[]): AiModelsUnavailableError {
  return new AiModelsUnavailableError(
    'Nenhuma tentativa de IA produziu uma resposta válida dentro do orçamento disponível.',
    failures,
    503,
  );
}

export async function runAiAttemptOrchestrator(
  params: AiAttemptOrchestratorParams,
): Promise<AiChatCompletionResult> {
  const { client, models, completion, debug } = params;
  const failures: AiModelFailure[] = [];
  const deadlineAt = Date.now() + GLOBAL_AI_DEADLINE_MS;

  if (!models.length || client.credentialCount < 1) {
    throw unavailable(failures);
  }

  credentialLoop: for (
    let credentialIndex = 0;
    credentialIndex < client.credentialCount;
    credentialIndex += 1
  ) {
    const credentialFailureStart = failures.length;

    for (const model of models) {
      if (Date.now() >= deadlineAt) {
        failures.push({
          model: 'orchestrator',
          credentialIndex,
          outcome: 'deadline',
          message: 'Deadline global da IA atingido.',
        });
        break credentialLoop;
      }

      const startedAt = Date.now();

      try {
        const response = await client.chatCompletion({
          ...completion,
          model,
          credentialIndex,
          reasoning: {
            effort: 'none',
            exclude: true,
          },
        });
        const durationMs = Date.now() - startedAt;

        if (!response.text.trim()) {
          failures.push({
            model,
            credentialIndex,
            outcome: 'empty',
            durationMs,
            message: 'O modelo retornou uma resposta vazia.',
          });
          logAttempt(debug, {
            credentialIndex,
            model,
            outcome: 'empty',
            durationMs,
            action: 'NEXT_MODEL',
          });
          continue;
        }

        const validation = validateAiResponse(response.text);

        if (!validation.valid) {
          failures.push({
            model: response.model ?? model,
            credentialIndex,
            outcome: 'guard_rejected',
            durationMs,
            message: `Resposta rejeitada pelo guard: ${validation.reason}`,
          });
          logAttempt(debug, {
            credentialIndex,
            model: response.model ?? model,
            outcome: 'guard_rejected',
            durationMs,
            action: 'NEXT_MODEL',
          });
          continue;
        }

        logAttempt(debug, {
          credentialIndex,
          model: response.model ?? model,
          outcome: 'success',
          durationMs,
        });
        return response;
      } catch (error) {
        const durationMs = Date.now() - startedAt;
        const status = getErrorStatus(error);
        const message = getErrorMessage(error);
        const action = classifyAiFailure(status, message);
        const outcome = isTimeoutError(error) ? 'timeout' : 'http_error';

        failures.push({
          model,
          credentialIndex,
          status,
          outcome,
          durationMs,
          message,
        });

        logAttempt(debug, {
          credentialIndex,
          model,
          outcome,
          durationMs,
          status,
          action,
        });

        if (action === 'STOP') {
          throw unavailable(failures);
        }

        if (action === 'NEXT_KEY') {
          continue credentialLoop;
        }

        if (shouldBackoffBeforeNextModel(status)) {
          await backoffWithinDeadline(deadlineAt);
        }
      }
    }

    const credentialFailures = failures.slice(credentialFailureStart);

    if (!shouldTryNextCredentialAfterSweep(credentialFailures)) {
      break;
    }
  }

  throw unavailable(failures);
}
