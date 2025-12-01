# Argus

Argus is a Vite-powered React single-page app. This repository now includes everything required to run the project locally and deploy it automatically to GitHub Pages.

## Requirements

- Node.js 20+
- npm 10+

## Local development

```bash
npm install            # install dependencies once
npm run dev            # start Vite at http://localhost:5173
```

Vite hot-module reloading is enabled out of the box. When you are ready to check the production output locally, run `npm run build` followed by `npm run preview` to serve the optimized bundle from `dist/`.

## Production builds

```bash
npm run build          # outputs to dist/
```

The build reads `.env.production` and sets the Vite base path to `/argus/`, which is required for GitHub Pages. If you fork the project into a repository with a different name, update `VITE_BASE_PATH` accordingly.

## Deployment

GitHub Actions automatically builds and deploys the site to Pages on every push to `main`.

1. Open **Settings → Pages** and choose “GitHub Actions” as the source (if not already enabled).
2. Review `.github/workflows/deploy.yml` to see the workflow that runs `npm ci`, `npm run build`, and uploads `dist/`.
3. Push to `main`. The `deploy` job will publish the latest artifact and output the live URL as a workflow summary.

### Manual alternative

If you ever need to deploy without GitHub Actions, you can still run `npm run build` locally and publish the `dist/` directory to any static host (Cloudflare Pages, Netlify, Vercel, etc.). Just be sure that the host serves the site from `/argus/` or updates `VITE_BASE_PATH` to match the host’s sub-path.
