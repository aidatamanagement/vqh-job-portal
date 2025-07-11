# Environment Setup Guide

## Required Environment Variables

Create a `.env` file in your project root with the following variables:

```bash
# VQH Job Portal - Environment Variables
# Copy these variables to your .env file

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=[Your-Anon-Key-Here]

# Supabase Service Role Key (for server-side operations and edge functions)
SUPABASE_SERVICE_ROLE_KEY=[Your-Service-Role-Key-Here]

# Email Service (Brevo) - Replace with your actual API key
BREVO_API_KEY=your_brevo_api_key_here

# Calendly Integration - Replace with your actual API token  
CALENDLY_API_TOKEN=your_calendly_api_token_here

# Application Configuration
VITE_APP_URL=http://localhost:5173

# Database URL (for CLI operations)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres
```

## Setup Instructions

### 1. Create Local Environment File

```bash
# Create .env file in project root
touch .env

# Copy the variables above into the .env file
# Replace placeholder values with your actual API keys
```

### 2. Configure Supabase Edge Functions

In your Supabase Dashboard → Edge Functions → Secrets, add:

- `SUPABASE_URL` = `https://your-project-ref.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` = `[Your-Service-Role-Key-Here]`
- `BREVO_API_KEY` = `[Your Brevo API Key]`
- `CALENDLY_API_TOKEN` = `[Your Calendly API Token]`

### 3. Production Deployment

When deploying to production, configure these same environment variables in your hosting platform's environment variables section.

## Security Notes

- ✅ Never commit the `.env` file to version control
- ✅ The `.env` file should be in your `.gitignore`
- ✅ Use different values for development and production
- ✅ Rotate API keys regularly for security 