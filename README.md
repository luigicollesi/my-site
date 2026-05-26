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

1. Copy `.env.example` to `.env`.
2. Set:
   - `LLM_PROVIDER=openrouter`
   - `LLM_MODEL1=<your-primary-openrouter-model>`
   - `LLM_MODEL2=<your-secondary-openrouter-model>`
   - Optionally configure `LLM_MODEL3`, `LLM_MODEL4`, and `LLM_MODEL5`
   - `LLM_OPENROUTER_API_KEY=<your-openrouter-api-key>`
3. Optional:
   - `LLM_DEBUG=true` for request/response debug logs (server-side only)
   - When a configured model fails, it is skipped for 24 hours in the current server process and the next configured model is used
   - `LLM_OPENROUTER_APP_NAME` and `LLM_OPENROUTER_APP_URL` for OpenRouter attribution headers
   - Privacy/routing controls (helpful when you hit OpenRouter data-policy guardrails):
     - `LLM_OPENROUTER_DATA_COLLECTION=allow|deny`
     - `LLM_OPENROUTER_ZDR=true|false`
     - `LLM_OPENROUTER_ALLOW_FALLBACKS=true|false`
     - `LLM_OPENROUTER_ONLY=<csv providers>`
     - `LLM_OPENROUTER_IGNORE=<csv providers>`

Install dependencies manually:

```bash
npm install openai
npm uninstall together-ai
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
