import OpenAI from 'openai';

import { getAiConfig } from '@/lib/ai/config';
import { getErrorStatus } from '@/lib/ai/errors';
import type { AiChatCompletionResult, AiProviderChatCompletionParams, AiProviderClient } from '@/lib/ai/types';

const OPENROUTER_REQUEST_TIMEOUT_MS = 20_000;

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

      for (let keyIndex = 0; keyIndex < clients.length; keyIndex += 1) {
        const client = clients[keyIndex];

        try {
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
        } catch (error) {
          const status = getErrorStatus(error);
          const hasNextCredential = keyIndex < clients.length - 1;

          // Credential failover is only for an invalid/revoked key. Do not rotate
          // on 429 or quota/provider limits.
          if (status === 401 && hasNextCredential) {
            if (config.debug) {
              console.warn(`[AI][auth] OpenRouter keyIndex=${keyIndex} rejected with 401; trying next credential.`);
            }
            continue;
          }

          throw error;
        }
      }

      throw new Error('Nenhuma credencial válida do OpenRouter está disponível.');
    },
  };
}
