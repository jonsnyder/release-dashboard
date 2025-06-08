# Release Automation Tool

A React application for automating GitHub repository release management with React Spectrum UI components.

## �� Features

- GitHub OAuth authentication with secure token exchange
- Repository branch and release management
- Release notes generation
- Pull request tracking
- Modern React 19 + TypeScript + Vite stack

## 🛠️ Development Setup

### Prerequisites

- Node.js 20+ (managed with `.nvmrc`)
- npm

### Getting Started

```bash
# Use the correct Node version
nvm use

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 🌐 GitHub Pages Deployment

This app uses a secure OAuth flow with a Vercel backend for token exchange.

### Authentication Flow

1. User clicks "Sign in with GitHub"
2. Redirects to GitHub OAuth authorization
3. GitHub redirects back to `/auth/callback` with authorization code
4. App calls Vercel API (`VITE_AUTH_PROXY_URL`) to exchange code for access token
5. Token is stored in localStorage and user is redirected back to their original location

### Environment Variables

Set these environment variables for your deployment:

- `VITE_GITHUB_CLIENT_ID`: Your GitHub OAuth app client ID
- `VITE_AUTH_PROXY_URL`: URL to your Vercel API endpoint (e.g., `https://release-dashboard.vercel.app/api`)
- `VITE_BASE_PATH`: Deployment base path (optional, defaults to `/release-automation`)

### Deployment

1. **Configure environment variables** in your GitHub repository:

   - Go to Settings → Secrets and variables → Actions
   - Add the environment variables above

2. **Push to main branch** - GitHub Actions will automatically:

   - Build the app with Node 20
   - Deploy to GitHub Pages

3. **Configure GitHub Pages**:

   - Go to repository Settings > Pages
   - Set source to "GitHub Actions"

4. **Access your app** at: `https://yourusername.github.io/release-automation/`

## 📁 Project Structure

```
src/
├── components/        # React Spectrum UI components
├── pages/            # Route components
│   ├── HomePage.tsx
│   ├── RepoPage.tsx
│   └── AuthCallback.tsx
├── lib/              # Utilities and hooks
│   ├── hooks/        # Custom React hooks
│   ├── types.ts      # TypeScript type definitions
│   ├── auth.ts       # Authentication logic
│   └── github.ts     # GitHub API client
└── main.tsx          # App entry point
```

## 🔧 Local Development Environment

Create a `.env.local` file for local development:

```env
VITE_GITHUB_CLIENT_ID=your_github_oauth_client_id
VITE_AUTH_PROXY_URL=https://release-dashboard.vercel.app/api
VITE_BASE_PATH=
```

## 🏗️ Build

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

## 📝 Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **UI Library**: Adobe React Spectrum
- **Routing**: React Router 7 (Hash Router for GitHub Pages)
- **Authentication**: GitHub OAuth with Vercel backend
- **Deployment**: GitHub Pages with GitHub Actions

## 🔐 Security

- Client secrets are kept secure on the Vercel backend
- Authorization codes are exchanged for tokens server-side
- Access tokens are stored in localStorage (consider using secure storage for production)
- Return URLs are preserved through the OAuth flow

## 🚧 Migration from Next.js

This project was migrated from Next.js to resolve React Spectrum hydration issues. The new Vite-based setup provides:

- ✅ No SSR hydration conflicts
- ✅ Faster development with HMR
- ✅ Perfect GitHub Pages compatibility
- ✅ Modern React 19 features
- ✅ Secure OAuth flow with backend token exchange

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `npm run dev`
5. Submit a pull request
