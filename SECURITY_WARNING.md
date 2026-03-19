# SECURITY WARNING - CREDENTIALS EXPOSED

## Action Required Immediately

Your Google OAuth credentials were shared in the chat:
- Client ID: `182423811530-k6rjebgadqqqulrdsebg5o46fadp8r1b.apps.googleusercontent.com`
- Client Secret: `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`

**These credentials are now compromised and should be regenerated.**

## Steps to Regenerate

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services → Credentials**
4. Find your OAuth 2.0 Client ID (Web Client)
5. Click the trash icon to delete it
6. Create a new OAuth 2.0 Client ID:
   - Application Type: Web Application
   - Authorized JavaScript Origins: Your localhost and Vercel domains
   - Authorized Redirect URIs: Your callback URLs
7. Copy the new Client ID and Client Secret

## Update Your Project

### Local Development
1. Update `.env.local` with the new Client ID:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your_new_client_id
   ```

### Production (Vercel)
1. Update your Vercel project settings with the new Client ID:
   - Settings → Environment Variables
   - Update `REACT_APP_GOOGLE_CLIENT_ID`
   - Redeploy

## Client Secret Security

**Important:** The Client Secret should NEVER be stored in your React frontend code or `.env` files.

If you need to perform token exchange or refresh on the backend:
1. Store the Client Secret securely on your backend server only
2. Use environment variables on your backend (not committed to git)
3. Never expose it in frontend code or error messages

## Prevention

- Add `.env.local` to `.gitignore` (already done in this project)
- Never share credentials in chat, emails, or public repositories
- Use Vercel's secure environment variable system for production
- Rotate credentials regularly in production environments
