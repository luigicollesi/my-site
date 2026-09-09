import OpenAI from 'openai';

import { getAiConfig } from '@/lib/ai/config';
import type { AiChatCompletionResult, AiProviderChatCompletionParams, AiProviderClient } from '@/lib/ai/types';

const OPENROUTER_REQUEST_TIMEOUT_MS = 7_000;

export function createOpenRouterClient(): AiProviderClient {
  const config = getAiConfig();

  const defaultHeaders: Record<string, string> = {};

  if (config.openRouter.appUrl) {
    defaultHeaders['HTTP-Referer'] = config.openRouter.appUrl;
  }

  if (config.openRouter.appName) {
    defaultHeaders['X-Title'] = config.openRouter.appName;
  }

  const clients = config.openRouter.apiKeys.map(
    (apiKey) =>
      new OpenAI({
        apiKey,
        baseURL: config.openRouter.baseUrl,
        defaultHeaders,
        maxRetries: 0,
        timeout: OPENROUTER_REQUEST_TIMEOUT_MS,
      }),
  );

  return {
    credentialCount: clients.length,

    async chatCompletion(params: AiProviderChatCompletionParams): Promise<AiChatCompletionResult> {
      const routing = config.openRouter.providerRouting;
      const provider =
        routing &&
        (routing.allowFallbacks !== undefined ||
          routing.dataCollection !== undefined ||
          routing.zdr !== undefined ||
          routing.only?.length ||
          routing.ignore?.length)
          ? {
              allow_fallbacks: routing.allowFallbacks,
              data_collection: routing.dataCollection,
              zdr: routing.zdr,
              only: routing.only,
              ignore: routing.ignore,
            }
          : undefined;

      const requestBody: Record<string, unknown> = {
        model: params.model,
        messages: params.messages,
        temperature: params.temperature,
        max_tokens: params.maxTokens,
      };

      if (params.fallbackModels?.length) {
        requestBody.models = params.fallbackModels;
      }

      if (params.reasoning) {
        requestBody.reasoning = params.reasoning;
      }

      if (provider) {
        // OpenRouter accepts `provider`, but `openai` SDK types don't declare it.
        requestBody.provider = provider;
      }

      const credentialIndex = params.credentialIndex ?? 0;
      const client = clients[credentialIndex];

      if (!client) {
        throw new Error(`Credencial OpenRouter inexistente no índice ${credentialIndex}.`);
      }

      const response = await client.chat.completions.create(requestBody as never);
      const choice = response.choices?.[0];
      const text = choice?.message?.content?.trim() || '';

      return {
        text,
        raw: response,
        model: response.model,
        finishReason: choice?.finish_reason ?? null,
        usage: response.usage
          ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            }
          : undefined,
      };
    },
  };
}
