# Admin Setup Instructions for PeerRent

## How to Create the First Admin User

Since the admin system is now implemented, you need to manually create the first admin user for security reasons.

### Step-by-Step Process:

1. **Register a Normal Account**
   - Go to `http://localhost:3000/register`
   - Create a user account with your desired email and PIN
   - Complete the registration process

2. **Connect to Your MongoDB Database**
   - Option A: Use MongoDB Compass (recommended for GUI)
   - Option B: Use MongoDB command line interface
   - Option C: Use any MongoDB management tool

3. **Find Your User Document**
   - Navigate to your database (likely named `peerrent` or similar)
   - Open the `users` collection
   - Find the document with your email address

4. **Update the Role Field**
   - Locate the `role` field in your user document
   - Change the value from `"user"` to `"admin"`
   - Save the document

5. **Verify Admin Access**
   - Log out and log back in to the website
   - You should now see a red "Admin Dashboard" link in the navigation
   - Click it to access `/admin` and verify your admin privileges

### Example MongoDB Compass Steps:
1. Open MongoDB Compass
2. Connect to your local MongoDB instance
3. Navigate to your database → users collection
4. Find your user document
5. Click the edit button (pencil icon)
6. Change `"role": "user"` to `"role": "admin"`
7. Click the checkmark to save

### Example Command Line Steps:
```bash
# Connect to MongoDB
mongo

# Switch to your database
use peerrent

# Find your user
db.users.find({email: "your-email@example.com"})

# Update the role
db.users.updateOne(
  {email: "your-email@example.com"},
  {$set: {role: "admin"}}
)
```

### Security Notes:
- Only trusted individuals should be given admin privileges
- Admin users have access to delete any items and view all platform data
- The first admin must always be created manually for security
- Additional admins can be created through the admin dashboard once implemented

### Current Admin Features:
- ✅ Platform statistics (user count, item count)
- ✅ Role-based access control
- ✅ Admin-only navigation link
- ✅ Secure middleware protection
- 🚧 User management (planned)
- 🚧 Item moderation (planned)
- 🚧 Advanced reporting (planned)

Once you have admin access, you can help develop and test additional admin features!
