import { getAiConfig } from '@/lib/ai/config';

const MODEL_CATALOG_CACHE_MS = 15 * 60 * 1000;
const MODEL_CATALOG_FAILURE_CACHE_MS = 60 * 1000;
const MODEL_CATALOG_TIMEOUT_MS = 5000;
const FREE_ROUTER_MODEL = 'openrouter/free';
const REQUIRED_PARAMETERS = ['temperature', 'max_tokens'];

export type OpenRouterReasoningMetadata = {
  supported_efforts?: string[] | null;
  default_effort?: string | null;
  default_enabled?: boolean;
  mandatory?: boolean;
};

type OpenRouterPricingOverride = {
  prompt?: string;
  completion?: string;
  request?: string;
  internal_reasoning?: string;
};

export type OpenRouterModelDescriptor = {
  id: string;
  canonical_slug?: string;
  name?: string;
  description?: string;
  context_length?: number;
  architecture?: {
    input_modalities?: string[];
    output_modalities?: string[];
  };
  pricing?: {
    prompt?: string;
    completion?: string;
    request?: string;
    internal_reasoning?: string;
    overrides?: OpenRouterPricingOverride[];
  };
  supported_parameters?: string[];
  reasoning?: OpenRouterReasoningMetadata;
  expiration_date?: string | null;
};

type OpenRouterModel = Omit<OpenRouterModelDescriptor, 'id'> & {
  id?: string;
};

type OpenRouterModelsResponse = {
  data?: OpenRouterModel[];
};

type CachedCatalog = {
  expiresAt: number;
  models: OpenRouterModelDescriptor[];
};

let cachedCatalog: CachedCatalog | null = null;

function isZeroPrice(value: string | undefined, required = false): boolean {
  if (value === undefined || value === '') {
    return !required;
  }

  const price = Number(value);
  return Number.isFinite(price) && price === 0;
}

function hasOnlyZeroPriceOverrides(overrides: OpenRouterPricingOverride[] | undefined): boolean {
  return (overrides ?? []).every(
    (override) =>
      isZeroPrice(override.prompt) &&
      isZeroPrice(override.completion) &&
      isZeroPrice(override.request) &&
      isZeroPrice(override.internal_reasoning),
  );
}

function isExpired(expirationDate?: string | null): boolean {
  if (!expirationDate) return false;
  const expiresAt = Date.parse(expirationDate);
  return Number.isFinite(expiresAt) && expiresAt <= Date.now();
}

function supportsRequiredParameters(model: OpenRouterModel): boolean {
  const supported = model.supported_parameters ?? [];
  return REQUIRED_PARAMETERS.every((parameter) => supported.includes(parameter));
}

function isFreeTextModel(model: OpenRouterModel): model is OpenRouterModelDescriptor {
  const inputModalities = model.architecture?.input_modalities ?? [];
  const outputModalities = model.architecture?.output_modalities ?? [];

  return Boolean(
    model.id &&
      model.id !== FREE_ROUTER_MODEL &&
      inputModalities.includes('text') &&
      outputModalities.includes('text') &&
      supportsRequiredParameters(model) &&
      isZeroPrice(model.pricing?.prompt, true) &&
      isZeroPrice(model.pricing?.completion, true) &&
      isZeroPrice(model.pricing?.request) &&
      isZeroPrice(model.pricing?.internal_reasoning) &&
      hasOnlyZeroPriceOverrides(model.pricing?.overrides) &&
      !isExpired(model.expiration_date),
  );
}

async function fetchFreeTextModels(): Promise<OpenRouterModelDescriptor[]> {
  const config = getAiConfig();
  const baseUrl = config.openRouter.baseUrl.replace(/\/$/, '');
  const url = new URL(`${baseUrl}/models`);

  url.searchParams.set('input_modalities', 'text');
  url.searchParams.set('output_modalities', 'text');
  url.searchParams.set('supported_parameters', REQUIRED_PARAMETERS.join(','));
  url.searchParams.set('max_price', '0');
  url.searchParams.set('sort', 'most-popular');

  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.openRouter.apiKey}`,
    Accept: 'application/json',
  };

  if (config.openRouter.appUrl) {
    headers['HTTP-Referer'] = config.openRouter.appUrl;
  }

  if (config.openRouter.appName) {
    headers['X-Title'] = config.openRouter.appName;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers,
    cache: 'no-store',
    signal: AbortSignal.timeout(MODEL_CATALOG_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Falha ao consultar modelos gratuitos do OpenRouter (${response.status}).`);
  }

  const body = (await response.json()) as OpenRouterModelsResponse;
  return (body.data ?? []).filter(isFreeTextModel);
}

export async function getFreeTextModels(): Promise<OpenRouterModelDescriptor[]> {
  const now = Date.now();

  if (cachedCatalog && cachedCatalog.expiresAt > now) {
    return cachedCatalog.models;
  }

  try {
    const models = await fetchFreeTextModels();

    if (models.length) {
      cachedCatalog = {
        expiresAt: now + MODEL_CATALOG_CACHE_MS,
        models,
      };
      return models;
    }
  } catch (error) {
    if (getAiConfig().debug) {
      console.error('[AI][models] falha ao atualizar catálogo gratuito', error);
    }
  }

  // Reuse a previously validated catalog when discovery is temporarily unavailable.
  if (cachedCatalog?.models.length) {
    return cachedCatalog.models;
  }

  // Fail closed instead of delegating to openrouter/free, which chooses a random free model.
  cachedCatalog = {
    expiresAt: now + MODEL_CATALOG_FAILURE_CACHE_MS,
    models: [],
  };

  return cachedCatalog.models;
}
