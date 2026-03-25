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

export type AiChatCompletionResult = {
  text: string;
  raw: unknown;
};

export type AiProviderClient = {
  chatCompletion(params: AiChatCompletionParams): Promise<AiChatCompletionResult>;
};

export type OpenRouterConfig = {
  apiKey: string;
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
  model: string;
  debug: boolean;
  openRouter: OpenRouterConfig;
};
