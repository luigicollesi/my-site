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

The application no longer depends on a model selected through environment variables. Before generating a response, the server queries the OpenRouter model catalog and keeps only models that:

- accept `text` input;
- return `text` output;
- have zero prompt, completion and request cost;
- support the parameters currently used by the chat flow.

The catalog is cached for 15 minutes. Models that fail during completion are temporarily skipped for 24 hours in the current server process and the next free compatible model is tried. Each request attempts at most five models to avoid consuming the free request quota during broader OpenRouter/provider outages.

If the model catalog cannot be reached and there is no cached catalog, the application falls back to the official `openrouter/free` router until discovery is available again.

Create a `.env.local` file and configure at least:

```env
LLM_OPENROUTER_API_KEY=<your-openrouter-api-key>
```

`LLM_PROVIDER=openrouter` can still be set explicitly, but OpenRouter is already the default and only supported provider.

Optional settings:

- `LLM_DEBUG=true` for request/response and model-discovery logs (server-side only)
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

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
