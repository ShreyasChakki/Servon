# SERVON 🛠️

> **B2B/B2C Service Marketplace Platform** - Connecting service providers with customers seamlessly

SERVON is a modern, full-stack web application that bridges the gap between service providers (vendors) and customers. Whether you need a plumber, electrician, or any home service, SERVON makes it easy to find, book, and manage services.

---

## ✨ Features

### For Customers
- 🔍 **Browse Services** - Explore various service categories
- 💬 **Real-time Chat** - Communicate with vendors instantly via Socket.IO
- 📱 **Profile Management** - Update personal information and profile pictures
- 📊 **Service Requests** - Submit and track service requests
- 🔔 **Notifications** - Real-time updates on service status

### For Vendors
- 🏢 **Business Profile** - Showcase your business and services
- 📋 **Service Management** - Manage service offerings and categories
- 💬 **Customer Communication** - Chat with potential customers
- 📊 **Dashboard** - Track bookings and business analytics
- ✅ **Request Management** - Accept or decline service requests

### For Admins
- 👥 **User Management** - Manage customers and vendors
- 🔐 **Role-based Access** - Control access to different features
- 📊 **Reports** - Monitor platform activity and statistics
- 🚫 **Moderation** - Ban/unban users and manage content

---

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO for live chat and notifications
- **Security**: bcryptjs for password hashing, CORS enabled
- **Validation**: express-validator

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS v4
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Real-time**: Socket.IO Client

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas)
- **Git**

---

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ShreyasChakki/Servon.git
cd Servon
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd servon-backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Configure your `.env` file:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/servon
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

**Seed the database with test users:**
```bash
# Seed admin user
npm run seed:admin

# Or use the seedUsers.js file for all test users
node seedUsers.js
```

**Start the backend server:**
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../servon-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## 👤 Test Credentials

After seeding the database, you can use these credentials to test the application. See [CREDENTIALS.md](./CREDENTIALS.md) for complete list.

### Admin
- **Email**: admin@servon.com
- **Password**: admin123

### Customer
- **Email**: customer@servon.com
- **Password**: customer123

### Vendor
- **Email**: vendor@servon.com
- **Password**: vendor123

---

## 📁 Project Structure

```
servon/
├── servon-backend/          # Backend API
│   ├── controllers/         # Request handlers
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── middleware/          # Custom middleware
│   ├── seedAdmin.js         # Admin seeder script
│   ├── seedUsers.js         # User seeder script
│   └── server.js            # Entry point
│
├── servon-frontend/         # Frontend React app
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── context/         # Context API (Auth)
│   │   ├── services/        # API services
│   │   └── App.jsx          # Main app component
│   └── index.html
│
├── CREDENTIALS.md           # Test user credentials
└── README.md                # This file
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Users (Admin)
- `GET /api/users` - Get all users
- `PUT /api/users/:id/ban` - Ban/Unban user

### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Create service (Vendor)
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Ads/Requests
- `GET /api/ads` - Get all ads
- `POST /api/ads` - Create ad request
- `PUT /api/ads/:id` - Update ad status

### Chats
- `GET /api/chats` - Get user chats
- `POST /api/chats` - Create chat
- Real-time messaging via Socket.IO

---

## 🎨 Features in Detail

### Profile Picture Support
- Users can add profile pictures via URL
- Avatar displayed in navbar and profile page
- Live preview when updating profile
- Fallback icon for users without pictures

### Real-time Chat
- Socket.IO powered instant messaging
- Chat rooms between customers and vendors
- Online/offline status indicators
- Message notifications

### Role-based Access Control
- Three user roles: Customer, Vendor, Admin
- Protected routes and API endpoints
- Role-specific dashboards and features

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Clean, modern UI with smooth animations
- Optimized for all screen sizes

---

## 🧪 Development

### Run Backend in Development Mode
```bash
cd servon-backend
npm run dev
```

### Run Frontend in Development Mode
```bash
cd servon-frontend
npm run dev
```

### Build Frontend for Production
```bash
cd servon-frontend
npm run build
```

---

## 🐛 Common Issues

### MongoDB Connection Error
- Ensure MongoDB is running locally or update `MONGODB_URI` in `.env`
- Check if the database name is correct

### Port Already in Use
- Change the `PORT` in backend `.env` file
- Kill the process using the port: `npx kill-port 5000`

### CORS Errors
- Ensure backend CORS is configured to allow frontend URL
- Check that `withCredentials: true` is set in axios config

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**Shreyas Chakki**
- GitHub: [@ShreyasChakki](https://github.com/ShreyasChakki)

---

## 🙏 Acknowledgments

- Built with ❤️ using the MERN stack
- Icons by [Lucide](https://lucide.dev)
- UI inspiration from modern web design trends

---

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.

**Happy Coding! 🚀**
