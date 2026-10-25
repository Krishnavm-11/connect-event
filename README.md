# 🎟️ ConnectEvent --- Event Networking Platform

A full-stack **MERN Event Networking Platform** that helps users
discover events, register for them, connect with other attendees, and
communicate through real-time chat.

The platform also provides dedicated functionality for **event
organizers and administrators** to manage events, users, registrations,
and platform activities.

## 🌐 Live Demo

🚀 **Live Application:**
[ConnectEvent](https://connect-event-iota.vercel.app)

------------------------------------------------------------------------

## 📌 About the Project

**ConnectEvent** is a modern event networking and ticketing platform
designed to make event discovery and networking easier.

Users can browse upcoming events, view event details, register for
events, connect with other attendees, receive notifications, and
participate in real-time event conversations.

Organizers can create and manage events, while administrators can review
events, manage users and organizers, and monitor registrations.

------------------------------------------------------------------------

## ✨ Key Features

### 👤 User Features

-   User registration and login
-   JWT-based authentication
-   Browse upcoming events
-   Search and filter events
-   View detailed event information
-   Register for events
-   View registered events
-   Connect with other attendees
-   Send and receive connection requests
-   Real-time event chat
-   Notifications
-   User profile management
-   Contact/support messaging

### 🎤 Organizer Features

-   Organizer authentication
-   Organizer dashboard
-   Create events
-   Add event details and banners
-   Add speakers to events
-   Manage created events
-   View event registrations
-   Track event status
-   Receive notifications when events are approved or rejected

### 🛡️ Admin Features

-   Secure admin login
-   Admin dashboard
-   View platform statistics
-   Manage events
-   Review pending events
-   Approve or reject events
-   Manage users
-   Manage organizers
-   Manage registrations
-   View contact messages
-   Monitor platform activities

### 💬 Real-Time Networking

-   Event-based chat rooms
-   Real-time messaging using Socket.IO
-   Attendee networking
-   Connection requests
-   Notifications for networking activities

------------------------------------------------------------------------

## 🛠️ Tech Stack

### Frontend

-   React.js
-   Vite
-   JavaScript
-   Tailwind CSS
-   React Router
-   Axios
-   Lucide React
-   React Icons

### Backend

-   Node.js
-   Express.js
-   RESTful APIs
-   Socket.IO
-   JWT Authentication
-   bcryptjs
-   Cookie Parser
-   CORS

### Database

-   MongoDB
-   Mongoose
-   MongoDB Atlas

### Cloud & Deployment

-   Vercel --- Frontend
-   Render --- Backend
-   Cloudinary --- Event image storage

### Development Tools

-   VS Code
-   Git
-   GitHub
-   Postman
-   npm

------------------------------------------------------------------------

## 🏗️ Project Architecture

``` text
ConnectEvent/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── README.md
```

------------------------------------------------------------------------

## 🔐 Authentication & Authorization

ConnectEvent uses **JWT-based authentication** and role-based
authorization.

The platform supports different user roles:

``` text
User
 ├── Browse events
 ├── Register for events
 ├── Network with attendees
 └── Chat

Organizer
 ├── Create events
 ├── Manage events
 └── View registrations

Admin
 ├── Manage the platform
 ├── Approve or reject events
 ├── Manage users and organizers
 └── View registrations
```

Protected routes ensure that users can only access functionality
permitted for their role.

------------------------------------------------------------------------

## 🎫 Event Management

Organizers can create events with information such as:

-   Event title
-   Description
-   Category
-   Venue
-   Location
-   Date
-   Time
-   Ticket price
-   Total seats
-   Event banner
-   Speakers

Events follow an approval workflow:

``` text
Organizer Creates Event
          ↓
        Pending
          ↓
      Admin Review
       ↙       ↘
  Approved    Rejected
      ↓
Visible to Users
```

Only approved events are displayed publicly.

------------------------------------------------------------------------

## 🎤 Speaker Management

Organizers can add speakers while creating an event. Speaker information
can highlight guests, professionals, industry experts, or presenters
participating in an event.

ConnectEvent can support event types such as:

-   Business conferences
-   Technology events
-   Networking events
-   Workshops
-   Seminars
-   Startup events
-   Career events

------------------------------------------------------------------------

## 💬 Real-Time Chat

ConnectEvent uses **Socket.IO** to provide real-time communication.
Users joining an event can communicate through event-specific chat
rooms.

``` text
User
  ↓
Join Event
  ↓
Socket.IO Room
  ↓
Send Message
  ↓
Server
  ↓
Broadcast Message
  ↓
Event Participants
```

Messages are also stored in the database for persistence.

------------------------------------------------------------------------

## 🔔 Notifications

The platform provides notifications for important activities, such as:

-   Event approval
-   Event rejection
-   Connection requests
-   Networking activities
-   Other platform updates

------------------------------------------------------------------------

## 📊 Admin Dashboard

The admin dashboard provides an overview of platform activity.
Administrators can manage:

-   👥 Users
-   🎤 Organizers
-   🎟️ Events
-   📋 Registrations
-   💬 Contact messages
-   📈 Platform statistics

The event management system allows admins to review pending events
before they become visible to users.

------------------------------------------------------------------------

## ☁️ Deployment

-   **Frontend:** React application deployed on Vercel
-   **Backend:** Node.js/Express application deployed on Render
-   **Database:** MongoDB Atlas
-   **Image storage:** Cloudinary

------------------------------------------------------------------------

## ⚙️ Environment Variables

For security reasons, actual environment variables and credentials
should not be committed to the repository.

### Backend `server/.env`

``` env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

------------------------------------------------------------------------

## 🚀 Run the Project Locally

### 1. Clone the Repository

``` bash
git clone https://github.com/Krishnavm-11/connect-event
cd ConnectEvent
```

### 2. Install Backend Dependencies

``` bash
cd server
npm install
```

### 3. Configure Backend Environment Variables

Create a `.env` file inside the `server` folder and add the required
values shown in the [Environment Variables](#️-environment-variables)
section.

### 4. Start the Backend

``` bash
npm run dev
```

The backend is expected to run at:

``` text
http://localhost:5000
```

### 5. Install Frontend Dependencies

Open a second terminal at the project root:

``` bash
cd client
npm install
```

### 6. Configure the Frontend API URL

If required by your application, set `VITE_API_URL` in `client/.env` to
your local backend API URL. Use the exact format expected by your API
service configuration.

### 7. Start the Frontend

``` bash
npm run dev
```

The frontend is expected to run at:

``` text
http://localhost:5173
```

------------------------------------------------------------------------

## 🧪 API Testing

Backend APIs can be tested using **Postman**.

Main API modules include:

``` text
/api/auth
/api/events
/api/admin
/api/registrations
/api/connections
/api/messages
/api/notifications
/api/contact
```

The exact endpoints depend on the route configuration in the backend.

------------------------------------------------------------------------

## 🔒 Security

The application uses security practices including:

-   JWT authentication
-   Password hashing using bcryptjs
-   Protected API routes
-   Role-based authorization
-   Admin authorization
-   Environment variables for sensitive credentials
-   CORS configuration
-   Cloud-based image storage

------------------------------------------------------------------------

## 📱 Responsive Design

ConnectEvent is designed to work across different screen sizes:

-   Desktop
-   Laptop
-   Mobile
-   Tablet

The UI uses responsive Tailwind CSS utilities to provide a consistent
experience across devices.

------------------------------------------------------------------------

## 🎯 Future Improvements

Possible future enhancements include:

-   Online event ticket payments
-   QR-code-based event tickets
-   Email notifications
-   Google authentication
-   Advanced event recommendations
-   Location-based event discovery
-   Organizer analytics
-   Event reminders
-   Attendee networking suggestions
-   Enhanced real-time messaging
-   Event reviews and ratings

------------------------------------------------------------------------

## 📚 What I Learned

Through this project, I gained practical experience with:

-   Building a full-stack MERN application
-   Designing REST APIs
-   MongoDB data modeling
-   JWT authentication
-   Role-based authorization
-   React component architecture
-   Protected routes
-   Real-time communication using Socket.IO
-   Cloudinary image uploads
-   API integration using Axios
-   Admin dashboard development
-   Deployment using Vercel and Render
-   Environment variable management
-   Debugging production deployment issues

------------------------------------------------------------------------

## 👨‍💻 Developer

**Krishna**\
MERN Stack Developer

Passionate about building practical, responsive, and user-friendly
full-stack web applications.
