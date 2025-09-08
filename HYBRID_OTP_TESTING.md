# Hybrid OTP Authentication System Testing Guide

## Overview
The PeerRent application now uses a revolutionary **Hybrid OTP Authentication System** that combines:
- A 4-digit **Secret PIN** (memorized by the user)
- A 4-digit **Email Code** (sent to user's email)
- Combined into an 8-digit login key

## Testing the Authentication System

### Prerequisites
1. **Mailtrap Account**: Sign up at [mailtrap.io](https://mailtrap.io) for email testing
2. **Update .env file** with your Mailtrap credentials:
   ```env
   MAIL_HOST=smtp.mailtrap.io
   MAIL_PORT=2525
   MAIL_USER=your_actual_mailtrap_username
   MAIL_PASS=your_actual_mailtrap_password
   ```

### Step 1: Registration Flow
1. Visit `http://localhost:3000/register`
2. Enter your email address
3. Choose a 4-digit PIN (e.g., `1234`)
4. Click "Create Account"
5. You should be redirected to the login page

### Step 2: Login Flow
1. Visit `http://localhost:3000/login`
2. Enter your email address
3. Click "Send Login Code"
4. Check your Mailtrap inbox for the 4-digit code
5. On the verification page, combine your PIN + email code
   - Example: PIN `1234` + Email Code `5678` = Enter `12345678`
6. Click "Complete Login"
7. You should receive a JWT token or be logged in

### Step 3: Testing Protected Routes
Once you have a JWT token, you can test protected routes:

```bash
# Example: Create an item (replace YOUR_TOKEN with actual token)
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Camera",
    "description": "Professional DSLR camera for rent",
    "dailyPrice": 50
  }'
```

## API Endpoints

### New Authentication Endpoints
- `POST /api/users/register` - Register with email and 4-digit PIN
- `POST /api/users/login/request-code` - Request login code via email
- `POST /api/users/login/verify-otp` - Verify 8-digit OTP and get JWT token

### Frontend Pages
- `GET /register` - Registration form
- `GET /login` - Email entry for login
- `GET /verify-otp` - OTP verification (rendered by controller)

## Security Features

1. **No Password Storage**: Passwords are completely eliminated
2. **PIN Hashing**: 4-digit PINs are hashed with bcrypt
3. **OTP Expiration**: Email codes expire after 10 minutes
4. **OTP Cleanup**: Used OTPs are immediately cleared from database
5. **Input Validation**: All inputs are validated for correct format
6. **Duplicate Prevention**: Prevents duplicate OTP requests

## Error Scenarios to Test

1. **Invalid PIN Format**: Try non-4-digit PINs during registration
2. **Invalid OTP Format**: Try non-8-digit codes during login
3. **Expired OTP**: Wait 10+ minutes then try to login
4. **Wrong Email Code**: Enter incorrect email code
5. **Wrong PIN**: Enter incorrect PIN
6. **Non-existent User**: Try to login with unregistered email

## Email Template
The system sends emails with this format:
```
Subject: Your PeerRent Login Code
Body: Your temporary login code is: [4-digit-code]. This code will expire in 10 minutes.
```

## Migration from Old System
**IMPORTANT**: The old password-based authentication has been completely replaced. Existing users will need to:
1. Re-register with the new PIN-based system
2. Use the new login flow with email codes

## Troubleshooting

### Email Not Received
1. Check Mailtrap inbox (not your real email)
2. Verify MAIL_* environment variables are correct
3. Check server logs for email sending errors

### Authentication Failures
1. Ensure JWT_SECRET is set in .env
2. Check that MongoDB is connected
3. Verify user exists in database
4. Confirm OTP hasn't expired

### Development Tips
- Use Mailtrap to avoid sending real emails during testing
- OTP codes are visible in server console logs for debugging
- JWT tokens have 1-hour expiration by default
- Clear browser storage if testing frontend cookie sessions

## Production Considerations
Before deploying to production:
1. Configure real SMTP server (instead of Mailtrap)
2. Use secure JWT_SECRET
3. Consider rate limiting for OTP requests
4. Implement account lockout after failed attempts
5. Add captcha for registration/login forms
