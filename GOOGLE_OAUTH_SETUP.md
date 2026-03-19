# Google OAuth Setup Guide for Nexora

## Overview
This guide walks you through setting up Google OAuth 2.0 authentication for the Nexora application. Users can now sign in with their Google accounts instead of entering manual credentials.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "NEW PROJECT"
4. Enter "Nexora" as the project name
5. Click "CREATE"
6. Wait for the project to be created (1-2 minutes)

## Step 2: Enable the Google Identity Services API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Identity Services API"
3. Click on it and click "ENABLE"

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click "CREATE CREDENTIALS" at the top
3. Select "OAuth client ID"
4. If prompted to create a consent screen first:
   - Click "Create Consent Screen"
   - Select "External"
   - Fill in the required fields:
     - App name: "Nexora"
     - User support email: [Your email]
     - Developer contact: [Your email]
   - Click "SAVE AND CONTINUE"
   - On the "Scopes" page, click "SAVE AND CONTINUE"
   - On the "Summary" page, click "BACK TO DASHBOARD"

5. Now create the OAuth 2.0 credential:
   - Go to **APIs & Services** > **Credentials**
   - Click "CREATE CREDENTIALS" > "OAuth client ID"
   - Select "Web application"
   - Name it "Nexora Web Client"
   - Under "Authorized redirect URIs", add:
     - `http://localhost:3000`
     - `http://localhost:3000/` (with trailing slash)
     - `http://localhost:5173` (if using Vite)
     - Your production domain (e.g., `https://nexora.vercel.app`)
   - Click "CREATE"

6. Copy the **Client ID** - you'll need this for the next step

## Step 4: Configure Environment Variables

### For Local Development

Create a `.env.local` file in the project root:

```env
REACT_APP_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
```

Replace `YOUR_CLIENT_ID_HERE` with the Client ID you copied in Step 3.

### For Vercel Deployment

1. Go to your Vercel project settings
2. Navigate to **Settings** > **Environment Variables**
3. Add a new variable:
   - Key: `REACT_APP_GOOGLE_CLIENT_ID`
   - Value: Your Client ID
   - Environments: Select all (Production, Preview, Development)
4. Click "Save"
5. Deploy your project - Vercel will rebuild with the new environment variable

## Step 5: Test the OAuth Flow

1. Start your development server: `npm start` (or `yarn start` / `pnpm dev`)
2. Navigate to `http://localhost:3000` (or your dev server URL)
3. You should see the Nexora landing page with a "Sign in with Google" button
4. Click the button to test the OAuth flow
5. You'll be prompted to select your Google account and grant permissions
6. After successful authentication, you'll be redirected to the app

## Step 6: Custom Domain (Optional)

If you're deploying to a custom domain:

1. Return to Google Cloud Console > **APIs & Services** > **Credentials**
2. Click on your OAuth 2.0 client ID
3. Under "Authorized redirect URIs", add your custom domain:
   - `https://yourdomain.com`
   - `https://yourdomain.com/`
4. Click "SAVE"

## Troubleshooting

### "Google Client ID not configured" Error
- Make sure `REACT_APP_GOOGLE_CLIENT_ID` is set in your `.env.local`
- Restart your development server after adding the environment variable
- In Vercel, make sure the environment variable is deployed and the project is rebuilt

### "Unauthorized redirect_uri" Error
- This means the redirect URL isn't registered in your Google Cloud Console
- Go back to **APIs & Services** > **Credentials**
- Click your OAuth client ID
- Add the current URL to "Authorized redirect URIs"

### Sign-in button not appearing
- Check browser console for errors (F12)
- Make sure Google Identity Services script loads properly
- Verify that the container element with ID `google-signin-button` exists in the DOM

### Session expires after refresh
- Tokens are stored in `sessionStorage` which clears when the tab/window closes
- For persistent login, implement localStorage or backend session management

## Architecture Overview

### Frontend Flow
1. **Login Component** (`components/Login.tsx`) - Displays Google Sign-In button
2. **Google Auth Service** (`services/googleAuthService.ts`) - Manages OAuth flow
3. **App Component** (`App.tsx`) - Handles auth state and redirects

### Key Components
- `Login.tsx` - Landing page with Google Sign-In button
- `googleAuthService.ts` - Handles Google OAuth initialization and token management
- `App.tsx` - Manages authentication state and session persistence

### Token Storage
- Tokens are stored in `sessionStorage` under the key `google_auth_token`
- User data is stored in `sessionStorage` under the key `nexora_user`
- These are cleared on logout

## Security Considerations

1. **Never expose Client Secret** - Only use Client ID on the frontend
2. **HTTPS in Production** - Always use HTTPS for production deployments
3. **Token Validation** - For sensitive operations, validate tokens on the backend
4. **Scope Management** - Only request necessary OAuth scopes
5. **Token Expiration** - Implement backend token refresh for long-lived sessions

## Next Steps

1. Add backend authentication endpoint to validate tokens
2. Implement persistent login with refresh tokens
3. Add profile completion flow after first sign-in
4. Set up user profile pictures from Google account
5. Integrate with database for user persistence

## Support

For more information about Google OAuth:
- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [OAuth 2.0 Overview](https://developers.google.com/identity/protocols/oauth2)
