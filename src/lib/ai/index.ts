import { getAiClient } from '@/lib/ai/client';
import { getAiConfig } from '@/lib/ai/config';
import { AiModelsUnavailableError, getErrorMessage, getErrorStatus, type AiModelFailure } from '@/lib/ai/errors';
import { getFreeTextModels } from '@/lib/ai/providers/openrouter-models';
import type { AiChatCompletionParams, AiChatCompletionResult } from '@/lib/ai/types';

const MAX_MODELS_PER_REQUEST = 3;

export async function chatCompletion(params: AiChatCompletionParams): Promise<AiChatCompletionResult> {
  const config = getAiConfig();
  const client = getAiClient();
  const models = (await getFreeTextModels()).slice(0, MAX_MODELS_PER_REQUEST);

  if (!models.length) {
    throw new AiModelsUnavailableError('Nenhum modelo gratuito text-to-text está disponível no momento.');
  }

  const [model, ...fallbackModels] = models;

  if (config.debug) {
    console.debug(
      `[AI][request] provider=${config.provider} model=${model} fallbacks=${fallbackModels.length}`,
      fallbackModels,
    );
    console.debug('[AI][prompt]', params.messages);
  }

  try {
    const response = await client.chatCompletion({
      ...params,
      model,
      fallbackModels,
    });

    if (config.debug) {
      console.debug('[AI][raw-response]', response.raw);
    }

    return response;
  } catch (error) {
    const failure: AiModelFailure = {
      model: models.join(' -> '),
      status: getErrorStatus(error),
      message: getErrorMessage(error),
    };

    if (config.debug) {
      console.error(`[AI][error] models=${models.join(' -> ')}`, error);
    }

    const status = failure.status === 429 ? 429 : 502;

    throw new AiModelsUnavailableError(
      `A requisição aos modelos gratuitos falhou: ${models.join(', ')}`,
      [failure],
      status,
    );
  }
}
