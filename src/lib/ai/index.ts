import { getAiClient } from '@/lib/ai/client';
import { getAiConfig } from '@/lib/ai/config';
import { AiModelsUnavailableError, getErrorMessage, getErrorStatus, type AiModelFailure } from '@/lib/ai/errors';
import { selectPortfolioModels } from '@/lib/ai/model-policy';
import { getFreeTextModels } from '@/lib/ai/providers/openrouter-models';
import { validateAiResponse } from '@/lib/ai/response-guard';
import type { AiChatCompletionParams, AiChatCompletionResult } from '@/lib/ai/types';

const MAX_MODELS_PER_REQUEST = 3;

export async function chatCompletion(params: AiChatCompletionParams): Promise<AiChatCompletionResult> {
  const config = getAiConfig();
  const client = getAiClient();
  const discoveredModels = await getFreeTextModels();
  const selectedModels = selectPortfolioModels(discoveredModels, MAX_MODELS_PER_REQUEST);
  const modelIds = selectedModels.map(({ id }) => id);

  if (!modelIds.length) {
    throw new AiModelsUnavailableError(
      'Nenhum modelo gratuito adequado ao assistente de portfólio está disponível no momento.',
    );
  }

  const [model, ...fallbackModels] = modelIds;

  if (config.debug) {
    console.debug(
      `[AI][request] provider=${config.provider} discovered=${discoveredModels.length} selected=${modelIds.join(' -> ')}`,
    );
  }

  let response: AiChatCompletionResult;

  try {
    response = await client.chatCompletion({
      ...params,
      model,
      fallbackModels,
      reasoning: {
        effort: 'none',
        exclude: true,
      },
    });
  } catch (error) {
    const failure: AiModelFailure = {
      model: modelIds.join(' -> '),
      status: getErrorStatus(error),
      message: getErrorMessage(error),
    };

    if (config.debug) {
      console.error(`[AI][error] models=${modelIds.join(' -> ')}`, error);
    }

    const status = failure.status === 429 ? 429 : 502;

    throw new AiModelsUnavailableError(
      `A requisição aos modelos gratuitos falhou: ${modelIds.join(', ')}`,
      [failure],
      status,
    );
  }

  const validation = validateAiResponse(response.text);

  if (!validation.valid) {
    if (config.debug) {
      console.error(
        `[AI][guard] rejected=true reason=${validation.reason} resolvedModel=${response.model ?? 'unknown'}`,
      );
    }

    throw new AiModelsUnavailableError(
      'A resposta do modelo foi rejeitada por não atender às regras do assistente.',
      [
        {
          model: response.model ?? modelIds.join(' -> '),
          message: `Resposta rejeitada pelo guard: ${validation.reason}`,
        },
      ],
      502,
    );
  }

  if (config.debug) {
    console.debug(
      `[AI][response] resolvedModel=${response.model ?? 'unknown'} finishReason=${response.finishReason ?? 'unknown'} ` +
        `promptTokens=${response.usage?.promptTokens ?? 'unknown'} completionTokens=${response.usage?.completionTokens ?? 'unknown'}`,
    );
  }

  return response;
}
