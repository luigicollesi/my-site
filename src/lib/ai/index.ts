import { getAiClient } from '@/lib/ai/client';
import { getAiConfig } from '@/lib/ai/config';
import type { AiChatCompletionParams, AiChatCompletionResult } from '@/lib/ai/types';

export async function chatCompletion(params: AiChatCompletionParams): Promise<AiChatCompletionResult> {
  const config = getAiConfig();
  const client = getAiClient();

  if (config.debug) {
    console.debug(`[AI][request] provider=${config.provider} model=${config.model}`);
    console.debug('[AI][prompt]', params.messages);
  }

  try {
    const response = await client.chatCompletion(params);

    if (config.debug) {
      console.debug('[AI][raw-response]', response.raw);
    }

    return response;
  } catch (error) {
    if (config.debug) {
      console.error('[AI][error]', error);
    }
    throw error;
  }
}
