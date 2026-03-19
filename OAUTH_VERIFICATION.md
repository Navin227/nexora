# Google OAuth Setup Verification Checklist

## Pre-Setup Checklist

- [ ] You have a Google account
- [ ] You have access to Google Cloud Console
- [ ] Node.js and npm are installed locally
- [ ] You have a Vercel account (for deployment)

## Setup Checklist

### Google Cloud Configuration
- [ ] Created a Google Cloud Project named "Nexora"
- [ ] Enabled Google Identity Services API
- [ ] Created an OAuth 2.0 Web Application credential
- [ ] Copied the Client ID
- [ ] Added `http://localhost:3000` to authorized redirect URIs
- [ ] Added `http://localhost:3000/` to authorized redirect URIs
- [ ] Added production domain to authorized redirect URIs (if deploying)

### Local Environment Setup
- [ ] Created `.env.local` file in project root
- [ ] Added `REACT_APP_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID` to `.env.local`
- [ ] Replaced `YOUR_CLIENT_ID` with actual Client ID from Google Console
- [ ] Verified `.env.local` is in `.gitignore` (not committed to git)

### Code Verification
- [ ] Reviewed `components/Login.tsx` - Login page exists
- [ ] Reviewed `services/googleAuthService.ts` - OAuth service exists
- [ ] Reviewed `App.tsx` - Auth state management added
- [ ] Verified `types.ts` has email field in User interface
- [ ] Documentation files created:
  - [ ] `GOOGLE_OAUTH_SETUP.md`
  - [ ] `OAUTH_IMPLEMENTATION.md`
  - [ ] `.env.example`

### Testing Checklist

#### Local Testing
- [ ] `npm start` runs without errors
- [ ] App loads at `http://localhost:3000`
- [ ] See "Sign in with Google" button on landing page
- [ ] Click button triggers Google OAuth flow
- [ ] Can select a Google account
- [ ] Successfully authenticates and redirects to home page
- [ ] User data displays correctly after login
- [ ] Logout button appears in header
- [ ] Clicking logout clears session and returns to login
- [ ] Refreshing page maintains login session (sessionStorage)
- [ ] Browser console shows no auth-related errors

#### Browser DevTools Check
- [ ] Open DevTools (F12)
- [ ] Go to Application tab
- [ ] Check sessionStorage has keys:
  - [ ] `google_auth_token` - contains JWT token
  - [ ] `nexora_user` - contains user JSON data
- [ ] After logout, both keys are cleared from sessionStorage

#### Environment Variable Check
```javascript
// In browser console, verify env var is loaded:
console.log(process.env.REACT_APP_GOOGLE_CLIENT_ID)
// Should print your Client ID, not undefined
```

### Vercel Deployment

#### Pre-Deployment
- [ ] Tested OAuth locally and verified working
- [ ] Committed code to GitHub (except `.env.local`)
- [ ] `.env.local` is in `.gitignore`

#### Vercel Setup
- [ ] Connected GitHub repository to Vercel
- [ ] In Vercel project settings > Environment Variables:
  - [ ] Added `REACT_APP_GOOGLE_CLIENT_ID`
  - [ ] Selected all environments (Production, Preview, Development)
- [ ] Note your Vercel deployment URL (e.g., `nexora.vercel.app`)
- [ ] Added Vercel URL to Google OAuth redirect URIs:
  - [ ] `https://nexora.vercel.app`
  - [ ] `https://nexora.vercel.app/`

#### Post-Deployment Testing
- [ ] Deployment completed successfully
- [ ] Visit your Vercel URL
- [ ] See login page with "Sign in with Google" button
- [ ] Complete OAuth flow on Vercel
- [ ] Successfully authenticated on production
- [ ] Browser DevTools shows tokens in sessionStorage
- [ ] Logout works correctly

### Troubleshooting During Setup

#### Common Issues

**Issue: "Google Client ID not configured" error**
- [ ] Check `.env.local` file exists
- [ ] Verify `REACT_APP_GOOGLE_CLIENT_ID=...` is present
- [ ] Ensure no spaces around `=` sign
- [ ] Restart dev server: Stop (Ctrl+C) and run `npm start` again
- [ ] Confirm Client ID was copied correctly from Google Console

**Issue: "Unauthorized redirect_uri" error**
- [ ] Check the URL shown in the error message
- [ ] Go to Google Cloud Console > APIs & Services > Credentials
- [ ] Click your OAuth client ID
- [ ] Add the error URL to "Authorized redirect URIs"
- [ ] Save and try again

**Issue: Sign-in button not appearing**
- [ ] Open browser DevTools Console (F12)
- [ ] Look for errors (red text)
- [ ] Verify `components/Login.tsx` is being rendered
- [ ] Check that HTML element with ID `google-signin-button` exists
- [ ] Google Identity Services script should load (check Network tab)

**Issue: Session doesn't persist after refresh**
- [ ] This is expected behavior - sessionStorage clears on tab close
- [ ] For persistent login, implement localStorage or backend sessions
- [ ] Currently, tokens only last for the browser tab session

### Performance Verification

- [ ] App loads without noticeable delays
- [ ] Google OAuth popup appears within 2 seconds of button click
- [ ] OAuth flow completes within 30 seconds
- [ ] No console errors or warnings
- [ ] Bundle size hasn't increased dramatically

### Security Verification

- [ ] Client Secret is NOT anywhere in code or frontend
- [ ] Only Client ID is in environment variables
- [ ] Tokens are stored in sessionStorage (not localStorage by default)
- [ ] Logout clears all auth data
- [ ] No sensitive data logged to console in production

## Sign-Off

When all items are checked, your Google OAuth setup is complete and verified!

```
Date Completed: _______________
Tested By: ____________________
Issues Resolved: _______________
Production Ready: [ ] Yes [ ] No
```

## Next Steps After Verification

1. **User Profile**: Add profile completion flow after first login
2. **Backend Integration**: Validate tokens on backend API
3. **Database**: Store user data in database instead of just sessionStorage
4. **Monitoring**: Set up error logging and analytics
5. **Enhancement**: Add more OAuth providers (GitHub, Discord, etc.)

## Support

If you encounter issues not listed here:
1. Check browser console for error messages
2. Review `GOOGLE_OAUTH_SETUP.md` troubleshooting section
3. Check Google Cloud Console logs
4. Verify all environment variables are set correctly
5. Clear browser cache and cookies, then try again
