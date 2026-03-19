# Google OAuth Implementation - Complete Flow Diagram

## Complete Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     USER ARRIVES AT APP                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    App.tsx checks:
                    - sessionStorage has token?
                    - sessionStorage has user?
                          ↓        ↓
                        YES      NO
                         ↓        ↓
            ┌─────────────┴────────┴──────────────┐
            ↓                                      ↓
        RESTORE SESSION              SHOW LOGIN PAGE
        ├─ Set currentUser            ├─ Display Nexora branding
        ├─ Set isAuthenticated        ├─ Show "Sign in with Google" button
        ├─ Load to home page          └─ Initialize Google Auth Service
        └─ Show full app
                                              ↓
                                    USER CLICKS SIGN IN
                                              ↓
                        Login.tsx triggers OAuth flow
                              ↓
            Google Identity Services takes over
                  (user selects account & grants permission)
                              ↓
                    Google sends JWT token to app
                              ↓
            googleAuthService.ts extracts user info
                    (decode JWT payload)
                              ↓
            Custom event: 'google-auth-success'
                              ↓
            Login component receives event
                              ↓
            handleAuthSuccess() in App.tsx:
            ├─ Store token in sessionStorage
            ├─ Store user data in sessionStorage
            ├─ Set currentUser state
            ├─ Set isAuthenticated = true
            ├─ Redirect to app home
            └─ Show full interface
                              ↓
                  ┌─────────────────────┐
                  │ USER LOGGED IN ✓    │
                  │ Can access app      │
                  │ Logout button ready │
                  └─────────────────────┘
```

## Component Hierarchy

```
App.tsx
│
├─ Check isAuthenticated
│  ├─ if false → <Login />
│  └─ if true → continue
│
├─ Check if still landing page
│  └─ if true → show landing CTA
│
├─ Check if onboarding
│  └─ if true → show profile completion form
│
└─ Show Full App
   ├─ <Sidebar />
   │  ├─ Communities list
   │  └─ Navigation
   │
   ├─ <Header />
   │  ├─ Dark mode toggle
   │  └─ Logout button ← LOGOUT HERE
   │
   └─ Main Content
      ├─ <Home />
      ├─ <Explore />
      ├─ <CommunityDashboard />
      ├─ <ChatWindow /> (with socket integration)
      └─ <ProjectView />
```

## Data Flow

### Initial State
```javascript
isAuthenticated = false
currentUser = null
isLanding = true
```

### After Google OAuth Success
```javascript
isAuthenticated = true
currentUser = {
  id: "google-user-id",
  email: "user@gmail.com",
  name: "User Name",
  avatar: "https://...",
  role: "Builder",
  college: "",
  bio: "",
  skills: [],
  githubUrl: "",
  linkedinUrl: "",
  reputation: 100,
  hasOnboarded: false
}
```

### After Logout
```javascript
isAuthenticated = false
currentUser = null
isLanding = true
// sessionStorage cleared
```

## Service Integration

### Google Auth Service
```
googleAuthService.initialize()
    ↓
Load Google Identity Services SDK
    ↓
Create callback for credential response
    ↓
Ready to handle OAuth
    ↓
googleAuthService.renderButton() or googleAuthService.signIn()
    ↓
User completes OAuth flow
    ↓
Callback receives JWT token
    ↓
Event dispatched: 'google-auth-success'
    ↓
App component receives event
    ↓
Store token & user in sessionStorage
```

## Socket Integration

```
App mounts
    ↓
Check authentication
    ↓
if (isAuthenticated) {
    Initialize Socket Connection
        ↓
    Listen for 'message:receive'
    Listen for 'dm:receive'
        ↓
    Ready for real-time chat
}
```

## State Management Tree

```
App.tsx (Parent)
│
├─ useState: isAuthenticated
│  └─ Controls: Login vs Full App
│
├─ useState: currentUser
│  └─ Passes to all components needing user data
│
├─ useState: isLanding
│  └─ Controls: Landing page vs onboarding vs app
│
├─ useState: darkMode
│  └─ Applied to: document.documentElement.classList
│
├─ Onboarded? YES
│  └─ isOnboarding = false
│
└─ Onboarded? NO
   └─ isOnboarding = true
      └─ Show profile completion form
         └─ After completion → isOnboarding = false
```

## Session Persistence

```
User Load (first visit)
    ↓
useEffect checks sessionStorage
    ├─ google_auth_token found?
    ├─ nexora_user found?
    └─ Both present?
         ↓ YES
    Restore session
    ├─ setCurrentUser(storedUser)
    ├─ setIsAuthenticated(true)
    └─ Skip login page
         ↓ NO
    Show login page
    (user needs to authenticate)
```

## Token Lifecycle

```
1. INITIAL
   └─ No token

2. AFTER LOGIN
   ├─ sessionStorage['google_auth_token'] = JWT
   ├─ sessionStorage['nexora_user'] = userData
   └─ Token valid until tab closes

3. TAB REFRESH
   ├─ useEffect checks sessionStorage
   ├─ Token found → Restore session
   └─ User stays logged in (same tab)

4. NEW TAB/WINDOW
   ├─ sessionStorage is empty
   ├─ useEffect finds nothing
   └─ Show login page (new login needed)

5. AFTER LOGOUT
   ├─ sessionStorage.removeItem('google_auth_token')
   ├─ sessionStorage.removeItem('nexora_user')
   ├─ setIsAuthenticated(false)
   └─ Show login page
```

## Error Handling Flow

```
OAuth Attempt
    ↓
No Client ID?
├─ YES → Show error: "Google Client ID not configured"
└─ NO → Continue
    ↓
Google OAuth fails?
├─ YES → Catch error in window event listener
│        Show error message to user
│        User can retry
└─ NO → Continue
    ↓
Token storage fails?
├─ YES → Log warning, continue (tokens in memory)
└─ NO → Store successfully
    ↓
Redirect to app
```

## Browser Storage

```
sessionStorage (Tab-specific, cleared on close)
├─ google_auth_token: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ..."
└─ nexora_user: "{\"id\":\"...\",\"name\":\"...\",\"email\":\"...\"}"

localStorage (Optional future use)
└─ Not used currently

Cookies (Optional future use)
└─ Could store HttpOnly token for backend validation
```

## Environment Variables

```
.env.local (development)
└─ REACT_APP_GOOGLE_CLIENT_ID=abc123...

Vercel (production)
├─ Settings → Environment Variables
├─ Key: REACT_APP_GOOGLE_CLIENT_ID
├─ Value: abc123...
└─ Apply to: Production, Preview, Development
```

## Browser DevTools Inspection

```
DevTools → Application → Session Storage
├─ Key: google_auth_token
│  └─ Value: eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ...
│     (JWT Token - Base64 encoded)
│
└─ Key: nexora_user
   └─ Value: {"id":"123","name":"John","email":"john@gmail.com",...}

DevTools → Network
└─ accounts.google.com/gsi/client (loaded from Google CDN)

DevTools → Console
├─ No errors related to auth
├─ No client secret exposed
└─ Auth events logged for debugging
```

## Security Boundaries

```
FRONTEND (React App)
├─ Google OAuth SDK (Official)
├─ Client ID stored in env vars
├─ Tokens in sessionStorage
├─ User data in state
└─ NO SECRETS EXPOSED

BACKEND (Future)
├─ Token validation endpoint
├─ User database
├─ Refresh token handling
└─ Session management

GOOGLE SERVERS
├─ OAuth credential storage
├─ Token generation & validation
├─ User account management
└─ Secure OAuth flow
```

## Deployment Checklist

```
LOCAL
├─ .env.local with Client ID
├─ Google OAuth redirect: http://localhost:3000
└─ npm start works, OAuth flow complete

VERCEL
├─ Environment variable set: REACT_APP_GOOGLE_CLIENT_ID
├─ Google OAuth redirect: https://nexora.vercel.app
├─ Deploy trigger build with env var
└─ Visit URL, test OAuth flow complete
```

---

This flow ensures secure, seamless Google OAuth integration with proper state management and error handling.
