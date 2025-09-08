# PeerRent Hybrid OTP Demo Script

## Quick Demo Walkthrough

### 1. Access the Application
```
Open your browser and go to: http://localhost:3000
```

### 2. Registration Demo
1. Click "Join Community" from the home page
2. Enter email: `demo@example.com`
3. Enter PIN: `1234`
4. Click "Create Account"
5. You'll be redirected to login page

### 3. Login Demo
1. Enter email: `demo@example.com`
2. Click "Send Login Code"
3. Check your Mailtrap inbox for the 4-digit code (e.g., `5678`)
4. On verification page, enter: `12345678` (PIN: 1234 + Code: 5678)
5. Click "Complete Login"
6. You'll receive a JWT token

### 4. Test Protected Features
Once logged in with JWT token:

#### Create an Item
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Professional Camera",
    "description": "Canon EOS R5 for photography and videography",
    "dailyPrice": 75
  }'
```

#### View Your Listings
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3000/my-listings
```

## Key Features Demonstrated

✅ **Passwordless Authentication**: No passwords anywhere in the system
✅ **Email Integration**: Real email sending via Mailtrap
✅ **PIN Security**: Bcrypt-hashed 4-digit PINs
✅ **OTP Validation**: 8-digit combination validation
✅ **JWT Integration**: Seamless token-based authentication
✅ **Route Protection**: Authenticated-only features
✅ **User Experience**: Clean, intuitive interface

## Security Highlights

1. **No Password Storage**: Eliminates password-related vulnerabilities
2. **Time-Limited Codes**: Email codes expire in 10 minutes
3. **Immediate Cleanup**: Used OTPs are cleared from database
4. **Input Validation**: Strict format validation for PINs and OTPs
5. **Hashed Storage**: PINs are bcrypt-hashed, never stored in plain text

## Production Readiness

The system is designed for production deployment with:
- Environment-based configuration
- Robust error handling
- Security best practices
- Scalable architecture
- Clean separation of concerns

Ready to revolutionize authentication! 🚀
