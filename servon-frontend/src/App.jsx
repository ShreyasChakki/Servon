import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Conversations from './pages/Conversations';
import BrowseAds from './pages/BrowseAds';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import PostRequest from './pages/customer/PostRequest';
import ViewQuotations from './pages/customer/ViewQuotations';
import MyAdInquiries from './pages/customer/MyAdInquiries';

// Vendor Pages
import VendorDashboard from './pages/vendor/Dashboard';
import BrowseRequests from './pages/vendor/BrowseRequests';
import Wallet from './pages/vendor/Wallet';
import SendQuotation from './pages/vendor/SendQuotation';
import CreateAd from './pages/vendor/CreateAd';
import MyAds from './pages/vendor/MyAds';
import EditAd from './pages/vendor/EditAd';
import Network from './pages/vendor/Network';
import MyQuotations from './pages/vendor/MyQuotations';
import ReceivedInquiries from './pages/vendor/ReceivedInquiries';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminReports from './pages/admin/Reports';

// Shared Pages
import VendorProfile from './pages/VendorProfile';

// Styles
import './index.css';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="page">
            <Navbar />
            <main className="main">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/browse-ads" element={<BrowseAds />} />

                {/* Customer Protected Routes */}
                <Route
                  path="/customer/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'admin']}>
                      <CustomerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/post-request"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'admin']}>
                      <PostRequest />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/view-quotations/:requestId"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'admin']}>
                      <ViewQuotations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/my-inquiries"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'admin']}>
                      <MyAdInquiries />
                    </ProtectedRoute>
                  }
                />

                {/* Vendor Protected Routes */}
                <Route
                  path="/vendor/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                      <VendorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/browse-requests"
                  element={
                    <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                      <BrowseRequests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/wallet"
                  element={
                    <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                      <Wallet />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/send-quotation/:requestId"
                  element={
                    <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                      <SendQuotation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/create-ad"
                  element={
                    <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                      <CreateAd />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/my-ads"
                  element={
                    <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                      <MyAds />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/edit-ad/:adId"
                  element={
                    <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                      <EditAd />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/network"
                  element={
                    <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                      <Network />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/my-quotations"
                  element={
                    <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                      <MyQuotations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/inquiries"
                  element={
                    <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                      <ReceivedInquiries />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminReports />
                    </ProtectedRoute>
                  }
                />

                {/* Shared Protected Routes */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/conversations"
                  element={
                    <ProtectedRoute>
                      <Conversations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chat/:conversationId"
                  element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  }
                />

                {/* Vendor Profile - accessible by any logged in user */}
                <Route
                  path="/vendor/:vendorId"
                  element={
                    <ProtectedRoute>
                      <VendorProfile />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
