# Vercel Environment Variables Setup

## Local Development (.env.local)
Your `.env.local` file has been created with the Google OAuth credentials.

## Vercel Deployment

### Step 1: Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add the following variable:

```
Variable Name: REACT_APP_GOOGLE_CLIENT_ID
Value: 182423811530-k6rjebgadqqqulrdsebg5o46fadp8r1b.apps.googleusercontent.com
Environments: Production, Preview, Development
```

### Step 2: Authorized Redirect URIs in Google Console

Make sure your Vercel domain is added to Google OAuth credentials:

In Google Cloud Console → OAuth 2.0 Client IDs → Web Client:

**Authorized JavaScript Origins:**
- `https://your-vercel-domain.vercel.app`
- `https://nexora.vercel.app` (if using custom domain)

**Authorized Redirect URIs:**
- `https://your-vercel-domain.vercel.app/auth/callback`
- `https://nexora.vercel.app/auth/callback`

### Step 3: Deploy

```bash
git add .env.local
git commit -m "Add Google OAuth environment variables"
git push
```

Your Vercel deployment will automatically pick up the environment variables from the project settings.

## Security Notes

- Never commit `.env.local` to git (it's in .gitignore)
- The Client Secret should only be used on the backend
- Keep your credentials secure and regenerate them if exposed
- Use different OAuth credentials for production vs development

## Troubleshooting

**"Google Client ID not configured" error:**
- Ensure REACT_APP_GOOGLE_CLIENT_ID is added to your environment
- For local development, create `.env.local` in the project root
- For Vercel, add it in project Settings → Environment Variables

**"Unauthorized redirect_uri" error:**
- Make sure your domain is added to Google OAuth credentials
- Include the protocol (https:// or http://) in the URIs
- Wait a few minutes for Google to process the changes
