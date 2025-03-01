# EyeUnit.ai Website

Website for EyeUnit.ai, featuring AI-powered ophthalmology solutions.

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
HUGGINGFACE_API_KEY=your_huggingface_api_key
EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
```

**Important**: Never commit the `.env` file to version control. It's already added to `.gitignore`.

4. Start the development server:
```bash
npm run dev
```

The site will be available at `http://localhost:3000`

## Environment Variables

- `HUGGINGFACE_API_KEY`: HuggingFace API key for the chatbot
- `EMAIL_USER`: Gmail address for sending contact form emails
- `EMAIL_PASS`: Gmail app password for sending emails

## Features

- AI Chatbot using HuggingFace's Qwen model
- Contact form with email notifications
- Responsive design
- Blog section
- Rate limiting for API endpoints

## Security Notes

- API keys and credentials are stored in environment variables
- Rate limiting is implemented on sensitive endpoints
- CORS and security headers are configured
- All credentials are loaded from `.env` file, never hardcoded

## Development

- Use `npm run dev` for development with hot reloading
- Run tests with `npm test`
- The chatbot widget is modular and can be found in `/components/chatbot/`

## Deploying to Cloudflare Pages

### Initial Setup

1. Push the code to GitHub:
```bash
git add .
git commit -m "Prepare for Cloudflare deployment"
git push
```

2. Connect your GitHub repository to Cloudflare Pages:
   - Go to Cloudflare Dashboard > Pages
   - Click "Create a project" > "Connect to Git"
   - Select your GitHub repository
   - Configure build settings:
     - Build command: `npm run build` (or leave empty if no build needed)
     - Build output directory: `/` (root) or your build output directory
   - Click "Save and Deploy"

### Environment Setup

1. Add environment variables in the Cloudflare Pages dashboard:
   - Go to your Pages project > Settings > Environment variables
   - Add the `HUGGINGFACE_API_KEY` variable with your API key
   - Set these for both Production and Preview environments

### Using Cloudflare Functions

The project includes Cloudflare Functions in the `/functions` directory to handle API endpoints in a serverless manner:

- `/api/config` - Securely provides the HuggingFace API key to the chat widget
- `/api/health` - Health check endpoint for monitoring

These functions will automatically be deployed when you publish to Cloudflare Pages.

### Testing Cloudflare Deployment

After deployment, verify your API endpoints are working:

1. Check the health endpoint:
```bash
curl https://your-project.pages.dev/api/health
```

2. Test the chat widget on the live site to ensure it can retrieve the API key.

### Troubleshooting

If the chatbot doesn't work after deployment:

1. Check browser console for errors
2. Verify API key is set correctly in Cloudflare environment variables
3. Test API endpoints directly using curl or browser
4. Check Cloudflare Functions logs in the dashboard

## Cloudflare vs Local Development

The application is designed to work in both environments:

- **Local Development**: Uses the Express server to serve API endpoints
- **Cloudflare Production**: Uses Cloudflare Functions for API endpoints

The chat widget automatically detects which environment it's running in and adjusts its API requests accordingly.
