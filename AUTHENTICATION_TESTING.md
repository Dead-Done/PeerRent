# Authentication Testing Guide

## Testing the Authentication System

### 1. Register a New User
Send a POST request to register a new user:

```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

This should return a JWT token like:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login with Existing User
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Test Protected Routes
Use the token from step 1 or 2 in the Authorization header:

#### Create a New Item (Protected)
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Test Item",
    "description": "This is a test item",
    "dailyPrice": 25
  }'
```

#### Access My Listings Page (Protected)
```bash
curl -X GET http://localhost:3000/my-listings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Test Without Token (Should Fail)
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Item",
    "description": "This should fail",
    "dailyPrice": 25
  }'
```

This should return "Not authorized, no token"

### 4. Test Public Routes (Should Work Without Token)
```bash
# Get all items (public)
curl -X GET http://localhost:3000/api/items

# Access marketplace (public)
curl -X GET http://localhost:3000/marketplace
```

## Frontend Testing

1. Visit `http://localhost:3000/marketplace` - Should work (public)
2. Visit `http://localhost:3000/my-listings` - Should return 401 without token
3. Visit `http://localhost:3000/items/new` - Should return 401 without token

## Notes for Frontend Integration

When implementing frontend authentication:

1. Store the JWT token in localStorage or a secure cookie
2. Include the token in the Authorization header for all protected requests
3. Handle 401 responses by redirecting to login page
4. For form submissions, you might need to include the token as a hidden field or use AJAX

Example JavaScript for including token in requests:
```javascript
const token = localStorage.getItem('token');
fetch('/api/items', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(itemData)
});
```
