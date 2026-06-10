# Pre-Deployment Checklist

## Local Testing

- [ ] Run `pnpm install` to install all dependencies
- [ ] Run `pnpm run typecheck` to verify TypeScript compilation
- [ ] Run `pnpm build` to build all artifacts successfully
- [ ] Test app locally: `pnpm -r --filter @workspace/struturacheck run dev`
- [ ] Verify no console errors or TypeScript warnings
- [ ] Test all main features work correctly
- [ ] Check responsive design on mobile/tablet

## Code Quality

- [ ] No `console.log` statements left in code
- [ ] No commented-out code blocks
- [ ] All imports are used
- [ ] API calls use correct endpoints
- [ ] Error handling is implemented
- [ ] Loading states are implemented
- [ ] No hardcoded environment-specific URLs
- [ ] All external dependencies are documented

## Configuration

- [ ] `vercel.json` is configured correctly
- [ ] GitHub Actions workflow exists (`.github/workflows/deploy-github-pages.yml`)
- [ ] `.env.example` documents all required variables
- [ ] `package.json` scripts are tested
- [ ] TypeScript configurations are correct

## Vercel Setup

- [ ] Vercel account created (https://vercel.com)
- [ ] Project linked with `vercel link`
- [ ] Environment variables added:
  - [ ] `NODE_ENV=production`
  - [ ] `DATABASE_URL` (if needed)
  - [ ] `CORS_ORIGIN`
  - [ ] Any API keys
- [ ] Build settings verified:
  - [ ] Framework: Other (monorepo)
  - [ ] Build command: `pnpm run build`
  - [ ] Output directory: `artifacts/struturacheck/dist/public`
- [ ] Vercel preview deployment tested
- [ ] Production domain configured (if custom domain)

## GitHub Pages Setup

- [ ] Repository pushed to GitHub with `main` branch
- [ ] GitHub Pages enabled in Settings > Pages
  - [ ] Source: Deploy from a branch
  - [ ] Branch: `gh-pages`
- [ ] Workflow runs without errors on `git push`
- [ ] Site accessible at `https://<username>.github.io/Code_Crushers/`
- [ ] All assets load correctly
- [ ] Navigation works properly
- [ ] Responsive design verified

## Security

- [ ] No sensitive data in code
- [ ] `.env.local` is in `.gitignore`
- [ ] All secrets added to Vercel/GitHub
- [ ] CORS policy is restrictive (not `*` in production)
- [ ] API keys rotated before deployment
- [ ] Content Security Policy headers configured (if applicable)

## Performance

- [ ] Lighthouse audit score > 90
- [ ] First Contentful Paint < 2s
- [ ] Bundle size analyzed
- [ ] No unused dependencies
- [ ] Images optimized
- [ ] Code splitting verified

## Monitoring

- [ ] Error tracking configured (if applicable)
- [ ] Analytics configured (if applicable)
- [ ] Build logs reviewed for warnings
- [ ] Deployment notifications set up

## Post-Deployment

- [ ] Verify production site functionality
- [ ] Check API connectivity
- [ ] Monitor error logs
- [ ] Test critical user paths
- [ ] Verify SEO metadata
- [ ] Check 404 error pages
- [ ] Test form submissions
- [ ] Verify external links

## Rollback Plan

- [ ] Previous version identified
- [ ] Rollback process documented
- [ ] Team notified of deployment
- [ ] Emergency contacts listed

---

## Deployment Commands

### First-time Setup (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Link project (interactive)
vercel link

# Add environment variables
vercel env add

# Deploy to production
vercel deploy --prod
```

### First-time Setup (GitHub Pages)
```bash
# Ensure main branch is pushed
git push origin main

# Enable GitHub Pages in Settings
# Workflow will run automatically

# Verify deployment
# Visit: https://<username>.github.io/Code_Crushers/
```

### Subsequent Deployments
```bash
# For Vercel
git push origin main
# or
vercel deploy --prod

# For GitHub Pages
git push origin main
# Automatic via workflow
```

---

## Troubleshooting Common Issues

### Build Fails with "PORT environment variable is required"
**Solution**: Update vite.config.ts (already done ✓)
- Port now defaults to 5173 in production
- Verify `NODE_ENV=production` is set

### Assets return 404 on GitHub Pages
**Solution**: 
- Verify `BASE_PATH: /Code_Crushers/` in workflow
- Clear browser cache and rebuild
- Check output directory structure

### API calls fail on GitHub Pages
**Solution**:
- GitHub Pages is static hosting only
- Use external API or Vercel for backend
- Update API endpoint configuration
- Enable CORS on backend

### Site shows blank page
**Solution**:
- Check browser console for errors
- Verify JavaScript is enabled
- Check deployment logs
- Verify base path configuration

---

## Resources

- [Vercel Docs](https://vercel.com/docs)
- [GitHub Pages Docs](https://pages.github.com/)
- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://react.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

---

## Notes

- Each deployment includes TypeScript type checking
- Monorepo benefits: shared code, atomic deployments
- Both platforms support automatic deployments on git push
- Consider using environment-specific configurations for different deployments
