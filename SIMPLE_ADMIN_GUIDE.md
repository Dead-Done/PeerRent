# Simple Admin System Setup

## Admin Login Credentials

The admin system uses predetermined login credentials that are set in the `config/adminConfig.js` file.

**Current Default Credentials:**
- **Admin ID:** `admin123`
- **Admin Password:** `adminpass456`

## How to Access Admin Panel

1. **Go to the Admin Login Page:**
   ```
   http://localhost:3000/admin
   ```

2. **Enter the Admin Credentials:**
   - Admin ID: `admin123`
   - Admin Password: `adminpass456`

3. **Click "Access Admin Panel"**
   - You'll be redirected to the admin dashboard at `/admin/dashboard`

## Admin Features

- **Dashboard Statistics:** View total users, items, and active items
- **Secure Session:** Admin sessions are managed securely
- **Easy Logout:** Click the logout button to end your admin session

## Important Security Notes

🔒 **For Production Use:**
1. **Change the default credentials** in `config/adminConfig.js`
2. **Use strong passwords** with a mix of letters, numbers, and symbols
3. **Keep credentials secure** and don't share them
4. **Consider environment variables** for even better security

## Changing Admin Credentials

Edit the file `config/adminConfig.js`:

```javascript
const ADMIN_CREDENTIALS = {
    id: 'your-new-admin-id',
    password: 'your-new-secure-password'
};
```

Then restart your server for changes to take effect.

## System Requirements

- Node.js server must be running
- Express-session package installed (automatically installed)
- Sessions are stored in memory (for production, consider using a session store like Redis)

---

**Ready to use!** Simply navigate to `/admin` and login with the credentials above.
