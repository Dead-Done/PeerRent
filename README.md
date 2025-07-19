# PeerRent

A peer-to-peer rental platform API built with Node.js, Express, and MongoDB.

## SPRINT1

## Features

- User authentication (register/login)
- Item management (CRUD operations)
- RESTful API endpoints

## API Endpoints

### Users
- POST /api/users/register - Register a new user
- POST /api/users/login - Login user

### Items
- GET /api/items - Get all items
- GET /api/items/:id - Get single item
- POST /api/items - Create new item
- PUT /api/items/:id - Update item
- DELETE /api/items/:id - Delete item

## Setup
1. Clone the repository
2. Run `npm install`
3. Create `.env` file with your MongoDB connection string
4. Run `node server.js`