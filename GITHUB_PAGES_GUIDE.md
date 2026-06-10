# GitHub Pages Deployment Guide

## Overview

Your Code_Crushers application can be deployed to GitHub Pages as a static Single Page Application (SPA). This guide covers everything needed for a successful deployment.

## Architecture

GitHub Pages serves **static files only**. Since your application requires an API backend:

- **Frontend (SPA)**: Deployed to GitHub Pages
  - React + TypeScript + Vite
  - Runs entirely in the browser
  - Located at: `https://<username>.github.io/Code_Crushers/`

- **Backend API**: Must be deployed separately
  - Can use Vercel, AWS, Heroku, or any Node.js host
  - Can also use mock data for demos

## Prerequisites

1. **GitHub Account**: https://github.com
2. **Git installed**: https://git-scm.com
3. **Repository pushed to GitHub**: Your project on GitHub
4. **pnpm installed**: `npm i -g pnpm`

## Quick Start (5 minutes)

### 1. Enable GitHub Pages

1. Go to your GitHub repository
2. Click **Settings** > **Pages**
3. Under "Build and deployment":
   - Source: Select **Deploy from a branch**
   - Branch: Select **gh-pages**
   - Click Save

### 2. Push to Main Branch

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

The GitHub Actions workflow automatically:
- ✅ Installs dependencies
- ✅ Runs type checking
- ✅ Builds the application
- ✅ Deploys to `gh-pages` branch

### 3. Access Your Site

```
https://<username>.github.io/Code_Crushers/
```

Replace `<username>` with your GitHub username.

## Configuration

### Environment Variables

The workflow uses these environment variables (can be overridden):

```yaml
NODE_ENV: production
VITE_API_URL: ''           # Empty = relative API calls to same origin
VITE_USE_MOCK_API: 'false'  # Set to 'true' for demo without backend
BASE_PATH: /Code_Crushers/  # Matches your repo name
```

### For Custom Configuration

Edit `.github/workflows/deploy-github-pages.yml` and modify the `env` section:

```yaml
env:
  NODE_ENV: production
  VITE_API_URL: 'https://api.example.com'  # Your API endpoint
  VITE_USE_MOCK_API: 'false'
  BASE_PATH: /Code_Crushers/
```

## API Integration

### Option 1: External API (Recommended for Production)

Deploy your API backend separately and set the endpoint:

```yaml
# In .github/workflows/deploy-github-pages.yml
env:
  VITE_API_URL: 'https://api.yourdomain.com'
```

**Supported Hosts:**
- Vercel (free tier available)
- AWS Lambda/Amplify
- Heroku (paid)
- DigitalOcean
- Render.com
- Railway.app

**CORS Requirements:**
Backend must allow requests from your GitHub Pages domain:

```typescript
// Express example
app.use(cors({
  origin: 'https://<username>.github.io',
  credentials: true
}));
```

### Option 2: Mock API (For Demo/Testing)

Use mock data without a real backend:

```yaml
# In .github/workflows/deploy-github-pages.yml
env:
  VITE_USE_MOCK_API: 'true'
```

Demo Credentials:
- Email: `demo@example.com`
- Password: `password123`

Or:
- Email: `admin@example.com`
- Password: `password123`

**Mock Data Included:**
- Authentication (login/register)
- Dashboard statistics
- Analyses list
- Recommendations
- Health checks

### Option 3: Local Development API

For local development with real backend:

1. Start API server:
   ```bash
   cd artifacts/api-server
   npm start
   # Runs on http://localhost:3000
   ```

2. Configure `.env.local`:
   ```
   VITE_API_URL=http://localhost:3000
   VITE_USE_MOCK_API=false
   NODE_ENV=development
   ```

3. Start frontend:
   ```bash
   cd artifacts/struturacheck
   PORT=5173 BASE_PATH=/ npm run dev
   ```

## Routing & SPA Configuration

GitHub Pages requires special configuration for SPA routing:

### How It Works

1. **Build Process** copies `index.html` → `404.html`
   - When GitHub Pages serves 404 errors, it shows `404.html`
   - This triggers your SPA with the correct URL

2. **Wouter Router** (your app's router) handles routes
   - Base path: `/Code_Crushers/`
   - All routes redirect through index.html

3. **Navigation Flow**:
   ```
   User visits: /Code_Crushers/dashboard
   GitHub Pages serves: 404.html (which is index.html)
   React app loads with correct URL
   Wouter Router navigates to /dashboard
   ```

✅ **Already configured in workflow** - no action needed

## Troubleshooting

### Site Shows Blank Page

**Causes & Solutions:**

1. **JavaScript disabled**
   - Enable JavaScript in browser settings

2. **Build failed**
   - Check: https://github.com/<username>/<repo>/actions
   - Look for red ✗ in workflow

3. **Wrong base path**
   - Verify `BASE_PATH: /Code_Crushers/` in workflow
   - Must match repo name

4. **CORS errors in console**
   - API not accessible from your domain
   - Set `VITE_API_URL` correctly or use mock API

### Solution: Check GitHub Actions Logs

1. Go to repository
2. Click **Actions** tab
3. Click latest workflow run
4. Click failed job for details

### Assets Return 404

**Causes:**

1. Base path mismatch
2. Asset paths hardcoded instead of relative

**Solution:**

```bash
# Rebuild locally to test
BASE_PATH=/Code_Crushers/ pnpm build
pnpm preview  # Test locally
```

### API Calls Fail (Network Errors)

**Causes:**

1. Backend not deployed
2. CORS not configured on backend
3. Wrong API URL

**Solutions:**

```yaml
# Option A: Use mock data for demo
VITE_USE_MOCK_API: 'true'

# Option B: Deploy backend and set URL
VITE_API_URL: 'https://your-api.example.com'

# Option C: Check backend CORS headers
# In browser DevTools > Network tab > failed request > Headers
# Should show: Access-Control-Allow-Origin: *
```

### Authentication Not Working

**Causes:**

1. localStorage disabled
2. Third-party cookies blocked
3. Wrong authentication header

**Solutions:**

```bash
# Test locally first
npm run dev

# Check browser DevTools
# Application > Local Storage > visionbuild_token
# Should see your auth token
```

## Performance Optimization

### Deployment Performance Checklist

- [ ] Gzip enabled (automatic on GitHub Pages)
- [ ] Cache headers set correctly
- [ ] Assets have correct cache busting
- [ ] Bundle size reasonable (< 500KB recommended)

### Check Bundle Size

```bash
# Analyze build output
cd artifacts/struturacheck
npm run build

# Check dist/public size
du -sh dist/public/
```

Typical sizes:
- HTML: ~2-5 KB
- JavaScript: ~150-300 KB (gzipped)
- CSS: ~20-50 KB (gzipped)
- Total: ~200-400 KB

## Custom Domain

### Setup Custom Domain

1. **Prepare domain**: https://yourdomain.com

2. **Update DNS records**:
   ```
   Type: A
   Name: @
   Value: 185.199.108.153
          185.199.109.153
          185.199.110.153
          185.199.111.153
   ```
   (GitHub's IP addresses - check docs for latest)

3. **Add to GitHub Pages**:
   - Settings > Pages
   - Custom domain: `yourdomain.com`
   - Check "Enforce HTTPS"

4. **Update BASE_PATH** in workflow:
   ```yaml
   BASE_PATH: /  # Root domain
   ```

## Security Best Practices

✅ **GitHub Pages Security:**
- HTTPS automatically enabled
- No sensitive data stored on Pages
- No database access from frontend

⚠️ **Important:**
- **Never commit `.env.local`** - add to `.gitignore` (already done)
- **Never expose API keys** in client-side code
- **Configure CORS** properly on backend
- **Use HTTPS** for API calls in production

## Monitoring & Analytics

### Track Deployments

1. Go to Actions tab
2. View workflow history
3. Check deployment status

### Monitor Site Health

Add to your monitoring:
- **Uptime checks**: pingdom, statuspage
- **Error tracking**: Sentry, Rollbar
- **Analytics**: Google Analytics, Plausible

## Rollback to Previous Version

If deployment causes issues:

```bash
# Find previous commit
git log --oneline | head -10

# Revert to previous version
git revert <commit-hash>
git push origin main

# Workflow automatically redeploys
```

## Advanced: Custom Build Configuration

### Modify Build Process

Edit `artifacts/struturacheck/vite.config.ts`:

```typescript
export default defineConfig({
  base: basePath,
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    minify: "terser",           // or "esbuild"
    sourcemap: false,           // true for debugging
    rollupOptions: {
      output: {
        manualChunks: { ... }   // customize chunks
      }
    }
  }
});
```

### Modify Workflow

Edit `.github/workflows/deploy-github-pages.yml`:

```yaml
- name: Build struturacheck
  env:
    NODE_ENV: production
    BASE_PATH: /Code_Crushers/
    VITE_API_URL: ${{ secrets.API_URL }}
  run: pnpm -r --filter @workspace/struturacheck run build
```

## Frequently Asked Questions

**Q: Can I use GitHub Pages with a backend?**
A: GitHub Pages is static only. Host backend separately (Vercel, AWS, etc).

**Q: How do I use my own domain?**
A: See "Custom Domain" section above.

**Q: Can I password-protect the site?**
A: No. Use GitHub private repository or external authentication.

**Q: How much does GitHub Pages cost?**
A: Free with GitHub account. No bandwidth limits.

**Q: Can I deploy multiple apps?**
A: Yes! Create multiple workflows for different branches/artifacts.

**Q: How do I debug deployment issues?**
A: Check GitHub Actions logs for detailed error messages.

## Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vite Documentation](https://vitejs.dev/)
- [React Router (Wouter) Documentation](https://github.com/molefrog/wouter)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Support

For issues:

1. **Check logs**: GitHub Actions workflow logs
2. **Browser DevTools**: F12 > Console for errors
3. **Search**: Similar issues on GitHub
4. **Create issue**: In your repository

## Next Steps

1. ✅ Enable GitHub Pages in Settings
2. ✅ Push to main branch
3. ✅ Wait for workflow to complete (2-3 minutes)
4. ✅ Access your site
5. ✅ Configure API or use mock data
6. ✅ Share your live site!

---

**Your site will be live at:**
```
https://<username>.github.io/Code_Crushers/
```

Happy deploying! 🚀
