# Hostinger Deployment Guide for AthPlan

This guide walks you through deploying your React/Vite application to Hostinger using GitHub integration.

## Prerequisites

1.  **GitHub Repository**: Ensure this project is pushed to a GitHub repository.
2.  **Hostinger Account**: Access to your Hostinger control panel.

## Step 1: Push to GitHub

If you haven't already pushed your code to GitHub:

1.  Create a new repository on GitHub.
2.  Run the following commands in your terminal (project root):

```bash
git init
git add .
git commit -m "Initial commit for Hostinger deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## Step 2: Hostinger Configuration

1.  Log in to Hostinger and navigate to **Websites**.
2.  Click **Add Website** or **Manage** an existing one.
3.  Look for **Git Deployment** or **Continuous Deployment** (often under the 'Advanced' or 'Files' section).
4.  **Connect GitHub**: detailed instructions may vary, but generally:
    - Authorize Hostinger to access your GitHub account.
    - Select your `athplan-landing-page` repository.
    - Select the `main` branch.

## Step 3: Build Settings

Hostinger might attempt to auto-detect settings, but verify them:

-   **Build Command**: `npm run build`
    -   *Note*: This runs `vite build` as defined in your package.json.
-   **Publish Directory / Output Directory**: `dist`
    -   *Note*: Vite outputs the production build to the `dist` folder by default.
-   **Root Directory**: `/` (Leave empty or set to root).

## Step 4: Environment Variables

**CRITICAL STEP**: Your application requires API keys to function.

1.  In the Hostinger deployment settings, find the **Environment Variables** section.
2.  Add the following key-value pair:
    -   **Key**: `GEMINI_API_KEY`
    -   **Value**: *[Your actual Gemini API Key]*

> [!WARNING]
> Since this is a frontend-only deployment, the API Key will be embedded in the public code. Ensure your Gemini API Key has **restrictions** set in the Google Cloud Console to only allow requests from your specific domain (e.g., `https://your-site.com`).

## Step 5: Deploy

1.  Click **Deploy**.
2.  Wait for the build process to complete.
3.  Visit your URL to verify the site is working.
    -   Check the browser console (F12) for any red errors if something isn't loading.

## Troubleshooting

-   **White Screen / 404s**:
    -   Ensure the **Publish Directory** is set to `dist`.
    -   **Client-Side Routing**: A `.htaccess` file has been added to your `public/` folder to handle routing. Ensure this file is present in your `dist/` folder after building.

