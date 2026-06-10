# GitHub Pages Deployment Troubleshooting

## Build Fails - Check GitHub Actions

### Where to Look

1. Go to your repository
2. Click **Actions** tab
3. Click the failed workflow run
4. Click on the **build** job
5. Look for red ✗ and error message

### Common Build Errors

#### Error: "PORT environment variable is required"

**Status**: ✅ Fixed in this codebase

**What it means**: Build tried to start a development server

**Why it happens**: Old Vite config required PORT during build

**How it's fixed**: Vite config now uses default port in production

---

#### Error: "BASE_PATH environment variable is required"

**Status**: ✅ Fixed in this codebase

**What it means**: Base path wasn't configured

**Why it happens**: App needs to know its deployment location

**Solution**: Workflow sets `BASE_PATH: /Code_Crushers/`

---

#### Error: "TypeScript compilation failed"

**What it means**: Code has TypeScript errors

**Solution**:
```bash
# Run locally to see errors
pnpm run typecheck

# Fix errors in your code
# Then commit and push
git add .
git commit -m "Fix TypeScript errors"
git push origin main
```

---

## Site Doesn't Load or Shows Blank Page

### Diagnosis Checklist

```
[ ] Site loads (any content appears)
[ ] No 404 error
[ ] No JavaScript errors in console
[ ] GitHub Pages settings configured
[ ] Waited 2-3 minutes after deploy
```

### Step-by-Step Diagnosis

#### 1. Check GitHub Pages Settings

1. Go: Settings > Pages
2. Verify:
   - [ ] Source: "Deploy from a branch"
   - [ ] Branch: "gh-pages"
   - [ ] Folder: "/ (root)" (if shown)

**Fix**: If not set correctly, update and save

#### 2. Check GitHub Actions

1. Go: Actions tab
2. Latest workflow should have ✅ (green checkmark)
3. If ✗ (red X): Click to see error details

**Fix**: Scroll up to see error details, fix issue, push again

#### 3. Check Browser Console

1. Visit your site
2. Press F12 (or Cmd+Opt+I on Mac)
3. Click **Console** tab
4. Look for red 🔴 errors

**Common errors**:
```
❌ Failed to fetch
   → API endpoint not available
   → Use mock API: set VITE_USE_MOCK_API=true

❌ index.html:1 Uncaught SyntaxError
   → Asset loading issue
   → Clear cache: Ctrl+Shift+R

❌ GET /Code_Crushers/favicon.svg 404
   → Minor issue, doesn't affect functionality
```

#### 4. Clear Browser Cache

```
Chrome:  Ctrl+Shift+Delete → Clear all time
Firefox: Ctrl+Shift+Delete → Everything
Safari:  Cmd+Opt+E
```

Then refresh the page.

---

## Assets Return 404

### Issue

```
❌ GET /assets/xyz.abc123.js 404 (Not Found)
```

### Causes

1. Wrong BASE_PATH
2. Build output directory wrong
3. Assets not copied correctly

### Solution

1. **Check BASE_PATH**:
   ```yaml
   # .github/workflows/deploy-github-pages.yml
   BASE_PATH: /Code_Crushers/  # Must match repo name
   ```

2. **Rebuild locally to test**:
   ```bash
   cd artifacts/struturacheck
   BASE_PATH=/Code_Crushers/ npm run build
   ```

3. **Check build output**:
   ```bash
   ls -la artifacts/struturacheck/dist/public/
   # Should show index.html, assets/, etc.
   ```

4. **Hard refresh browser**:
   - Ctrl+Shift+R (Chrome/Firefox)
   - Cmd+Shift+R (Safari/Mac)

---

## API Calls Fail (Network Errors)

### Error Messages

```
❌ Failed to fetch
❌ GET /api/login 404
❌ CORS error
```

### Root Cause

GitHub Pages is **static only** - it cannot run an API server.
Your app needs an API backend, but:
- Option A: Deploy API separately ✅
- Option B: Use mock data ✅
- Option C: Use external API ✅

### Solution A: Use Mock API (Easiest)

Edit `.github/workflows/deploy-github-pages.yml`:

```yaml
env:
  VITE_USE_MOCK_API: 'true'  # Enable mock API
```

Then:
```bash
git add .github/
git commit -m "Enable mock API for GitHub Pages"
git push origin main
```

### Solution B: Deploy Real API Backend

Option 1 - Vercel (Recommended):
```bash
# Deploy API to Vercel
cd artifacts/api-server
vercel deploy --prod

# Get your API URL like: https://api-server.vercel.app
```

Option 2 - Other Hosts:
- AWS Lambda/Amplify
- Railway.app
- Render.com
- DigitalOcean

Then update workflow:
```yaml
env:
  VITE_API_URL: 'https://your-api.example.com'
```

### Solution C: Fix CORS (If API exists)

Backend must allow requests from your GitHub Pages domain:

```typescript
// Express backend - express.js example
import cors from 'cors';

app.use(cors({
  origin: 'https://<username>.github.io',
  credentials: true
}));
```

Python (Flask):
```python
from flask_cors import CORS
CORS(app, origins=['https://<username>.github.io'])
```

---

## Site Works Locally but Not on GitHub Pages

### Possible Causes

| Issue | Solution |
|-------|----------|
| Environment variables not set | Set in `.github/workflows/deploy-github-pages.yml` |
| API endpoint hardcoded | Use `VITE_API_URL` environment variable |
| Base path not set | Set `BASE_PATH: /Code_Crushers/` in workflow |
| .env.local secrets in code | Use environment variables instead |

### Debugging Steps

1. **Check build locally**:
   ```bash
   BASE_PATH=/Code_Crushers/ npm run build
   npm run preview
   # Visit http://localhost:5173
   ```

2. **Compare with GitHub Pages**:
   - Does it work in preview?
   - If yes: GitHub Pages issue
   - If no: Build configuration issue

3. **Check workflow log**:
   - What environment variables were used?
   - Any warnings during build?

---

## Login Doesn't Work

### Check

1. **Which mode is app using?**
   - Check browser console for message
   - Or check Environment > Local Storage > `visionbuild_token`

2. **If using mock API**:
   ```
   Email: demo@example.com
   Password: password123
   ```
   These credentials work with mock API only.

3. **If using real API**:
   - User must exist in your database
   - API endpoint must be running
   - CORS must be configured

### Solution

If mock API:
```bash
# Hard refresh browser
Ctrl+Shift+R

# Check that VITE_USE_MOCK_API is true in workflow
grep VITE_USE_MOCK_API .github/workflows/deploy-github-pages.yml
```

If real API:
```bash
# Verify API is running
curl https://your-api.example.com/api/healthz

# Check CORS headers in response
# Should include: Access-Control-Allow-Origin
```

---

## Deployment Takes Too Long

### Normal Timeline

- 1-2 min: Workflow starts
- 1-2 min: Dependencies install
- 30 sec: TypeScript check
- 30 sec: Build
- 30 sec: Upload
- 1-2 min: Deploy to Pages
- **Total: 4-7 minutes**

### If Taking Longer

1. Check if build is stuck:
   - Go to Actions
   - Click workflow
   - Look for "waiting for runner" or similar

2. GitHub Actions sometimes has delays
   - Wait up to 10 minutes
   - If still not done: cancel and retry

3. To retry:
   - Click workflow
   - Click "Re-run all jobs"

---

## Want to See What's Deployed?

### Inspect Built Files

1. Go to: `https://github.com/<username>/<repo>/tree/gh-pages`
2. You'll see:
   ```
   index.html
   404.html
   assets/
   favicon.svg
   ```

This is what GitHub Pages serves.

### Check File Sizes

```bash
# On your local machine after building
cd artifacts/struturacheck
npm run build

# View sizes
du -sh dist/public/
du -sh dist/public/assets/
```

---

## Performance Monitoring

### Check Site Speed

Use tools like:
- Google PageSpeed Insights: https://pagespeed.web.dev
- GTmetrix: https://gtmetrix.com
- WebPageTest: https://www.webpagetest.org

**Expected scores:**
- First Contentful Paint: < 2 seconds
- Lighthouse: > 80

### If Slow

1. Check bundle size:
   ```bash
   npm run build
   du -sh dist/public/
   ```

2. Enable gzip (automatic on GitHub Pages)

3. Check API response times (if using real API)

---

## Cannot Access Site

### Possible Issues

| Problem | Solution |
|---------|----------|
| 404 error | Wait 5 minutes, refresh, check Pages settings |
| 403 Forbidden | Check repository is not private (if needed) |
| Connection refused | GitHub Pages might be down (rare) |
| Wrong URL | Verify: https://<username>.github.io/Code_Crushers/ |

---

## Security Issues

### Warning: Mixed Content

```
❌ Mixed Content: The page was loaded over HTTPS, but requested an insecure resource
```

**Cause**: API URL is http instead of https

**Fix**:
```yaml
# Use https for API URL
VITE_API_URL: 'https://your-api.example.com'
```

### Warning: Insecure Login

**Don't do**:
- Store credentials in code
- Use localStorage for sensitive data
- Expose API keys in client-side code

**Do**:
- Use environment variables
- Send credentials securely to backend
- Backend validates and issues token

---

## Get More Help

### Check These Files

- [GitHub Pages Quick Start](GITHUB_PAGES_QUICKSTART.md)
- [Full GitHub Pages Guide](GITHUB_PAGES_GUIDE.md)
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)
- [Main Deployment Guide](DEPLOYMENT.md)

### Debug Logs

1. GitHub Actions: https://github.com/<username>/<repo>/actions
2. Browser Console: F12 > Console
3. Network tab: F12 > Network (check API calls)

### Resources

- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Vite Deployment Docs](https://vitejs.dev/guide/ssr.html)
- [React Router Docs](https://github.com/molefrog/wouter)

---

## Still Stuck?

1. **Check all above solutions**
2. **Look at GitHub Actions logs** (most detailed info)
3. **Compare with working example** (if available)
4. **Create GitHub issue** with:
   - What you tried
   - Error message
   - Build log screenshot
   - Expected vs actual behavior

Good luck! 🚀
