## Cloudflare Worker (backend) – minimal deploy test

```
cd worker
npm install
npx wrangler login
npm run deploy
```

Testing:

```
curl https://<your-worker>.workers.dev/health  -> ok
```

## Image Generation Backend (Cloudflare Worker)

```
cd worker
npm install
npx wrangler login
npx wrangler secret put OPENAI_API_KEY
npm run deploy
```

`npx wrangler secret put OPENAI_API_KEY` prompts for the key and stores it securely in Cloudflare.

GitHub Pages remains unchanged.

Delete any apikey.txt and rotate the key if needed.

## Img-Gen Flow (simplified)

Enter words in the img-gen UI, click **Send** to aggregate a prompt, then click **Generate** to render the image. The `/v1/prompt/add` endpoint stores words in memory (per cookie sid) for now and will be replaced with durable storage later.
