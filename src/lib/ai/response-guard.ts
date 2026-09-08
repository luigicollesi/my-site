export type AiResponseValidation =
  | { valid: true }
  | { valid: false; reason: string };

const REASONING_LEAK_PATTERNS: Array<{ reason: string; pattern: RegExp }> = [
  {
    reason: 'thinking-tag',
    pattern: /<\/?think(?:ing)?\b[^>]*>/i,
  },
  {
    reason: 'thinking-process-heading',
    pattern: /^\s*(?:here(?:'s| is)\s+)?(?:a\s+|my\s+)?thinking process\s*:?/im,
  },
  {
    reason: 'internal-analysis-heading',
    pattern: /^\s*(?:internal\s+)?(?:analysis|reasoning)\s*:/im,
  },
  {
    reason: 'prompt-analysis-step',
    pattern: /^\s*\d+[.)]\s*\*{0,2}(?:analy[sz]e user input|check context(?: for)?|inspect system prompt)\b/im,
  },
  {
    reason: 'context-scanning-narration',
    pattern: /\b(?:i need to|let me)\s+(?:look through|scan|inspect|analy[sz]e)\s+(?:the\s+)?(?:provided\s+)?context\b/i,
  },
];

const MAX_PORTFOLIO_RESPONSE_CHARS = 2500;

export function validateAiResponse(text: string): AiResponseValidation {
  const normalized = text.trim();

  if (!normalized) {
    return { valid: false, reason: 'empty-response' };
  }

  if (normalized.length > MAX_PORTFOLIO_RESPONSE_CHARS) {
    return { valid: false, reason: 'response-too-long' };
  }

  for (const { reason, pattern } of REASONING_LEAK_PATTERNS) {
    if (pattern.test(normalized)) {
      return { valid: false, reason };
    }
  }

  return { valid: true };
}
