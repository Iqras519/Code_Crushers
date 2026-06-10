# Code_Crushers
Training Project Model 7th sem

## Quick Links

- **Deploy to GitHub Pages**: [Quick Start Guide](GITHUB_PAGES_QUICKSTART.md)
- **Full GitHub Pages Guide**: [Complete Documentation](GITHUB_PAGES_GUIDE.md)
- **Deployment Checklist**: [Pre-deployment Guide](DEPLOYMENT_CHECKLIST.md)
- **Vercel Deployment**: [Vercel Guide](DEPLOYMENT.md)

## Quick Start

### Development

```bash
# Install dependencies
pnpm install

# Start frontend development server
cd artifacts/struturacheck
PORT=5173 BASE_PATH=/ npm run dev

# In another terminal, start backend (optional)
cd artifacts/api-server
npm run dev
```

Visit: http://localhost:5173

### Deployment Options

#### GitHub Pages (Static Hosting)
```bash
git push origin main
# Site deploys automatically to: https://<username>.github.io/Code_Crushers/
```

#### Vercel
```bash
vercel deploy --prod
```

## Demo Credentials

```
Email: demo@example.com
Password: password123
```

## Project Structure

```
Code_Crushers/
├── artifacts/
│   ├── struturacheck/     ← Main React app (deployed)
│   ├── mockup-sandbox/    ← Component sandbox
│   └── api-server/        ← Backend API
├── lib/                   ← Shared libraries
├── .github/workflows/     ← GitHub Actions
└── [deployment files]
```

## Features

- ✅ AI-powered structural defect detection
- ✅ Image analysis dashboard
- ✅ Defect analytics & recommendations
- ✅ Responsive design
- ✅ TypeScript + React
- ✅ Tailwind CSS styling
- ✅ Works with mock data (no backend required)

## Learn More

- [Architecture Overview](DEPLOYMENT.md)
- [GitHub Pages Setup](GITHUB_PAGES_QUICKSTART.md)
- [Full Deployment Guides](DEPLOYMENT.md)
