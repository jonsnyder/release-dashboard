# Release Automation Dashboard

A GitHub release automation dashboard built with Next.js and React Spectrum. This application uses GitHub's OAuth for authentication and provides a clean interface for managing repository releases.

## Architecture

The application is split into two parts:

1. A static Next.js application hosted on GitHub Pages
2. A serverless authentication proxy hosted on Vercel

This separation allows us to maintain a static site while securely handling GitHub OAuth authentication.

## Prerequisites

- Node.js 18.x
- npm 8.x or later
- A GitHub account
- A Vercel account

## Setup Instructions

### 1. GitHub OAuth Application

1. Go to GitHub Settings > Developer Settings > OAuth Apps > New OAuth App
2. Fill in the application details:
   - Application name: `Release Automation` (or your preferred name)
   - Homepage URL:
     - Development: `http://localhost:3000`
     - Production: `https://jonsnyder.github.io/release-automation`
   - Authorization callback URL:
     - Development: `http://localhost:3000/auth/callback`
     - Production: `https://jonsnyder.github.io/release-automation/auth/callback`
3. Click "Register application"
4. Note down the Client ID
5. Generate a new client secret and note it down (you won't be able to see it again)

### 2. Vercel Authentication Proxy

1. Fork or clone this repository
2. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Deploy the authentication proxy:
   ```bash
   vercel
   ```
4. When prompted:

   - Set up and deploy "api"? Yes
   - Which scope? Choose your preferred scope
   - Link to existing project? No
   - What's your project name? release-automation-auth (or your preference)
   - In which directory is your code located? ./api

5. Add environment variables in the Vercel dashboard:
   - Go to your project settings
   - Add the following environment variables:
     ```
     GITHUB_CLIENT_ID=your_client_id_here
     GITHUB_CLIENT_SECRET=your_client_secret_here
     ```

### 3. Local Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/jonsnyder/release-automation.git
   cd release-automation
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file:

   ```
   NEXT_PUBLIC_AUTH_PROXY_URL=your_vercel_deployment_url/api
   NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
   ```

   Replace the values with your actual Vercel deployment URL and GitHub OAuth app client ID.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open http://localhost:3000 in your browser

### 4. Production Deployment (GitHub Pages)

1. Update `next.config.mjs`:

   ```javascript
   const isProduction = process.env.NODE_ENV === "production";
   const basePath = isProduction ? "/release-automation" : "";

   const nextConfig = {
     output: "export",
     basePath,
     assetPrefix: basePath,
     images: {
       unoptimized: true,
     },
     trailingSlash: true,
   };

   export default nextConfig;
   ```

2. Create `.github/workflows/deploy.yml`:

   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [main]

   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - uses: actions/setup-node@v2
           with:
             node-version: "18"
         - run: npm ci
         - run: npm run build
         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./out
   ```

3. Enable GitHub Pages in your repository settings:

   - Go to Settings > Pages
   - Source: Deploy from a branch
   - Branch: gh-pages

4. Update environment variables in GitHub repository settings:

   - Go to Settings > Secrets and variables > Actions
   - Add the following variables:
     ```
     NEXT_PUBLIC_AUTH_PROXY_URL=your_vercel_deployment_url/api
     NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
     ```

5. Push to main branch to trigger deployment:
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push
   ```

## Development Workflow

1. Make changes to the code
2. Test locally using `npm run dev`
3. Commit and push changes
4. GitHub Actions will automatically deploy to GitHub Pages
5. Vercel will automatically deploy API changes

## Troubleshooting

### Common Issues

1. OAuth Error (404):

   - Check that your GitHub OAuth app URLs match your deployment URLs
   - Verify environment variables are set correctly

2. Authentication Failed:

   - Check browser console for errors
   - Verify Vercel environment variables
   - Check GitHub OAuth app settings

3. Build Errors:
   - Make sure Node.js version is 18.x
   - Clear `.next` directory and node_modules
   - Run `npm ci` instead of `npm install`

### Getting Help

If you encounter issues:

1. Check the browser console for errors
2. Look at Vercel function logs
3. Review GitHub Actions build logs
4. Open an issue in the repository

## License

MIT License - see LICENSE file for details
