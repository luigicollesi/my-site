This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## AI Configuration (OpenRouter)

This project uses a centralized AI backend layer with OpenRouter in `src/lib/ai/*`.

The application does not depend on a model selected through environment variables. Before generating a response, the server queries the OpenRouter model catalog, keeps only compatible zero-cost text models, applies the portfolio model policy and ranks a bounded pool of candidates.

The runtime then attempts the ranked models explicitly under a global request deadline. Provider-level failover remains enabled inside OpenRouter, while model-level recovery is controlled by the local attempt orchestrator so empty responses, transient provider failures and responses rejected by the safety guard can move to another model predictably.

The catalog is cached for 15 minutes. If discovery is temporarily unavailable, only a previously validated catalog is reused; the application fails closed when no validated catalog exists.

Create a `.env.local` file and configure at least one OpenRouter API key:

```env
LLM_OPENROUTER_API_KEY=<your-openrouter-api-key>
```

Multiple credentials can be configured as a comma-separated list:

```env
LLM_OPENROUTER_API_KEY=key1,key2,key3
```

The first key is used normally. Additional credentials provide failover for invalid/revoked credentials and supported non-quota failure paths. They are not rotated to bypass `429` quota or provider rate limits.

`LLM_PROVIDER=openrouter` can still be set explicitly, but OpenRouter is already the default and only supported provider.

Optional settings:

- `LLM_DEBUG=true` for model/routing diagnostics (server-side only)
- `LLM_OPENROUTER_APP_NAME` and `LLM_OPENROUTER_APP_URL` for OpenRouter attribution headers
- Privacy/routing controls:
  - `LLM_OPENROUTER_DATA_COLLECTION=allow|deny`
  - `LLM_OPENROUTER_ZDR=true|false`
  - `LLM_OPENROUTER_ALLOW_FALLBACKS=true|false`
  - `LLM_OPENROUTER_ONLY=<csv providers>`
  - `LLM_OPENROUTER_IGNORE=<csv providers>`

`LLM_MODEL1`, `LLM_MODEL2` and the previous fixed-model variables are no longer used.

Install dependencies manually:

```bash
npm install openai
npm uninstall together-ai
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
