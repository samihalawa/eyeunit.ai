# Deploying EyeUnit.ai to Vercel

This document provides instructions for deploying the EyeUnit.ai project to Vercel.

## Prerequisites

1. A Vercel account (Sign up at [vercel.com](https://vercel.com))
2. [Vercel CLI](https://vercel.com/docs/cli) installed (optional, for local testing)
3. Git repository with your project code

## Environment Variables

Make sure to set up the following environment variables in your Vercel project settings:

- `HUGGINGFACE_API_KEY`: Your Hugging Face API key
- `EMAIL_USER`: Email address used for sending contact form messages
- `EMAIL_PASS`: Password or app password for the email account
- `EMAIL_FROM`: From address for sent emails
- `EMAIL_TO`: Recipient email address for contact form submissions
- `NODE_ENV`: Set to `production` for production deployment

## Deployment Steps

### Option 1: Deploy with Vercel Dashboard

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Log in to your Vercel account
3. Click "New Project" in the Vercel dashboard
4. Import your repository
5. Configure project:
   - Set the Framework Preset to "Other"
   - Configure environment variables from the list above
6. Click "Deploy"

### Option 2: Deploy with Vercel CLI

1. Install the Vercel CLI:
   ```
   npm i -g vercel
   ```

2. Log in to your Vercel account:
   ```
   vercel login
   ```

3. Navigate to your project directory and run:
   ```
   vercel
   ```

4. Follow the prompts to configure your project
5. To deploy to production, run:
   ```
   vercel --prod
   ```

## Vercel Configuration

The project includes a `vercel.json` file that configures the build process and routing for Vercel deployment. The key configurations are:

- **Builds**: Defines how different file types should be built/processed
- **Routes**: Maps URL patterns to the appropriate destinations
- **Environment Variables**: Specifies required environment variables

## Serverless Functions

The `/api` directory contains serverless functions that handle backend operations:

- `/api/health.js`: Health check endpoint
- `/api/config.js`: Provides application configuration
- `/api/contact.js`: Handles contact form submissions

## Troubleshooting

- **Function Execution Errors**: Check Vercel function logs in the dashboard
- **Build Failures**: Verify that all dependencies are correctly specified in package.json
- **Routing Issues**: Review the routes configuration in vercel.json

## Local Testing Before Deployment

To test the application locally before deployment:

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with your environment variables (see `.env.example`)

3. Run the development server:
   ```
   npm run dev
   ```

4. For testing Vercel Functions locally, install and use the Vercel CLI:
   ```
   vercel dev
   ``` 