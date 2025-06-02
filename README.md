# Release Automation

A tool for automating software releases and deployments, built with Next.js and GitHub Actions.

## Features

- Automated release management
- GitHub Actions integration
- TypeScript support
- Modern UI with responsive design
- GitHub Pages deployment

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## GitHub Pages Configuration

1. In your repository settings, enable GitHub Pages
2. Set the source to "GitHub Actions"
3. Push to the main branch to trigger deployment

## Development

- Run development server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

## Deployment

The app will automatically deploy to GitHub Pages when you push to the main branch. You can also manually trigger the deployment from the Actions tab in your repository.

The deployed site will be available at: `https://[your-username].github.io/release-automation`

## Project Structure

```
├── app/                # Next.js app directory
│   ├── layout.tsx     # Root layout
│   ├── page.tsx       # Home page
│   └── globals.css    # Global styles
├── .github/           # GitHub configuration
│   └── workflows/     # GitHub Actions workflows
├── next.config.mjs    # Next.js configuration
└── package.json       # Project dependencies
```
