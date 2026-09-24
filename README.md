<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/c23369e9-7c1a-48c8-996f-7003684ef256

## Run Locally

**Prerequisites:** Node.js >= 20

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy on Render

This repo ships `render.yaml` (Blueprint) + `Dockerfile` for one-click deploy.

### Quick start

1. Push this repo to GitHub/GitLab.
2. On [Render](https://render.com), click **New → Blueprint**, import the repo, or drag-and-drop `render.yaml`.
3. In the service settings, add the secret `GEMINI_API_KEY` (Render keeps it out of the repo).
4. Deploy. Render runs:
   ```
   npm install && npm run build   # dist/ output
   NODE_ENV=production npx tsx server.ts   # serves dist/ + API
   ```
5. The service URL is shown in the dashboard (e.g. `https://ai-reels-studio-ai.onrender.com`).

### What Render does

| Step | Command |
|------|---------|
| Build | `npm install` (full deps — needed for Vite) + `npm run build` |
| Runtime | `NODE_ENV=production npx tsx server.ts` on port `10000` |
| Health | `GET /api/health` → `{ ok: true, geminiConfigured: true/false }` |

### Notes

- The repo has `bun.lock` but no `package-lock.json`, so the Dockerfile uses `npm install` (not `npm ci`) to resolve dependencies deterministically.
- `esbuild` devDependency was bumped to `^0.28.0` to match Vite 8's peer range when installing via npm.
- `dist/` and `node_modules/` are in `.dockerignore` — they are rebuilt inside the container, never copied from the host.
- The API has three endpoints after deploy: `POST /api/reels/generate-script`, `POST /api/reels/generate-scene-image`, `POST /api/reels/generate-speech`.
