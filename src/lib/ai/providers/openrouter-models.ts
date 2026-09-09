import { getAiConfig } from '@/lib/ai/config';

const MODEL_CATALOG_CACHE_MS = 15 * 60 * 1000;
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
      model.id.endsWith(':free') &&
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

function buildCatalogHeaders(): Record<string, string> {
  const config = getAiConfig();
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (config.openRouter.appUrl) {
    headers['HTTP-Referer'] = config.openRouter.appUrl;
  }

  if (config.openRouter.appName) {
    headers['X-Title'] = config.openRouter.appName;
  }

  return headers;
}

async function fetchFreeTextModels(): Promise<OpenRouterModelDescriptor[]> {
  const config = getAiConfig();
  const baseUrl = config.openRouter.baseUrl.replace(/\/$/, '');
  const url = new URL(`${baseUrl}/models`);

  // Keep the server-side query deliberately broad and stable. Eligibility for
  // text input, required parameters and zero pricing is enforced locally below,
  // so catalog discovery does not depend on provider/quota-specific filters.
  url.searchParams.set('output_modalities', 'text');
  url.searchParams.set('sort', 'most-popular');

  const response = await fetch(url, {
    method: 'GET',
    headers: buildCatalogHeaders(),
    cache: 'no-store',
    signal: AbortSignal.timeout(MODEL_CATALOG_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Falha ao consultar catálogo público do OpenRouter (${response.status}).`);
  }

  const body = (await response.json()) as OpenRouterModelsResponse;
  const rawModels = body.data ?? [];
  const models = rawModels.filter(isFreeTextModel);

  if (config.debug) {
    console.debug(`[AI][models] publicCatalog=${rawModels.length} freeTextEligible=${models.length}`);
  }

  return models;
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

    if (getAiConfig().debug) {
      console.warn('[AI][models] catálogo público não produziu modelos gratuitos elegíveis.');
    }
  } catch (error) {
    if (getAiConfig().debug) {
      console.error('[AI][models] falha ao atualizar catálogo público gratuito', error);
    }
  }

  // A stale catalog that was previously validated is safer than turning a
  // transient discovery failure into an immediate outage.
  if (cachedCatalog?.models.length) {
    return cachedCatalog.models;
  }

  // Do not cache an empty result: serverless instances must be able to recover
  // immediately on the next request when the public catalog becomes available.
  return [];
}
