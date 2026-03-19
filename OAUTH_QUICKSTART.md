# Google OAuth - Quick Start Guide

## TL;DR - Get Started in 5 Minutes

### 1. Get Your Client ID (2 min)
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create new project "Nexora"
- Go to APIs & Services > Credentials
- Create OAuth 2.0 Web Application credential
- Copy the **Client ID**

### 2. Set Up Environment (1 min)
```bash
# Create .env.local
echo "REACT_APP_GOOGLE_CLIENT_ID=paste_your_client_id_here" > .env.local
```

### 3. Add Redirect URIs (1 min)
In Google Cloud Console, add these to your OAuth credential:
```
http://localhost:3000
http://localhost:3000/
```

### 4. Test It (1 min)
```bash
npm start
# Visit http://localhost:3000
# Click "Sign in with Google"
# Complete OAuth flow
```

## Architecture

```
Landing Page (isLanding=true)
    ↓
Login Component
    ↓
Google OAuth Flow
    ↓
Google Auth Service (handles token)
    ↓
App Component (isAuthenticated=true)
    ↓
Full App Access
```

## Key Files

| File | Purpose |
|------|---------|
| `components/Login.tsx` | Login UI with Google button |
| `services/googleAuthService.ts` | OAuth token management |
| `App.tsx` | Auth state & session check |
| `GOOGLE_OAUTH_SETUP.md` | Detailed setup guide |

## Environment Variables

```env
REACT_APP_GOOGLE_CLIENT_ID=your_client_id
```

That's it! Just one variable needed.

## Testing Checklist

- [ ] App starts without errors
- [ ] Login page shows Google button
- [ ] Clicking button opens OAuth flow
- [ ] Successfully authenticate with Google
- [ ] Redirects to app home page
- [ ] Logout button appears in header
- [ ] Click logout returns to login
- [ ] Refresh page keeps you logged in

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Client ID not configured" | Restart dev server after adding .env.local |
| "Unauthorized redirect_uri" | Add current URL to Google OAuth credentials |
| Button not appearing | Check browser console for errors |
| OAuth popup blocked | Browser may have popup blocker - allow popups |

## File Structure

```
/vercel/share/v0-project/
├── components/
│   ├── Login.tsx                 ← NEW: Login page
│   ├── App.tsx                   ← MODIFIED: Auth state added
│   └── ...other components
├── services/
│   ├── googleAuthService.ts      ← NEW: OAuth service
│   ├── socketService.ts
│   └── ...other services
├── types.ts                       ← MODIFIED: Added email field
├── .env.example                   ← NEW: Environment template
├── GOOGLE_OAUTH_SETUP.md          ← NEW: Full setup guide
├── OAUTH_IMPLEMENTATION.md        ← NEW: Implementation details
├── OAUTH_VERIFICATION.md          ← NEW: Testing checklist
└── README.md
```

## Deployment to Vercel

1. Add `REACT_APP_GOOGLE_CLIENT_ID` to Vercel environment variables
2. Add your Vercel URL to Google OAuth redirect URIs
3. Deploy!

## Session Management

- **Token Storage**: sessionStorage (clears when tab closes)
- **Session Check**: App automatically restores session on load
- **Logout**: Clears sessionStorage and resets app

## Security Notes

✅ **Using Google's official SDK** - Not deprecated
✅ **Client ID only** - No secret exposed
✅ **sessionStorage** - Tokens cleared when tab closes
✅ **JWT validation** - Google handles token validation

## API Endpoints (Frontend Only)

No backend API calls needed for basic auth! All handled by:
1. Google Identity Services SDK
2. Frontend state management
3. sessionStorage for persistence

## Next Steps

1. Follow `GOOGLE_OAUTH_SETUP.md` for detailed setup
2. Use `OAUTH_VERIFICATION.md` to test
3. Deploy to Vercel with environment variable
4. Add backend API validation (optional, for enhanced security)

## Resources

- [Google Identity Services Docs](https://developers.google.com/identity/gsi/web)
- [Setup Guide](./GOOGLE_OAUTH_SETUP.md)
- [Implementation Details](./OAUTH_IMPLEMENTATION.md)
- [Testing Checklist](./OAUTH_VERIFICATION.md)

---

**Questions?** Check the documentation files or review the code comments in:
- `services/googleAuthService.ts`
- `components/Login.tsx`
