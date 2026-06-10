# Quick Start: Deploy to GitHub Pages in 5 Minutes

## TL;DR - The Fastest Way

```bash
# 1. Ensure repo is on GitHub with 'main' branch
git push origin main

# 2. Go to Settings > Pages
# - Source: Deploy from a branch
# - Branch: gh-pages

# 3. Done! Site will be live at:
# https://<username>.github.io/Code_Crushers/
```

Wait for workflow to complete (~2-3 minutes), then refresh your browser.

---

## The Process

### Step 1: Repository Setup (If not already done)

```bash
# Initialize git if needed
git init
git remote add origin https://github.com/<username>/<repo>.git

# Create main branch and push
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

### Step 2: Enable GitHub Pages

1. Go to: `https://github.com/<username>/<repo>/settings/pages`
2. Under **Build and deployment**:
   - **Source**: Select "Deploy from a branch"
   - **Branch**: Select "gh-pages" from dropdown
3. Click **Save**

### Step 3: Wait & Verify

1. Go to **Actions** tab: `https://github.com/<username>/<repo>/actions`
2. Wait for workflow to complete (shows ✓ when done)
3. Visit: `https://<username>.github.io/Code_Crushers/`

---

## What Just Happened?

- ✅ Workflow triggered automatically on push
- ✅ Dependencies installed
- ✅ TypeScript checked
- ✅ App built & optimized
- ✅ Deployed to `gh-pages` branch
- ✅ GitHub Pages serving your app

---

## Verify It Works

| Check | What to Look For |
|-------|------------------|
| Site Loads | You see the login page |
| Login Works | Use demo@example.com / password123 |
| Navigation Works | Can navigate to dashboard |
| No Console Errors | Press F12 > Console - no red errors |

---

## If Something's Wrong

### Blank Page?

```bash
# Check Actions for build errors
# https://github.com/<username>/<repo>/actions

# Look for red X and click to see error details
```

### 404 Error?

1. Verify Settings > Pages is configured correctly
2. Wait 2-3 minutes for initial deploy
3. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

### Assets Not Loading?

The app uses mock data by default. If API isn't available, it shows demo data.
To use real API, see [Full Guide](GITHUB_PAGES_GUIDE.md#api-integration).

---

## Next Steps

### To Use Real API Backend

1. Deploy API separately (Vercel, AWS, etc.)
2. Edit `.github/workflows/deploy-github-pages.yml`:
   ```yaml
   env:
     VITE_API_URL: 'https://your-api.example.com'
   ```
3. Push changes: `git push origin main`

### To Use Custom Domain

1. Update DNS records (see [Full Guide](GITHUB_PAGES_GUIDE.md#custom-domain))
2. Add to Settings > Pages > Custom domain
3. Update `BASE_PATH` in workflow to `/`

### To Make Changes & Redeploy

```bash
# Make your changes
# (edit any file)

# Commit and push
git add .
git commit -m "Your changes"
git push origin main

# Workflow runs automatically
# Check Actions tab for status
# Site updates in 2-3 minutes
```

---

## Demo Credentials

The app includes mock data for testing:

| Email | Password |
|-------|----------|
| demo@example.com | password123 |
| admin@example.com | password123 |

---

## Your Site is Now Live! 🎉

```
https://<username>.github.io/Code_Crushers/
```

**Pro Tips:**
- Every push to `main` automatically redeploys
- Changes appear in 2-3 minutes
- GitHub Actions shows deployment status
- No additional configuration needed

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Site shows blank page | Hard refresh (Ctrl+Shift+R) or wait 5 min |
| 404 error | Check Settings > Pages configured for gh-pages branch |
| Build fails | Check Actions log for TypeScript errors |
| API errors | Use mock data (default) or deploy backend separately |

---

## Need Help?

- Full guide: [GITHUB_PAGES_GUIDE.md](GITHUB_PAGES_GUIDE.md)
- See deployment checklist: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- Check Actions tab for detailed error logs

---

**That's it! Your app is deployed.** 🚀
