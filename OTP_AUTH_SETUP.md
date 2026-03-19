# OTP Authentication Setup Guide for Nexora

## Overview

Nexora now uses Phone Number + OTP authentication instead of Google OAuth. This provides a simpler, more direct authentication method using a static email (`team@nexora.app`) for all users.

## How It Works

### Authentication Flow

1. **Phone Number Entry**: User enters their phone number
2. **OTP Generation**: System generates a 6-digit OTP
3. **OTP Verification**: User enters the OTP to verify their number
4. **Profile Setup**: User completes their profile (name, college, role, bio)
5. **Authentication**: User is logged in and redirected to the app

### Development Mode

In development, the OTP is:
- Displayed in the browser console
- Shown in a blue banner on the login screen for convenience
- Valid for 5 minutes
- Limited to 5 incorrect attempts

## File Structure

- `services/otpAuthService.ts` - Core OTP authentication logic
- `components/OTPLogin.tsx` - Login UI component
- `App.tsx` - Updated with OTP session management
- `.env.example` - Environment variables template

## Environment Variables

No environment variables are required for development mode.

For production with SMS delivery, add these to your `.env` or Vercel environment:

```env
REACT_APP_SMS_PROVIDER=twilio
REACT_APP_TWILIO_ACCOUNT_SID=your_account_sid
REACT_APP_TWILIO_AUTH_TOKEN=your_auth_token
REACT_APP_TWILIO_PHONE_NUMBER=+1234567890
```

## Local Development Setup

1. **Clone and install**:
   ```bash
   git clone https://github.com/Navin227/nexora.git
   cd nexora
   npm install
   ```

2. **Run the app**:
   ```bash
   npm start
   ```

3. **Test login**:
   - Go to http://localhost:5173
   - Enter any phone number (e.g., +1-555-123-4567)
   - Click "Send OTP"
   - Copy the OTP from the blue banner or browser console
   - Enter it and click "Verify OTP"
   - Complete your profile
   - You're logged in!

## Session Storage

Authentication data is stored in `sessionStorage`:
- `nexora_auth_token` - Authentication token
- `nexora_user` - User profile data (JSON)
- `nexora_phone` - User's phone number

Session persists across page reloads but clears when browser tab is closed.

## OTP Validation

- **Format**: 6 digits only
- **Expiry**: 5 minutes
- **Max Attempts**: 5 wrong attempts before requiring new OTP
- **Rate Limiting**: One OTP per phone number at a time

## Authentication Methods

### Development (Current)
- OTP shown in console and UI
- No SMS provider needed
- Perfect for testing

### Production (To Implement)
- Integrate with Twilio for SMS delivery
- Update `otpAuthService.ts` to send actual SMS
- Add environment variables to Vercel

## Security Notes

1. **No Passwords**: Phone number + OTP eliminates password management
2. **Static Email**: All users share `team@nexora.app` as their email
3. **Session-Based**: Authentication cleared on browser close
4. **Phone Validation**: Basic validation of phone number format

## Testing Scenarios

### Test Case 1: Successful Login
1. Enter phone number: +1-555-123-4567
2. Enter OTP from console
3. Fill profile information
4. Submit to complete login

### Test Case 2: Invalid OTP
1. Enter phone number
2. Enter wrong OTP
3. Verify error message
4. Try again with correct OTP

### Test Case 3: Expired OTP
1. Enter phone number
2. Wait >5 minutes
3. Try to verify OTP
4. Error: "OTP expired"

### Test Case 4: Max Attempts
1. Enter phone number
2. Enter wrong OTP 5 times
3. Error: "Too many attempts"
4. Request new OTP

## Logout

Click the logout button in the top-right of the app. This will:
- Clear all session data
- Redirect to login page
- Require re-authentication

## Integration with SMS Providers

To send actual SMS in production:

1. **Update otpAuthService.ts**:
   ```typescript
   private sendSMS(phoneNumber: string, otp: string) {
     // Integrate with Twilio/other provider
     // twilio.messages.create({
     //   body: `Your Nexora OTP is: ${otp}`,
     //   from: process.env.REACT_APP_TWILIO_PHONE_NUMBER,
     //   to: phoneNumber
     // })
   }
   ```

2. **Add Vercel environment variables**
3. **Test with real phone numbers**

## Troubleshooting

### OTP not appearing in console
- Check browser console (F12)
- OTP appears when "Send OTP" is clicked
- Look for log line: `[OTP Service] OTP for [phone]: [code]`

### Session not persisting
- Check sessionStorage in DevTools
- Ensure browser allows sessionStorage
- Check for private/incognito mode

### Phone number validation fails
- Phone numbers must have at least 10 digits
- International format works: +1-555-123-4567
- Spaces and dashes are allowed

## Future Enhancements

- [ ] Implement Twilio SMS integration
- [ ] Add WhatsApp/Telegram OTP options
- [ ] Implement rate limiting per phone number
- [ ] Add phone number history/device management
- [ ] Implement backup authentication methods
