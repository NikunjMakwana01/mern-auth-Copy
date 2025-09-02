# 🔐 MERN Authentication Application

A comprehensive, secure, and modern authentication application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring email OTP verification, JWT authentication, and professional UI/UX.

## ✨ Features

### 🔐 Authentication & Security
- **Email OTP Verification** - Secure two-factor authentication via email
- **JWT Token Management** - Stateless authentication with secure token handling
- **User Authentication** - Secure user registration and login system
- **Account Security** - Login attempt tracking, account lockout protection
- **Password Security** - Bcrypt hashing with salt rounds

### 👥 User Management
- **User Registration** - Complete profile creation with validation
- **Profile Management** - Update personal information and preferences
- **User Dashboard** - Personal dashboard for managing profile and activities
- **User Profile Management** - Complete profile management system

### 🎨 User Interface
- **Government-Style Design** - Professional, trustworthy appearance
- **Responsive Layout** - Mobile-first design for all devices
- **Dark/Light Theme** - User preference-based theme switching
- **Modern UI Components** - Tailwind CSS with custom components
- **Accessibility** - WCAG compliant design patterns

### 📊 User Experience
- **User Analytics** - Registration and activity metrics
- **System Statistics** - Platform performance and usage data
- **User Reports** - Personal activity insights

## 🚀 Technology Stack

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Token authentication
- **Nodemailer** - Email service integration
- **Bcrypt** - Password hashing and security
- **Express Validator** - Input validation and sanitization

### Frontend
- **React.js** - User interface library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Icon library
- **React Hot Toast** - Notification system
- **Context API** - State management

### Development Tools
- **Concurrently** - Run multiple commands simultaneously
- **ESLint** - Code quality and consistency
- **Nodemon** - Development server with auto-restart

## 📁 Project Structure

```
mern-auth/
├── backend1/                 # Backend server
│   ├── models/              # Database models
│   │   ├── User.js         # User model with authentication
│   │   └── OTP.js          # OTP management
│   ├── routes/             # API endpoints
│   │   ├── auth.js         # Authentication routes
│   │   └── user.js         # User management routes
│   ├── middleware/         # Custom middleware
│   │   └── auth.js         # Authentication and authorization
│   ├── utils/              # Utility functions
│   │   ├── emailService.js # Email functionality
│   │   └── jwtUtils.js     # JWT token management
│   └── server.js           # Main server file
├── frontend1/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── auth/       # Authentication components
│   │   │   └── layout/     # Layout components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── styles/         # CSS and styling
│   │   └── utils/          # Frontend utilities
│   └── public/             # Static assets

├── setup-new.js            # Project setup script
└── package.json            # Project dependencies
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Gmail account for email service

### 1. Clone the Repository
```bash
git clone <repository-url>
cd mern-auth
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend1
npm install

# Install frontend dependencies
cd ../frontend1
npm install
```

### 3. Environment Configuration

#### Backend (.env)
Create `backend1/.env`:
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/voting-app

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Email Service (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server Configuration
PORT=5001
NODE_ENV=development
```

#### Frontend (.env)
Create `frontend1/.env`:
```env
REACT_APP_API_URL=http://localhost:5001
REACT_APP_NAME=Voting App
REACT_APP_VERSION=1.0.0
```

### 4. Start MongoDB
```bash
# Start MongoDB service
mongod

# Or use MongoDB Compass for GUI
```

### 5. Run the Application
```bash
# Start both backend and frontend
npm start

# Or run separately:
# Backend (Terminal 1)
cd backend1 && npm start

# Frontend (Terminal 2)
cd frontend1 && npm start
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/generate-registration-otp` - Generate registration OTP
- `POST /api/auth/verify-registration` - Complete user registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-login` - Verify login OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout




## 🔒 Security Features

- **Input Validation** - Comprehensive data validation
- **SQL Injection Protection** - MongoDB with parameterized queries
- **XSS Protection** - Helmet.js security headers
- **Rate Limiting** - API request throttling
- **CORS Configuration** - Cross-origin resource sharing
- **Environment Variables** - Secure configuration management

## 🚧 Development

### Running in Development Mode
```bash
# Backend with auto-restart
cd backend1 && npm run dev

# Frontend with hot reload
cd frontend1 && npm start
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🔮 Future Enhancements

- **Biometric Authentication** - Fingerprint and face recognition
- **Blockchain Integration** - Immutable vote records
- **Real-time Notifications** - Push notifications for updates
- **Advanced Analytics** - Machine learning insights
- **Multi-language Support** - Internationalization
- **Mobile App** - React Native application

---

**Built with ❤️ for secure and transparent democratic processes**
