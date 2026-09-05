import { getAiConfig } from '@/lib/ai/config';

const MODEL_CATALOG_CACHE_MS = 15 * 60 * 1000;
const FREE_ROUTER_MODEL = 'openrouter/free';

type OpenRouterModel = {
  id?: string;
  architecture?: {
    input_modalities?: string[];
    output_modalities?: string[];
  };
  pricing?: {
    prompt?: string;
    completion?: string;
    request?: string;
  };
  expiration_date?: string | null;
};

type OpenRouterModelsResponse = {
  data?: OpenRouterModel[];
};

type CachedCatalog = {
  expiresAt: number;
  models: string[];
};

let cachedCatalog: CachedCatalog | null = null;

function isZeroPrice(value: string | undefined, required = false): boolean {
  if (value === undefined || value === '') {
    return !required;
  }

  const price = Number(value);
  return Number.isFinite(price) && price === 0;
}

function isExpired(expirationDate?: string | null): boolean {
  if (!expirationDate) return false;
  const expiresAt = Date.parse(expirationDate);
  return Number.isFinite(expiresAt) && expiresAt <= Date.now();
}

function isFreeTextModel(model: OpenRouterModel): model is OpenRouterModel & { id: string } {
  const inputModalities = model.architecture?.input_modalities ?? [];
  const outputModalities = model.architecture?.output_modalities ?? [];

  return Boolean(
    model.id &&
      model.id !== FREE_ROUTER_MODEL &&
      inputModalities.includes('text') &&
      outputModalities.includes('text') &&
      isZeroPrice(model.pricing?.prompt, true) &&
      isZeroPrice(model.pricing?.completion, true) &&
      isZeroPrice(model.pricing?.request) &&
      !isExpired(model.expiration_date),
  );
}

async function fetchFreeTextModels(): Promise<string[]> {
  const config = getAiConfig();
  const baseUrl = config.openRouter.baseUrl.replace(/\/$/, '');
  const url = new URL(`${baseUrl}/models`);

  url.searchParams.set('input_modalities', 'text');
  url.searchParams.set('output_modalities', 'text');
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
  });

  if (!response.ok) {
    throw new Error(`Falha ao consultar modelos gratuitos do OpenRouter (${response.status}).`);
  }

  const body = (await response.json()) as OpenRouterModelsResponse;
  const models = (body.data ?? [])
    .filter(isFreeTextModel)
    .map((model) => model.id);

  return [...new Set(models)];
}

export async function getFreeTextModels(): Promise<string[]> {
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

  if (cachedCatalog?.models.length) {
    return cachedCatalog.models;
  }

  // Fallback oficial do OpenRouter: continua gratuito e escolhe um modelo
  // compatível com as características da requisição quando o catálogo não
  // puder ser consultado temporariamente.
  return [FREE_ROUTER_MODEL];
}
