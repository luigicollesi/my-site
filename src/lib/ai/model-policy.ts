import type { OpenRouterModelDescriptor } from '@/lib/ai/providers/openrouter-models';

const PREFERRED_MODEL_IDS = [
  'minimax/minimax-m3:free',
  'minimax/minimax-m2.7:free',
  'arcee-ai/trinity-large-preview:free',
  'upstage/solar-pro-3:free',
];

const STRONGLY_SPECIALIZED_PATTERNS = [
  /rerank/i,
  /embedding/i,
  /content[-_ ]?safety/i,
  /moderation/i,
  /finance[-_ ]?focused/i,
  /health (?:and|&) medicine[-_ ]?focused/i,
  /medical[-_ ]?focused/i,
  /speech[-_ ]?to[-_ ]?text/i,
  /text[-_ ]?to[-_ ]?speech/i,
];

function reasoningCanBeDisabled(model: OpenRouterModelDescriptor): boolean {
  const reasoning = model.reasoning;

  if (!reasoning) return true;
  if (reasoning.mandatory) return false;
  if (reasoning.default_effort === 'none' || reasoning.default_enabled === false) return true;

  if (reasoning.supported_efforts === null) {
    return true;
  }

  if (reasoning.supported_efforts?.length) {
    return reasoning.supported_efforts.includes('none');
  }

  return reasoning.default_enabled !== true;
}

function isStronglySpecialized(model: OpenRouterModelDescriptor): boolean {
  const searchable = `${model.id} ${model.name ?? ''} ${model.description ?? ''}`;
  return STRONGLY_SPECIALIZED_PATTERNS.some((pattern) => pattern.test(searchable));
}

export function isPortfolioModelEligible(model: OpenRouterModelDescriptor): boolean {
  if (!model.id.endsWith(':free')) return false;
  if ((model.context_length ?? 0) < 16_384) return false;
  if (!reasoningCanBeDisabled(model)) return false;
  if (isStronglySpecialized(model)) return false;

  return true;
}

function scoreModel(model: OpenRouterModelDescriptor): number {
  const preferredIndex = PREFERRED_MODEL_IDS.indexOf(model.id);
  let score = preferredIndex >= 0 ? 10_000 - preferredIndex * 100 : 0;
  const description = `${model.name ?? ''} ${model.description ?? ''}`.toLowerCase();

  if (!model.reasoning) score += 500;
  if (model.reasoning?.default_enabled === false || model.reasoning?.default_effort === 'none') score += 350;
  if ((model.context_length ?? 0) >= 64_000) score += 100;
  if ((model.context_length ?? 0) >= 128_000) score += 50;
  if (/general[- ]purpose|instruction following|multilingual|conversational|chat/.test(description)) score += 180;
  if (/reasoning|agentic|coding|tool use|tool-use/.test(description)) score -= 60;

  return score;
}

export function selectPortfolioModels(
  models: OpenRouterModelDescriptor[],
  limit = 3,
): OpenRouterModelDescriptor[] {
  return models
    .filter(isPortfolioModelEligible)
    .map((model, index) => ({ model, index, score: scoreModel(model) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ model }) => model);
}
