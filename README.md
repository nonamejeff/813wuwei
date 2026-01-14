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
