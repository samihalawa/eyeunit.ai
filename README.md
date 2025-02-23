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
