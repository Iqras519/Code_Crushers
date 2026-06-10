# Deployment Guide

## Overview
This project is configured for deployment on both **Vercel** and **GitHub Pages**.

## Architecture

### Frontend
- **App**: `artifacts/struturacheck` - Main React + TypeScript application using Vite
- **Sandbox**: `artifacts/mockup-sandbox` - Component library/mockup preview
- **Build Output**: `artifacts/struturacheck/dist/public/`

### Backend API
- **Server**: `artifacts/api-server` - Express.js API server
- **Database**: `lib/db` - Drizzle ORM database schemas
- **API Types**: `lib/api-zod` - Zod validation schemas

### Shared Libraries
- `lib/api-client-react` - React API client
- `lib/api-spec` - OpenAPI specification

---

## Vercel Deployment

### Prerequisites
```bash
npm i -g vercel  # Install Vercel CLI
```

### Configuration
The `vercel.json` file is pre-configured with:
- Build command: `pnpm run build`
- Output directory: `artifacts/struturacheck/dist/public`
- Environment: `NODE_ENV=production`
- SPA routing for React Router
- Cache headers for optimal performance

### Deployment Steps

#### 1. Link to Vercel (First Time)
```bash
vercel link
```
Select:
- Existing project or create new
- Monorepo framework: pnpm

#### 2. Set Environment Variables
```bash
vercel env add
```

Add required environment variables:
- `DATABASE_URL` - Database connection string
- `CORS_ORIGIN` - CORS allowed origins (e.g., `https://yourdomain.com`)
- Any API keys your app needs

#### 3. Deploy
```bash
vercel deploy --prod
```

Or push to connected Git repository (automatic deployment).

### Automatic Deployment
After linking your Git repository:
1. Every push to `main` triggers a preview deployment
2. Use `vercel deploy --prod` for production deployment
3. Configure auto-deployment in Vercel dashboard > Settings > Git

### API Routes
The API routes are handled via rewrites in `vercel.json`:
- `/api/*` routes forward to the Express backend
- All other routes serve `index.html` for SPA routing

---

## GitHub Pages Deployment

### Prerequisites
```bash
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

### Configuration
The GitHub Actions workflow (`.github/workflows/deploy-github-pages.yml`) is pre-configured to:
1. Build the app on every push to `main`
2. Deploy to GitHub Pages automatically
3. Use base path: `/Code_Crushers/` (adjust if needed)

### Setup Steps

#### 1. Enable GitHub Pages
1. Go to repository Settings > Pages
2. Under "Build and deployment":
   - Source: **Deploy from a branch**
   - Branch: **gh-pages**

The workflow will automatically create and push to the `gh-pages` branch.

#### 2. (Optional) Custom Domain
In Settings > Pages:
- Add custom domain
- Update DNS records as instructed

#### 3. Deploy
Simply push to `main`:
```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

The workflow automatically:
- Installs dependencies
- Runs type checking
- Builds the app with correct base path
- Deploys to GitHub Pages

### Access Your Site
```
https://<username>.github.io/Code_Crushers/
```
(Or your custom domain if configured)

---

## Environment Variables

### Development
```bash
# Development server
PORT=5173
BASE_PATH=/
NODE_ENV=development
```

### Production (Vercel)
Set in Vercel Dashboard > Settings > Environment Variables:
```
NODE_ENV=production
DATABASE_URL=postgresql://...
CORS_ORIGIN=https://yourdomain.com
API_URL=https://api.yourdomain.com
```

### Production (GitHub Pages)
Set in workflow file or GitHub Settings > Secrets:
- No secrets needed - app is client-only
- Adjust `BASE_PATH` in workflow if using custom domain

---

## Build & Deployment Scripts

### Available Commands

```bash
# Development
pnpm dev                    # Run dev server for struturacheck

# Building
pnpm build                 # Full build (typecheck + all artifacts)
pnpm build:app             # Build only struturacheck for deployment
pnpm build:deps            # Build dependencies
pnpm typecheck             # Type check entire workspace

# Deployment
vercel deploy --prod       # Deploy to Vercel production
```

---

## Troubleshooting

### Vercel Deployment Issues

**Issue: "PORT environment variable is required"**
- ✅ Fixed: Vite config now uses default port 5173 in production
- If still occurs, ensure `NODE_ENV=production` is set

**Issue: "BASE_PATH environment variable is required"**
- ✅ Fixed: Defaults to "/" if not provided
- For sub-paths, set `BASE_PATH=/your-path/` in Vercel env

**Issue: API routes return 404**
- Verify `vercel.json` rewrites are correct
- Check API server is deployed as Vercel Function
- Ensure `CORS_ORIGIN` matches your domain

### GitHub Pages Issues

**Issue: Site shows blank page**
- Verify base path in workflow: `BASE_PATH: /Code_Crushers/`
- Check GitHub Pages enabled in Settings
- Verify branch is set to `gh-pages`

**Issue: Assets returning 404**
- Build assets with correct base path
- Clear browser cache: `Ctrl+Shift+Delete`
- Rebuild and redeploy

**Issue: API calls fail**
- GitHub Pages cannot host API backend
- For API calls, use external API (Vercel, AWS, etc.)
- Update API endpoint in app config

---

## Monorepo Structure for Deployment

```
Code_Crushers/
├── artifacts/
│   ├── struturacheck/      ← Main app (deployed)
│   ├── mockup-sandbox/     ← Sandbox (not deployed)
│   └── api-server/         ← Backend (optional)
├── lib/                    ← Shared libraries (built as deps)
│   ├── db/
│   ├── api-client-react/
│   └── api-zod/
├── vercel.json             ← Vercel configuration
└── .github/workflows/      ← GitHub Actions
    └── deploy-github-pages.yml
```

---

## Performance Optimization

### Caching
- Static assets: `max-age=31536000` (1 year)
- HTML/index.html: `max-age=3600` (1 hour)

Configured in `vercel.json` headers.

### Build Optimization
- TypeScript compilation with incremental builds
- Tree-shaking via Vite
- CSS minification via Tailwind
- JSON imports optimized

---

## Security Considerations

1. **Environment Variables**: Never commit secrets
   - Use Vercel/GitHub Secrets for sensitive data
   - Verify `.gitignore` excludes `.env*` files

2. **CORS**: Configure `CORS_ORIGIN` appropriately
   - Development: `*` (for local testing)
   - Production: specific domain(s)

3. **API Keys**: Store in environment variables
   - Don't expose in client-side code
   - Use backend API for sensitive operations

---

## Next Steps

1. **Configure environment variables** (DATABASE_URL, API keys, etc.)
2. **Test deployment** to staging/preview first
3. **Monitor logs** after first production deployment
4. **Set up alerts** for build failures

For questions, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Pages Documentation](https://pages.github.com/)
- [Vite Documentation](https://vitejs.dev/)
