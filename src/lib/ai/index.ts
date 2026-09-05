import { getAiClient } from '@/lib/ai/client';
import { getAiConfig } from '@/lib/ai/config';
import { AiModelsUnavailableError, getErrorMessage, getErrorStatus, type AiModelFailure } from '@/lib/ai/errors';
import { getFreeTextModels } from '@/lib/ai/providers/openrouter-models';
import type { AiChatCompletionParams, AiChatCompletionResult } from '@/lib/ai/types';

const MODEL_STANDOFF_MS = 24 * 60 * 60 * 1000;
const MAX_MODELS_PER_REQUEST = 5;

const modelStandoffUntil = new Map<string, number>();

function getAvailableModels(models: string[], now: number): string[] {
  return models.filter((model) => (modelStandoffUntil.get(model) ?? 0) <= now);
}

function putModelInStandoff(model: string, now: number): void {
  modelStandoffUntil.set(model, now + MODEL_STANDOFF_MS);
}

export async function chatCompletion(params: AiChatCompletionParams): Promise<AiChatCompletionResult> {
  const config = getAiConfig();
  const client = getAiClient();
  const now = Date.now();
  const discoveredModels = await getFreeTextModels();
  const models = getAvailableModels(discoveredModels, now).slice(0, MAX_MODELS_PER_REQUEST);

  if (!models.length) {
    throw new AiModelsUnavailableError(
      'Os modelos gratuitos text-to-text disponíveis estão temporariamente em stand off.',
    );
  }

  if (config.debug) {
    console.debug(
      `[AI][models] discovered=${discoveredModels.length} available=${models.length}`,
      models,
    );
  }

  const failures: AiModelFailure[] = [];

  for (const model of models) {
    if (config.debug) {
      console.debug(`[AI][request] provider=${config.provider} model=${model}`);
      console.debug('[AI][prompt]', params.messages);
    }

    try {
      const response = await client.chatCompletion({ ...params, model });

      if (config.debug) {
        console.debug('[AI][raw-response]', response.raw);
      }

      return response;
    } catch (error) {
      const failedAt = Date.now();
      putModelInStandoff(model, failedAt);
      failures.push({
        model,
        status: getErrorStatus(error),
        message: getErrorMessage(error),
      });

      if (config.debug) {
        const standoffUntil = new Date(failedAt + MODEL_STANDOFF_MS).toISOString();
        console.error(`[AI][error] model=${model} standoffUntil=${standoffUntil}`, error);
      }
    }
  }

  const allRateLimited = failures.length > 0 && failures.every((failure) => failure.status === 429);
  const hasRateLimit = failures.some((failure) => failure.status === 429);
  const status = allRateLimited ? 429 : hasRateLimit ? 503 : 502;

  throw new AiModelsUnavailableError(
    `Os modelos gratuitos tentados falharam: ${failures.map(({ model }) => model).join(', ')}`,
    failures,
    status,
  );
}
