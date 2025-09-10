# PeerRent

A peer-to-peer rental platform built with Node.js, Express, MongoDB, and EJS templating.

## 🚀 Project Overview

PeerRent is a community-driven platform where users can rent items from each other. Think of it as "Airbnb for things" - share what you have and discover what you need in your community.

## ✨ Features

### Sprint 1 - Backend Foundation ✅
- **User Authentication**: Revolutionary hybrid OTP system with JWT tokens
- **Item Management**: Full CRUD operations with image upload support
- **RESTful API**: Complete API endpoints for all operations
- **Database Integration**: MongoDB with Mongoose ODM

### Sprint 2 - Frontend Views ✅
- **Marketplace Page**: Browse all available rental items with search
- **New Item Form**: Create and list new rental items with image upload
- **My Listings Page**: Manage your own rental items
- **Responsive Design**: Modern, mobile-friendly interface

### Sprint 3 - Rental & Review System ✅
- **Rental Request System**: Request to rent items from other users
- **Review System**: Rate and review users after completed rentals
- **User Profile Pages**: View user profiles with ratings and reviews
- **Search Functionality**: Search for items by name in the marketplace

### Sprint 4 - Authentication & Security ✅
- **JWT Authentication Middleware**: Protect routes with JWT tokens
- **Route Protection**: Secure user-specific functionality
- **Owner-based Item Management**: Users can only manage their own items
- **Authenticated Rental System**: Secure rental request creation and management

### Sprint 5 - Hybrid OTP Authentication ✅
- **Passwordless Login**: Revolutionary hybrid OTP system eliminates passwords
- **4-digit Secret PIN**: User-memorized PIN for enhanced security
- **Email-based Codes**: Dynamic 4-digit codes sent via email
- **8-digit Login Key**: Combination of PIN + email code for authentication
- **Email Integration**: Nodemailer with Mailtrap for development testing

### Admin Control Panel ✅
- **Dual Authentication System**: Separate admin login with session management
- **User Management**: View and manage all user accounts
- **Item Moderation**: Monitor and delete items across the platform
- **Rental Oversight**: View all rental transactions and statuses
- **Analytics Dashboard**: Platform statistics and overview

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: EJS templating engine with inline CSS styling
- **Authentication**: Dual system - Hybrid OTP (JWT) + Session-based Admin
- **Email Service**: Nodemailer with Mailtrap for development
- **File Upload**: Multer for image handling and storage
- **Security**: bcrypt PIN hashing, httpOnly cookies, CSRF protection
- **Styling**: Inline CSS within EJS templates for responsive design
- **Form Handling**: Method-override for PUT/DELETE operations

## 📋 API Endpoints

### User Authentication (Hybrid OTP System)
- `POST /api/users/register` - Register with email + 4-digit PIN
- `POST /api/users/login/request-code` - Request 4-digit email code
- `POST /api/users/login/verify-otp` - Verify 8-digit key (PIN + code)
- `GET /api/users/logout` - Logout user (clear JWT cookie)

### Items Management (Protected Routes)
- `GET /api/items` - Get all items (public - JSON)
- `GET /api/items/:id` - Get single item (public)
- `POST /api/items` - Create new item (requires auth + image upload)
- `PUT /api/items/:id` - Update item (requires auth + ownership)
- `DELETE /api/items/:id` - Delete item (requires auth + ownership)

### Rental System (Protected Routes)
- `POST /rentals/:itemId` - Create rental request for item
- `POST /rentals/:rentalId/status` - Update rental status (accept/decline/complete)
- `POST /rentals/:rentalId/review` - Submit review after completed rental

### Admin Panel (Session-based Authentication)
- `GET /admin` - Admin login page
- `POST /admin/login` - Admin authentication
- `GET /admin/dashboard` - Admin dashboard with statistics
- `GET /admin/users` - Manage users
- `GET /admin/items` - Manage items
- `GET /admin/rentals` - View all rentals
- `POST /admin/items/:itemId/delete` - Admin delete item

### Frontend Pages (View Routes)
- `GET /` - Home page
- `GET /marketplace` - Browse all items with search
- `GET /login` - User login form
- `GET /register` - User registration form
- `GET /items/new` - Create item form (requires auth)
- `GET /my-listings` - User's items management (requires auth)
- `GET /my-rentals` - User's rental requests (requires auth)
- `GET /manage-rentals` - Manage requests for user's items (requires auth)
- `GET /items/edit/:id` - Edit item form (requires auth + ownership)
- `GET /users/:userId/profile` - User profile with reviews
- `GET /rentals/:rentalId/review` - Review form (requires auth)

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database (local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PeerRent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/peerrent
   # Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/peerrent

   # JWT Authentication
   JWT_SECRET=your_super_secret_jwt_key_here

   # Admin Session Security
   SESSION_SECRET=your_session_secret_key_here

   # Email Configuration (Mailtrap for development)
   MAIL_HOST=sandbox.smtp.mailtrap.io
   MAIL_PORT=2525
   MAIL_USER=your_mailtrap_username
   MAIL_PASS=your_mailtrap_password

   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

4. **Email Service Setup (Required for OTP)**
   - Sign up for a free [Mailtrap](https://mailtrap.io) account
   - Get your SMTP credentials from Mailtrap inbox
   - Update your `.env` file with the Mailtrap credentials

5. **Database Setup**
   - For MongoDB Atlas: Get your connection string from Atlas dashboard
   - For local MongoDB: Use `mongodb://localhost:27017/peerrent`
   - Make sure to whitelist your IP address in Atlas if using cloud database

6. **Run the application**
   ```bash
   node server.js
   ```
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

7. **Access the application**
   - Main app: `http://localhost:3000`
   - Admin panel: `http://localhost:3000/admin`
   - API endpoints: `http://localhost:3000/api/`

## 📁 Project Structure

```
PeerRent/
├── config/                  # Configuration files
│   ├── adminConfig.js       # Admin credentials (change for production)
│   └── mailer.js           # Email service configuration
├── controllers/            # Business logic layer
│   ├── adminController.js  # Admin panel functionality
│   ├── itemController.js   # Item CRUD operations
│   ├── userController.js   # User auth & profile management
│   └── rentalController.js # Rental system & reviews
├── middleware/             # Authentication & security
│   ├── auth.js            # JWT middleware & user checking
│   └── adminAuth.js       # Session-based admin authentication
├── models/                 # Database schemas (Mongoose)
│   ├── Item.js            # Rental items with image support
│   ├── User.js            # Users with hybrid OTP system
│   ├── RentalRequest.js   # Rental transactions
│   └── Review.js          # User review system
├── routes/                 # API endpoints & view routes
│   ├── adminRoutes.js     # Admin panel routes
│   ├── itemRoutes.js      # Item API with image upload
│   ├── userRoutes.js      # User authentication API
│   ├── rentalRoutes.js    # Rental system API
│   └── viewRoutes.js      # Frontend page routes
├── views/                  # EJS templates
│   ├── home.ejs           # Landing page
│   ├── login.ejs          # User login (step 1)
│   ├── verify-otp.ejs     # OTP verification (step 2)
│   ├── register.ejs       # User registration
│   ├── marketplace.ejs    # Browse items with search
│   ├── newItem.ejs        # Create item form
│   ├── editItem.ejs       # Edit item form
│   ├── myListings.ejs     # User's items management
│   ├── my-rentals.ejs     # User's rental requests
│   ├── manage-rentals.ejs # Manage incoming requests
│   ├── profile.ejs        # User profiles with reviews
│   ├── leave-review.ejs   # Review form
│   ├── admin-login.ejs    # Admin login page
│   ├── admin-dashboard.ejs# Admin overview
│   ├── admin-users.ejs    # User management
│   ├── admin-items.ejs    # Item moderation
│   ├── admin-rentals.ejs  # Rental oversight
│   └── partials/          # Reusable template components
│       └── header.ejs     # Navigation header
├── uploads/                # User-uploaded item images
├── imagesrc/              # Static design assets
├── server.js              # Main application entry point
├── package.json           # Dependencies & scripts
└── README.md             # This file
```

## 🔐 Authentication & Security

The application uses a **Dual Authentication System**:

### **User Authentication - Hybrid OTP System**
PeerRent implements a revolutionary passwordless authentication system:

#### **How It Works**
1. **Registration**: User provides email + creates 4-digit Secret PIN
2. **Login Step 1**: User enters email → system sends 4-digit code via email
3. **Login Step 2**: User combines PIN + email code = 8-digit login key
4. **Authentication**: System validates and issues JWT token in secure cookie

#### **Security Features**
- **Passwordless**: No passwords stored or transmitted anywhere
- **Two-Factor**: PIN (something you know) + Email (something you have)
- **Time-Limited**: Email codes expire after 10 minutes
- **Encrypted**: PINs are bcrypt-hashed in database
- **Secure Storage**: JWT tokens in httpOnly cookies prevent XSS

#### **Token Management**
- JWT tokens stored in secure, httpOnly cookies
- 1-hour expiration with automatic refresh
- Dual location support: cookies (preferred) + Authorization header

### **Admin Authentication - Session System**
- **Traditional Login**: Admin ID + Password (stored in config/adminConfig.js)
- **Session-based**: Uses Express sessions (24-hour expiration)
- **Separate System**: Independent from user JWT authentication
- **Production Ready**: Change credentials in adminConfig.js for production

### **Route Protection Patterns**

**Public Routes** (no authentication):
- Home, marketplace, user profiles
- Login/registration pages

**Protected User Routes** (`isAuthenticated` middleware):
- Item creation, editing, deletion
- Rental requests and management
- User dashboard pages

**Admin Routes** (`requireAdmin` middleware):
- Admin dashboard and management panels
- User/item/rental moderation

**Global Middleware** (`checkUser`):
- Runs on every request
- Makes user data available in templates
- Enables conditional navigation rendering

## 🎯 User Flow

### **New User Journey**
1. **Home Page** (`/`) - Welcome with registration call-to-action
2. **Registration** (`/register`) - Create account with email + 4-digit PIN
3. **Login Process** (`/login` → `/verify-otp`) - Hybrid OTP authentication
4. **Marketplace** (`/marketplace`) - Browse available items with search
5. **Create Listings** (`/items/new`) - List items for rent with images
6. **Manage Activity** (`/my-listings`, `/my-rentals`) - Track your items and requests

### **Rental Workflow**
1. **Browse** (`/marketplace`) - Find items to rent
2. **Request** - Click "Request Rental" on any item
3. **Owner Review** (`/manage-rentals`) - Owner accepts/declines requests
4. **Rental Active** - Item is rented out
5. **Complete & Review** (`/rentals/:id/review`) - Both parties can leave reviews

### **Admin Oversight**
1. **Admin Login** (`/admin`) - Separate authentication system
2. **Dashboard** (`/admin/dashboard`) - Platform statistics overview
3. **Management** (`/admin/users`, `/admin/items`, `/admin/rentals`) - Full platform control

## 🔧 Development

### Adding New Features
- Controllers: Add business logic in `controllers/`
- Models: Define data schemas in `models/`
- Routes: Create API endpoints in `routes/`
- Views: Build user interface in `views/`

### Database Models

**User Model:**
```javascript
{
  email: String (required, unique),           // User identifier
  hashedSecret: String (required),            // bcrypt-hashed 4-digit PIN
  otp: String (temporary),                    // 4-digit email code
  otpExpires: Date (temporary),               // OTP expiration time
  role: String (enum: ['user', 'admin']),    // User role (default: 'user')
  timestamps: true                            // createdAt, updatedAt
}
```

**Item Model:**
```javascript
{
  name: String (required),                    // Item display name
  description: String (required),             // Item details
  dailyPrice: Number (required, min: 0),     // Rental price per day
  images: [String],                           // Array of image filenames
  owner: ObjectId (references User, required), // Item owner
  timestamps: true
}
```

**RentalRequest Model:**
```javascript
{
  item: ObjectId (references Item, required),   // Rented item
  renter: ObjectId (references User, required), // Person renting
  owner: ObjectId (references User, required),  // Item owner
  status: String (enum: ['pending', 'accepted', 'declined', 'completed']),
  timestamps: true
}
```

**Review Model:**
```javascript
{
  rental: ObjectId (references RentalRequest, required), // Associated rental
  reviewer: ObjectId (references User, required),       // Review author
  reviewee: ObjectId (references User, required),       // Person being reviewed
  rating: Number (1-5, required),                       // Star rating
  comment: String (required),                           // Review text
  timestamps: true
}
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure your `MONGODB_URI` in `.env` is correct
- For Atlas: Check if your IP is whitelisted in MongoDB Atlas
- For local: Ensure MongoDB service is running (`mongod`)
- Verify network connectivity

### Authentication Issues
- **JWT Errors**: Check `JWT_SECRET` is set in `.env`
- **Email Not Sending**: Verify Mailtrap credentials in `.env`
- **Admin Login Failed**: Check credentials in `config/adminConfig.js`

### File Upload Issues
- Ensure `uploads/` directory has write permissions
- Check file size limits (5MB max per image)
- Verify supported formats: JPEG, PNG, GIF, WebP

### Port Issues
- Change `PORT` in `.env` file if 3000 is already in use
- Ensure no other application is using the same port
- Check firewall settings if accessing from other devices

### Environment Variables
- Copy `.env.example` to `.env` if exists
- Never commit `.env` file to version control
- Ensure all required variables are set (see installation guide)

## 📚 Additional Documentation

- `HYBRID_OTP_TESTING.md` - Detailed authentication testing guide
- `ADMIN_SETUP.md` - Admin panel configuration
- `AUTHENTICATION_TESTING.md` - Authentication system testing
- `SIMPLE_ADMIN_GUIDE.md` - Quick admin guide
- `DEMO_SCRIPT.md` - Feature demonstration script

## 📝 TODO / Future Enhancements

### High Priority
- [ ] Image optimization and resizing for uploaded photos
- [ ] Enhanced search with filters (price range, category, location)
- [ ] Real-time notifications for rental requests and status updates
- [ ] Mobile responsive improvements and PWA support

### Medium Priority
- [ ] Payment integration (Stripe/PayPal) for rental transactions
- [ ] Calendar system for rental availability and scheduling
- [ ] Item categories and tagging system
- [ ] Advanced user verification and trust system
- [ ] Messaging system between renters and owners
- [ ] Rental insurance and damage reporting

### Low Priority
- [ ] Mobile app development (React Native/Flutter)
- [ ] Social media integration and sharing
- [ ] Multi-language support (i18n)
- [ ] Advanced analytics and reporting for users
- [ ] API rate limiting and enhanced security measures
- [ ] Automated backup and disaster recovery system

### Security Enhancements
- [ ] Two-factor authentication for admin accounts
- [ ] Enhanced input validation and sanitization
- [ ] Rate limiting for authentication endpoints
- [ ] Audit logging for admin actions
- [ ] HTTPS enforcement in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request


## 🎥 Demo

Watch the project demos showcasing different sprint developments:

### Development Progress
- **Sprint 1** (Backend Foundation): [YouTube Video](https://youtu.be/_oPPr1LLhsg)
- **Sprint 2** (Frontend Views): [YouTube Video](https://youtu.be/Wb7Vj1PFbMI)
- **Sprint 3+** (Full Platform): *Coming soon*

### Key Features Demonstrated
- Hybrid OTP authentication system
- Item creation with image upload
- Rental request workflow
- Admin panel functionality
- User review system

---

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the established patterns
4. Test thoroughly including authentication flows
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Submit a pull request

### Development Guidelines
- Follow the existing code structure and naming conventions
- Update documentation for new features
- Ensure all authentication middleware is properly implemented
- Test both user and admin authentication systems
- Maintain compatibility with both form submissions and API calls

---

**Built with ❤️ for the community | PeerRent v2.0**
