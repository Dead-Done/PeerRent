# PeerRent

A peer-to-peer rental platform built with Node.js, Express, MongoDB, and EJS templating.

## 🚀 Project Overview

PeerRent is a community-driven platform where users can rent items from each other. Think of it as "Airbnb for things" - share what you have and discover what you need in your community.

## ✨ Features

### Sprint 1 - Backend Foundation ✅
- **User Authentication**: Register and login with JWT tokens
- **Item Management**: Full CRUD operations for rental items
- **RESTful API**: Complete API endpoints for all operations
- **Database Integration**: MongoDB with Mongoose ODM

### Sprint 2 - Frontend Views ✅
- **Marketplace Page**: Browse all available rental items
- **New Item Form**: Create and list new rental items
- **My Listings Page**: Manage your own rental items
- **Responsive Design**: Modern, mobile-friendly interface

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Frontend**: EJS templating engine
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: CSS3 with responsive design
- **Form Handling**: Method-override for PUT/DELETE operations

## 📋 API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user

### Items (API)
- `GET /api/items` - Get all items (JSON)
- `GET /api/items/:id` - Get single item
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Frontend Pages
- `GET /` - Home page
- `GET /marketplace` - Browse all items
- `GET /items/new` - Create new item form
- `GET /my-listings` - Manage your items

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
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=3000
   ```

4. **Database Setup**
   - For MongoDB Atlas: Get your connection string from Atlas dashboard
   - For local MongoDB: Use `mongodb://localhost:27017/peerrent`
   - Make sure to whitelist your IP address in Atlas if using cloud database

5. **Run the application**
   ```bash
   node server.js
   ```

6. **Access the application**
   - Open your browser and go to `http://localhost:3000`
   - The application will start with the home page

## 📁 Project Structure

```
PeerRent/
├── controllers/          # Business logic
│   ├── itemController.js
│   └── userController.js
├── models/              # Database schemas
│   ├── Item.js
│   └── User.js
├── routes/              # API and view routes
│   ├── itemRoutes.js
│   ├── userRoutes.js
│   └── viewRoutes.js
├── views/               # EJS templates
│   ├── home.ejs
│   ├── marketplace.ejs
│   ├── newItem.ejs
│   └── myListings.ejs
├── server.js            # Main application file
├── package.json
└── README.md
```

## 🎯 User Flow

1. **Home Page** (`/`) - Landing page with call-to-action buttons
2. **Marketplace** (`/marketplace`) - Browse all available rental items
3. **List New Item** (`/items/new`) - Create a new rental listing
4. **My Listings** (`/my-listings`) - Manage your own items (view, edit, delete)

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
  email: String (required, unique),
  password: String (required, hashed),
  timestamps: true
}
```

**Item Model:**
```javascript
{
  name: String (required),
  description: String (required),
  dailyPrice: Number (required), // Price in BDT (Taka)
  owner: ObjectId (references User, required),
  timestamps: true
}
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure your MongoDB connection string is correct
- Check if your IP is whitelisted in MongoDB Atlas
- Verify network connectivity

### Port Issues
- Change the PORT in `.env` file if 3000 is already in use
- Ensure no other application is using the same port

## 📝 TODO / Future Enhancements

- [ ] User profile management
- [ ] Item categories and search
- [ ] Booking system
- [ ] Payment integration
- [ ] Image upload for items
- [ ] User reviews and ratings
- [ ] Email notifications
- [ ] Mobile app

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request


## 🎥 Demo

Watch the project's progress through our sprint demos:
- **Sprint 1 (Backend & API):** [Watch on YouTube](https://youtu.be/_oPPr1LLhsg)
- **Sprint 2 (Frontend UI):** [Watch on YouTube](https://youtu.be/Wb7Vj1PFbMI)

---

**Built with ❤️ for the community**
