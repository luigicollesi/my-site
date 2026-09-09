import { runAiAttemptOrchestrator } from '@/lib/ai/attempt-orchestrator';
import { getAiClient } from '@/lib/ai/client';
import { getAiConfig } from '@/lib/ai/config';
import { AiModelsUnavailableError } from '@/lib/ai/errors';
import { selectPortfolioModels } from '@/lib/ai/model-policy';
import { getFreeTextModels } from '@/lib/ai/providers/openrouter-models';
import type { AiChatCompletionParams, AiChatCompletionResult } from '@/lib/ai/types';

const MAX_MODELS_PER_RUN = 8;

export async function chatCompletion(params: AiChatCompletionParams): Promise<AiChatCompletionResult> {
  const config = getAiConfig();
  const client = getAiClient();
  const discoveredModels = await getFreeTextModels();
  const selectedModels = selectPortfolioModels(discoveredModels, MAX_MODELS_PER_RUN);
  const modelIds = selectedModels.map(({ id }) => id);

  if (!modelIds.length) {
    throw new AiModelsUnavailableError(
      'Nenhum modelo gratuito adequado ao assistente de portfólio está disponível no momento.',
      [],
      503,
    );
  }

  if (config.debug) {
    console.debug(
      `[AI][request] provider=${config.provider} discovered=${discoveredModels.length} ` +
        `selected=${modelIds.length} credentials=${client.credentialCount} models=${modelIds.join(' -> ')}`,
    );
  }

  const response = await runAiAttemptOrchestrator({
    client,
    models: modelIds,
    completion: params,
    debug: config.debug,
  });

  if (config.debug) {
    console.debug(
      `[AI][response] resolvedModel=${response.model ?? 'unknown'} finishReason=${response.finishReason ?? 'unknown'} ` +
        `promptTokens=${response.usage?.promptTokens ?? 'unknown'} completionTokens=${response.usage?.completionTokens ?? 'unknown'}`,
    );
  }

  return response;
}
