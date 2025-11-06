import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VoteNow from './pages/VoteNow';
import VotingCredentials from './pages/VotingCredentials';
import VotingPassword from './pages/VotingPassword';
import VotingPage from './pages/VotingPage';
import VoteSuccess from './pages/VoteSuccess';
import AlreadyVoted from './pages/AlreadyVoted';
import AdminLayout from './admin/layout/AdminLayout';
import AdminHome from './admin/pages/AdminHome';
import AdminLogin from './pages/AdminLogin';
import AdminUsersPage from './admin/pages/AdminUsers';
import AdminElectionsPage from './admin/pages/AdminElections';
import AdminResults from './admin/pages/AdminResults';
import AdminSettings from './admin/pages/AdminSettings';
import AdminElectionHistory from './admin/pages/AdminElectionHistory';
import AdminCandidatesPage from './admin/pages/AdminCandidates';
import AdminCreateCandidate from './admin/pages/AdminCreateCandidate';
import AdminEditCandidate from './admin/pages/AdminEditCandidate';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Support from './pages/Support';
import NotFound from './pages/NotFound';

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          {!isAdminRoute && <Navbar />}

          <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/support" element={<Support />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                
                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/vote-now" 
                  element={
                    <ProtectedRoute>
                      <VoteNow />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/voting-credentials" 
                  element={
                    <ProtectedRoute>
                      <VotingCredentials />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/voting-password" 
                  element={
                    <ProtectedRoute>
                      <VotingPassword />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/voting-page" 
                  element={
                    <ProtectedRoute>
                      <VotingPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/vote-success" 
                  element={
                    <ProtectedRoute>
                      <VoteSuccess />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/already-voted" 
                  element={
                    <ProtectedRoute>
                      <AlreadyVoted />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/admin" element={<AdminLayout><AdminHome /></AdminLayout>} />
                <Route path="/admin/users" element={<AdminLayout><AdminUsersPage /></AdminLayout>} />
                <Route path="/admin/elections" element={<AdminLayout><AdminElectionsPage /></AdminLayout>} />
                <Route path="/admin/election-history" element={<AdminLayout><AdminElectionHistory /></AdminLayout>} />
                <Route path="/admin/candidates" element={<AdminLayout><AdminCandidatesPage /></AdminLayout>} />
                <Route path="/admin/candidates/create" element={<AdminLayout><AdminCreateCandidate /></AdminLayout>} />
                <Route path="/admin/candidates/edit/:id" element={<AdminLayout><AdminEditCandidate /></AdminLayout>} />
                <Route path="/admin/results" element={<AdminLayout><AdminResults /></AdminLayout>} />
                <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
          </main>

          {!isAdminRoute && <Footer />}
            
            {/* Global Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
