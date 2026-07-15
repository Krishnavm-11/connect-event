# 🎉 ConnectEvent

A full-stack MERN Event Networking Platform that allows users to discover events, register, connect with attendees, and communicate through real-time event chat. The platform also provides dedicated dashboards for organizers and administrators to manage events, registrations, and users.

---

## Live Demo

### Frontend
https://connect-event-iota.vercel.app

### Backend API
https://connect-event-backend.onrender.com

---

# Features

## User

- User Registration & Login
- JWT Authentication
- Browse Events
- Search Events
- Filter Events by Category
- View Event Details
- Register for Events
- Cancel Registration
- View Registered Events
- Real-time Event Chat
- Networking Suggestions
- User Dashboard

---

## Organizer

- Organizer Login
- Create Events
- Edit Events
- Delete Events
- Upload Event Banner
- View Attendees
- Manage Own Events

---

## Admin

- Admin Login
- Dashboard
- Approve Events
- Manage Users
- Manage Organizers
- View Registrations
- Analytics Dashboard
- Contact Management

---

## Real-Time Chat

- Socket.IO Integration
- Event-specific Chat Rooms
- Live Messaging
- Instant Updates

---

## Image Upload

- Cloudinary Integration
- Event Banner Upload

---

## Responsive Design

- Mobile Friendly
- Tablet Friendly
- Desktop Friendly

---

# Tech Stack

## Frontend

- React.js
- React Router DOM
- Tailwind CSS
- Axios
- Context API
- Socket.IO Client
- Lucide React

---

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- Socket.IO
- Multer
- Cloudinary

---

## Database

- MongoDB Atlas

---

## Deployment

- Frontend – Vercel
- Backend – Render
- Database – MongoDB Atlas
- Images – Cloudinary

---

# Folder Structure

```
ConnectEvent
│
├── client
│   ├── src
│   ├── public
│   └── package.json
│
├── server
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── uploads
│   └── server.js
│
└── README.md
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/Krishnavm-11/connect-event.git
```

```
cd connect-event
```

---

## Install Frontend

```bash
cd client
npm install
```

---

## Install Backend

```bash
cd server
npm install
```

---

# Environment Variables

Create a `.env` file inside the **server** folder.

```env
PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name

CLOUDINARY_API_KEY=your_api_key

CLOUDINARY_API_SECRET=your_api_secret
```

---

# Run Project

## Backend

```bash
cd server
npm run dev
```

---

## Frontend

```bash
cd client
npm run dev
```

---

# API Endpoints

## Authentication

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
```

---

## Events

```
GET    /api/events
GET    /api/events/:id
POST   /api/events
PUT    /api/events/:id
DELETE /api/events/:id
```

---

## Registrations

```
POST /api/registrations/:id
GET  /api/registrations/my-events
```

---

## Messages

```
GET  /api/messages/event/:id
POST /api/messages
```

---

## Admin

```
GET /api/admin/dashboard
GET /api/admin/events
GET /api/admin/users
GET /api/admin/organizers
```

---

# Future Improvements

- Email Notifications
- QR Code Event Tickets
- Online Payment Integration
- Push Notifications
- Google Calendar Integration
- AI Event Recommendations
- Event Reviews & Ratings
- Event Certificate Generation

---

#  Author

**Krishna**

MERN Stack Developer

GitHub:
https://github.com/Krishnavm-11

---

# Support

If you like this project, don't forget to give it a ⭐ on GitHub!
