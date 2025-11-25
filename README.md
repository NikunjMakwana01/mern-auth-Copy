# 🗳️ MERN Stack Voting Application

A comprehensive, secure, and modern **online voting system** built with the MERN stack (MongoDB, Express.js, React.js, Node.js). This application features a complete election management system with user authentication, admin panel, candidate management, voting functionality, and real-time results tracking.

## ✨ Features

### 🔐 Authentication & Security
- **Email OTP Verification** - Secure two-factor authentication via email for both registration and login
- **JWT Token Management** - Stateless authentication with secure token handling
- **User Authentication** - Secure user registration and login system
- **Admin Authentication** - Separate admin login system with role-based access
- **Password Security** - Bcrypt hashing with salt rounds
- **Forgot Password** - Secure password reset functionality
- **Account Security** - Login attempt tracking and account protection

### 👥 User Features
- **User Registration** - Complete profile creation with email OTP verification
- **User Dashboard** - Personal dashboard for managing profile and viewing elections
- **Profile Management** - Update personal information, address, and preferences
- **Voting System** - Secure voting process with credentials and password verification
- **View Results** - Access election results after declaration
- **Election History** - View past and current elections
- **Dark/Light Theme** - User preference-based theme switching

### 🎯 Election Management
- **Multiple Election Types** - Support for Lok Sabha, Rajya Sabha, State Assembly, Municipal Corporation, Panchayat, Zila Parishad, Block Development, Mayor, and more
- **Election Levels** - National, State, District, Municipal, Village, and Block level elections
- **Election Status** - Draft, Upcoming, Active, and Completed status tracking
- **Automatic Status Updates** - Background jobs automatically update election statuses
- **Result Declaration** - Scheduled result declaration with automatic publishing
- **Election Archiving** - Archive completed elections for historical records

### 👨‍💼 Candidate Management
- **Candidate Registration** - Add candidates with complete profile information
- **Candidate Profiles** - Name, village, Aadhar card, election card, photo, and party affiliation
- **Candidate Editing** - Update candidate information
- **Candidate Listing** - View all candidates for each election

### 🗳️ Voting System
- **Secure Voting Process** - Multi-step verification process
- **Voting Credentials** - Unique credentials for each election
- **Voting Password** - Additional password protection for voting
- **One Vote Per User** - Prevents duplicate voting
- **Vote Tracking** - Complete audit trail of all votes
- **Vote Confirmation** - Success confirmation after voting

### 🛡️ Admin Panel
- **Admin Dashboard** - Comprehensive overview of system statistics
- **User Management** - View, manage, and monitor all registered users
- **Election Management** - Create, edit, and manage elections
- **Candidate Management** - Add, edit, and manage candidates
- **Results Management** - View and publish election results
- **Election History** - Access complete history of all elections
- **Notifications** - System notifications and alerts
- **Access Roles** - Manage admin access and permissions
- **Settings** - System configuration and settings

### 🎨 User Interface
- **Government-Style Design** - Professional, trustworthy appearance
- **Responsive Layout** - Mobile-first design for all devices
- **Modern UI Components** - Tailwind CSS with custom components
- **Accessibility** - WCAG compliant design patterns
- **Toast Notifications** - User-friendly notification system
- **Loading States** - Smooth loading indicators

### 📄 Additional Pages
- **About** - Information about the voting system
- **Contact** - Contact information and support
- **Privacy Policy** - Privacy policy and data protection
- **Terms of Service** - Terms and conditions
- **Support** - Help and support resources

## 🚀 Technology Stack

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Token authentication
- **Nodemailer** - Email service integration
- **Bcrypt** - Password hashing and security
- **Express Validator** - Input validation and sanitization
- **Helmet** - Security headers
- **Express Rate Limit** - API rate limiting

### Frontend
- **React.js** - User interface library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Icon library
- **React Hot Toast** - Notification system
- **Context API** - State management (Auth & Theme)
- **Axios** - HTTP client for API calls
- **Date-fns** - Date formatting utilities

### Development Tools
- **Concurrently** - Run multiple commands simultaneously
- **Nodemon** - Development server with auto-restart
- **ESLint** - Code quality and consistency

## 📁 Project Structure

```
mern-auth/
├── backend1/                      # Backend server
│   ├── models/                   # Database models
│   │   ├── User.js              # User model with authentication
│   │   ├── Admin.js             # Admin model
│   │   ├── Election.js          # Election model
│   │   ├── Candidate.js         # Candidate model
│   │   ├── Vote.js              # Vote model
│   │   └── OTP.js               # OTP management
│   ├── routes/                  # API endpoints
│   │   ├── auth.js              # User authentication routes
│   │   ├── adminAuth.js         # Admin authentication routes
│   │   ├── user.js              # User management routes
│   │   ├── admin.js             # Admin management routes
│   │   ├── elections.js         # Election management routes
│   │   ├── candidates.js        # Candidate management routes
│   │   └── voting.js            # Voting routes
│   ├── middleware/              # Custom middleware
│   │   └── auth.js              # Authentication and authorization
│   ├── utils/                   # Utility functions
│   │   ├── emailService.js      # Email functionality
│   │   └── jwtUtils.js          # JWT token management
│   └── server.js                # Main server file
├── frontend1/                    # React frontend
│   ├── src/
│   │   ├── admin/               # Admin panel
│   │   │   ├── layout/          # Admin layout components
│   │   │   │   ├── AdminLayout.js
│   │   │   │   ├── AdminNavbar.js
│   │   │   │   ├── AdminSidebar.js
│   │   │   │   └── AdminFooter.js
│   │   │   └── pages/           # Admin pages
│   │   │       ├── AdminHome.js
│   │   │       ├── AdminUsers.js
│   │   │       ├── AdminElections.js
│   │   │       ├── AdminCandidates.js
│   │   │       ├── AdminResults.js
│   │   │       └── ...
│   │   ├── components/          # Reusable UI components
│   │   │   ├── auth/           # Authentication components
│   │   │   │   └── ProtectedRoute.js
│   │   │   └── layout/         # Layout components
│   │   │       ├── Navbar.js
│   │   │       └── Footer.js
│   │   ├── contexts/           # React contexts
│   │   │   ├── AuthContext.js
│   │   │   └── ThemeContext.js
│   │   ├── pages/              # Page components
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── VoteNow.js
│   │   │   ├── VotingPage.js
│   │   │   ├── Results.js
│   │   │   └── ...
│   │   ├── styles/             # CSS and styling
│   │   │   └── index.css
│   │   ├── utils/              # Frontend utilities
│   │   │   ├── api.js          # API configuration
│   │   │   └── indiaLocations.js
│   │   ├── App.js              # Main App component
│   │   └── index.js            # Entry point
│   └── public/                 # Static assets
├── package.json                # Root package.json
└── README.md                   # Project documentation
```

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Gmail account** for email service (or any SMTP service)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "mern-auth - Copy-pwd-changed"
```

### 2. Install Dependencies

#### Option A: Install All at Once (Recommended)
```bash
npm run install-all
```

#### Option B: Install Separately
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

#### Backend Environment Variables
Create `backend1/.env` file:
```env
# Database Configuration (MongoDB Atlas recommended for deployment)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/voting-app
# For local development with MongoDB Compass:
# MONGODB_URI=mongodb://localhost:27017/voting-app

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRE=7d

# Email Service (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
# Note: For Gmail, you need to generate an App Password from Google Account settings

# Server Configuration
PORT=5001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

#### Frontend Environment Variables
Create `frontend1/.env` file:
```env
REACT_APP_API_URL=http://localhost:5001
REACT_APP_NAME=Voting App
REACT_APP_VERSION=1.0.0
```

### 4. Start MongoDB

#### Local MongoDB:
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
# or
mongod
```

#### MongoDB Atlas:
- Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string and update `MONGODB_URI` in `.env`

### 5. Run the Application

#### Development Mode (Recommended)
```bash
# From root directory - runs both backend and frontend
npm start

# Or run separately:
# Terminal 1 - Backend
cd backend1
npm run dev

# Terminal 2 - Frontend
cd frontend1
npm start
```

#### Production Mode
```bash
# Build frontend
cd frontend1
npm run build

# Start backend
cd ../backend1
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001

## 📱 API Endpoints

### Authentication Endpoints
- `POST /api/auth/generate-registration-otp` - Generate OTP for registration
- `POST /api/auth/verify-registration` - Complete user registration with OTP
- `POST /api/auth/login` - User login (generates OTP)
- `POST /api/auth/verify-login` - Verify login OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/dashboard` - Get user dashboard data

### Admin Authentication Endpoints
- `POST /api/admin-auth/login` - Admin login
- `GET /api/admin-auth/me` - Get current admin profile
- `POST /api/admin-auth/logout` - Admin logout

### Election Endpoints
- `GET /api/elections` - Get all elections (with filters)
- `GET /api/elections/:id` - Get election by ID
- `POST /api/elections` - Create new election (Admin only)
- `PUT /api/elections/:id` - Update election (Admin only)
- `DELETE /api/elections/:id` - Delete election (Admin only)
- `POST /api/elections/:id/publish-results` - Publish election results (Admin only)
- `GET /api/elections/:id/results` - Get election results

### Candidate Endpoints
- `GET /api/candidates` - Get all candidates (with filters)
- `GET /api/candidates/:id` - Get candidate by ID
- `POST /api/candidates` - Create new candidate (Admin only)
- `PUT /api/candidates/:id` - Update candidate (Admin only)
- `DELETE /api/candidates/:id` - Delete candidate (Admin only)
- `GET /api/candidates/election/:electionId` - Get candidates for an election

### Voting Endpoints
- `GET /api/voting/elections` - Get active elections for voting
- `POST /api/voting/request-credentials` - Request voting credentials
- `POST /api/voting/verify-credentials` - Verify voting credentials
- `POST /api/voting/vote` - Submit vote
- `GET /api/voting/vote-status/:electionId` - Check vote status

### Admin Endpoints
- `GET /api/admin/users` - Get all users (Admin only)
- `GET /api/admin/stats` - Get system statistics (Admin only)
- `GET /api/admin/elections` - Get all elections for admin (Admin only)
- `GET /api/admin/results` - Get all results (Admin only)

## 🔒 Security Features

- **Input Validation** - Comprehensive data validation using express-validator
- **SQL Injection Protection** - MongoDB with parameterized queries
- **XSS Protection** - Helmet.js security headers
- **Rate Limiting** - API request throttling (1000 requests per hour)
- **CORS Configuration** - Cross-origin resource sharing with whitelist
- **Environment Variables** - Secure configuration management
- **JWT Token Security** - Secure token generation and validation
- **Password Hashing** - Bcrypt with salt rounds
- **OTP Expiration** - Time-limited OTP codes
- **One Vote Per User** - Prevents duplicate voting
- **Voting Credentials** - Multi-layer voting security

## 🎯 Key Features Explained

### Election Status Management
The system automatically manages election statuses:
- **Draft** → Elections being prepared
- **Upcoming** → Scheduled elections
- **Active** → Elections currently open for voting
- **Completed** → Elections that have ended

Background jobs run every 60 seconds to:
- Promote `upcoming` elections to `active` when voting starts
- Mark `active` elections as `completed` when voting ends
- Automatically publish results when declaration date arrives

### Voting Process
1. User requests voting credentials for an election
2. System sends unique credentials via email
3. User enters credentials on voting page
4. System verifies credentials and prompts for voting password
5. User enters voting password
6. User casts vote for selected candidate
7. Vote is recorded and user cannot vote again

### Result Declaration
- Results can be manually published by admin
- Results are automatically published when `resultDeclarationDate` arrives
- Results include vote counts, percentages, and winner information
- Results are only visible after declaration

## 🚧 Development

### Running in Development Mode
```bash
# Backend with auto-restart (watches for changes)
cd backend1 && npm run dev

# Frontend with hot reload
cd frontend1 && npm start
```

### Project Scripts

#### Root Level
- `npm start` - Start both backend and frontend
- `npm run dev` - Start in development mode
- `npm run install-all` - Install all dependencies
- `npm run build` - Build frontend for production

#### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

#### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 📸 Screenshots

Screenshots of the application are available in the `screenshots/` directory.

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check `MONGODB_URI` in `.env` file
   - Verify network connectivity for MongoDB Atlas

2. **Email Not Sending**
   - Verify Gmail App Password is correct
   - Check `EMAIL_USER` and `EMAIL_PASS` in `.env`
   - Ensure 2-factor authentication is enabled on Gmail account

3. **Port Already in Use**
   - Change `PORT` in backend `.env` file
   - Or kill the process using the port

4. **CORS Errors**
   - Verify `FRONTEND_URL` in backend `.env`
   - Check CORS configuration in `server.js`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ for secure and transparent democratic processes

## 🔮 Future Enhancements

- **Biometric Authentication** - Fingerprint and face recognition
- **Blockchain Integration** - Immutable vote records
- **Real-time Notifications** - Push notifications for updates
- **Advanced Analytics** - Machine learning insights
- **Multi-language Support** - Internationalization (i18n)
- **Mobile App** - React Native application
- **Vote Verification** - Voter-verifiable paper audit trail
- **Advanced Reporting** - Detailed analytics and reports
- **Email Templates** - Customizable email templates
- **SMS OTP** - Alternative OTP delivery method

---

**Status**: ✅ Project Completed

**Last Updated**: 2025

**Built with ❤️ for secure and transparent democratic processes**
