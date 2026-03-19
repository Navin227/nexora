# Nexora Authentication System Guide

## Overview
The Nexora authentication system uses a two-path approach:
- **Sign Up**: Phone verification via OTP + Username/Password creation + Profile setup
- **Login**: Username/Password only

All users receive a static email: `team@nexora.app`

## Architecture

### Files
- `services/authService.ts` - Core authentication logic
- `components/Auth.tsx` - Authentication UI with all flows
- `App.tsx` - Main app that checks auth state

### Data Storage
- **Dev/Local**: localStorage for registered users, sessionStorage for active session
- **Production**: AWS Cognito for user pool management

## Authentication Flows

### Sign Up Flow (4 Steps)
```
1. Phone + Username Selection
   ├─ Validate phone format (10+ digits)
   ├─ Validate username (3-20 chars, alphanumeric + underscore)
   └─ Check availability

2. OTP Verification
   ├─ 6-digit OTP sent to phone
   ├─ 5-minute expiry
   ├─ 5 attempt limit
   └─ Dev mode shows OTP in blue banner

3. Password Setup
   ├─ Min 8 characters
   ├─ Uppercase letter required
   ├─ Lowercase letter required
   ├─ Number required
   ├─ Special character (!@#$%^&*) required
   └─ Password strength indicator

4. Profile Setup
   ├─ Full name (required)
   ├─ College/University (required)
   ├─ Role (Student/Developer/Designer/Founder/Other)
   ├─ Bio (optional)
   └─ Auto-generated avatar via Dicebear API
```

### Login Flow (Simple)
```
1. Username & Password entry
2. Credential verification
3. Automatic session creation
4. Redirect to app
```

## Key Classes & Methods

### authService

#### Validation Methods
```typescript
validatePhoneNumber(phoneNumber: string): boolean
validateUsername(username: string): { valid: boolean; message?: string }
validatePassword(password: string): { valid: boolean; message?: string }
```

#### Registration Methods
```typescript
isPhoneRegistered(phoneNumber: string): boolean
isUsernameAvailable(username: string): boolean
requestSignUpOTP(phoneNumber: string, username: string): { success, message, otp? }
verifySignUpOTP(phoneNumber: string, otp: string): { success, message }
completeSignUp(phoneNumber, username, password, profileData): { success, message, user? }
```

#### Login Methods
```typescript
login(username: string, password: string): { success, message, user? }
getUser(username: string): AuthUser | null
```

## Password Requirements (Strong)
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)
- ✅ At least one special character (!@#$%^&*)

Examples:
- ❌ `password` - No uppercase, no number, no special char
- ❌ `Password1` - No special character
- ✅ `Password1!` - Valid
- ✅ `MyP@ssw0rd` - Valid

## Username Rules
- Length: 3-20 characters
- Allowed: Letters (a-z, A-Z), numbers (0-9), underscore (_)
- Examples:
  - ✅ `john_doe`
  - ✅ `user123`
  - ❌ `ab` - Too short
  - ❌ `user-name` - Hyphen not allowed
  - ❌ `user@123` - Special chars not allowed

## Session Management

### Session Storage Keys
```typescript
'nexora_auth_token'   // JWT/session token
'nexora_user'         // Serialized User object
'nexora_username'     // Username for quick reference
```

### Session Lifecycle
1. Created after successful login/signup
2. Persists during browser session
3. Cleared on logout or browser close
4. Restored on page reload if token exists

## AWS Cognito Integration (Production)

Replace the following methods with Cognito API calls:

```typescript
// Current (localStorage-based)
const result = authService.requestSignUpOTP(phoneNumber, username);

// Replace with (Cognito)
const result = await cognito.signUp({
  username: username,
  password: password,
  attributes: {
    phone_number: phoneNumber,
    email: STATIC_EMAIL
  }
});
```

## Testing Sign-Up Flow

### Dev Mode
1. Click "Create Account"
2. Enter any phone (e.g., `1234567890`)
3. Choose username (e.g., `testuser123`)
4. OTP appears in blue dev banner
5. Enter OTP
6. Set strong password
7. Complete profile

### Test Credentials
```
Username: testuser123
Password: TestPass123!
Phone: 1234567890
```

## Error Handling

Common error messages:
- "Phone number already registered" → Use different number or login
- "Username already taken" → Choose different username
- "Invalid phone number format" → Enter 10+ digits
- "Password must contain..." → Add required characters
- "OTP expired" → Request new OTP
- "Username or password incorrect" → Check credentials

## Frontend Components

### Auth.tsx
- Handles all auth flows
- Mode switching (auth-selection → login/signup paths)
- Form validation and error display
- Password strength indicator
- Loading states

## API Response Format
All auth methods return:
```typescript
{
  success: boolean;
  message: string;
  user?: AuthUser;
  otp?: string; // Only in dev mode
  isPhone?: boolean; // Login only
}
```

## Security Notes
⚠️ **Development Only**
- Passwords hashed with Base64 (for demo)
- OTP shown in console and UI

⚠️ **Production Requirements**
- Use bcrypt for password hashing
- Implement AWS Cognito
- Enable HTTPS only
- Use secure session cookies
- Implement rate limiting on auth endpoints
- Add email verification
- Enable MFA (optional)

## Troubleshooting

### OTP Not Showing
- Check browser console for OTP code
- Ensure you're in development mode
- Clear localStorage and try again

### Username Not Available
- Already taken by another user
- Try: `username123`, `username_new`, etc.

### Password Validation Error
- Check for all required character types
- Min 8 chars, uppercase, lowercase, number, special char
- Example valid: `NewUser@2024`

### Session Lost After Refresh
- Auth token expired or deleted
- Re-login with username/password
- No need for OTP on subsequent logins

## Future Enhancements
- [ ] Email verification during signup
- [ ] SMS provider integration (Twilio)
- [ ] AWS Cognito full integration
- [ ] Password reset flow
- [ ] Social login (GitHub, LinkedIn)
- [ ] 2FA/MFA support
- [ ] Biometric authentication
