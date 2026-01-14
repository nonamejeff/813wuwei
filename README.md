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
