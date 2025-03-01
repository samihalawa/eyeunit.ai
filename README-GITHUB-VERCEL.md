# GitHub to Vercel Deployment for EyeUnit.ai

This document provides instructions for setting up automatic deployments from GitHub to Vercel.

## Prerequisites

1. A GitHub account 
2. A Vercel account (Sign up at [vercel.com](https://vercel.com))
3. The EyeUnit.ai codebase ready for deployment

## Setting Up GitHub Repository

1. Create a new GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/eyeunit.ai.git
   git push -u origin main
   ```

2. Make sure the repository contains all the necessary files:
   - `vercel.json` - Vercel configuration
   - `/api` directory with serverless functions
   - All static files and assets

## Setting Up Vercel Project

### Option 1: Using Vercel Dashboard (Recommended)

1. Log in to your Vercel account at [vercel.com](https://vercel.com)
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Configure the project settings:
   - Framework preset: Select "Other"
   - Root directory: `./` (default)
   - Build command: `npm run vercel-build`
   - Output directory: (leave empty)
5. Add environment variables:
   - `HUGGINGFACE_API_KEY`: Your Hugging Face API key
   - `EMAIL_USER`: Email address for contact form
   - `EMAIL_PASS`: Email password
   - `EMAIL_FROM`: From email address
   - `EMAIL_TO`: Recipient email address
6. Click "Deploy"

### Option 2: Using GitHub Actions (Automated CI/CD)

1. In your Vercel account, get the following:
   - Vercel Personal Access Token (from Account Settings)
   - Vercel Organization ID (from Project Settings)
   - Vercel Project ID (from Project Settings)

2. Add these as secrets in your GitHub repository:
   - Go to your repository on GitHub
   - Navigate to "Settings" > "Secrets and variables" > "Actions"
   - Add the following secrets:
     - `VERCEL_TOKEN`: Your Vercel Personal Access Token
     - `VERCEL_ORG_ID`: Your Vercel Organization ID
     - `VERCEL_PROJECT_ID`: Your Vercel Project ID

3. Add your environment variables to Vercel:
   - Go to your project in the Vercel dashboard
   - Navigate to "Settings" > "Environment Variables"
   - Add all required environment variables as listed above

4. The GitHub Actions workflow file (`.github/workflows/vercel-deploy.yml`) is already set up to:
   - Run on pushes to the `main` branch
   - Install dependencies
   - Build the project
   - Deploy to Vercel production

## Testing the Deployment

1. After deployment, verify that:
   - The website loads correctly
   - The API endpoints work (health check, config)
   - The contact form submits successfully
   - The chat widget functions as expected

2. Test with:
   ```bash
   curl https://your-vercel-domain.vercel.app/api/health
   ```

## Troubleshooting

- **Build Failures**: Check the Vercel deployment logs for any errors
- **API Issues**: Ensure all environment variables are correctly set
- **Function Timeouts**: Review the function code for performance issues
- **Missing Assets**: Ensure all static files are included in the repository

## Local Development

Before pushing changes, test locally:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with required environment variables

3. Run the development server:
   ```bash
   npm run dev
   ```

4. For testing Vercel Functions locally, use:
   ```bash
   vercel dev
   ``` 