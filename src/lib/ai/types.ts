export type LlmProvider = 'openrouter';

export type AiRole = 'system' | 'user' | 'assistant';

export type AiChatMessage = {
  role: AiRole;
  content: string;
};

export type AiChatCompletionParams = {
  messages: AiChatMessage[];
  temperature?: number;
  maxTokens?: number;
};

export type AiReasoningConfig = {
  effort?: 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh' | 'max';
  exclude?: boolean;
  enabled?: boolean;
};

export type AiProviderChatCompletionParams = AiChatCompletionParams & {
  model: string;
  fallbackModels?: string[];
  reasoning?: AiReasoningConfig;
};

export type AiChatCompletionResult = {
  text: string;
  raw: unknown;
  model?: string;
  finishReason?: string | null;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
};

export type AiProviderClient = {
  chatCompletion(params: AiProviderChatCompletionParams): Promise<AiChatCompletionResult>;
};

export type OpenRouterConfig = {
  apiKeys: string[];
  baseUrl: string;
  appName?: string;
  appUrl?: string;
  providerRouting?: {
    allowFallbacks?: boolean;
    dataCollection?: 'allow' | 'deny';
    zdr?: boolean;
    only?: string[];
    ignore?: string[];
  };
};

export type AiConfig = {
  provider: LlmProvider;
  debug: boolean;
  openRouter: OpenRouterConfig;
};
