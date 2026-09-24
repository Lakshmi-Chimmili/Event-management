import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { UserDashboard } from './pages/UserDashboard';
import { MyEvents } from './pages/MyEvents';
import { CreateEvent } from './pages/CreateEvent';
import { EditEvent } from './pages/EditEvent';
import { EventDetails } from './pages/EventDetails';
import { GuestManagementPage } from './pages/GuestManagementPage';
import { BudgetExpensesPage } from './pages/BudgetExpensesPage';
import { Venues } from './pages/Venues';
import { ServicesVendors } from './pages/ServicesVendors';
import { PublicRSVP } from './pages/PublicRSVP';
import { Profile } from './pages/Profile';
import { Feedback } from './pages/Feedback';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { EventManagement } from './pages/admin/EventManagement';
import { VenueManagement } from './pages/admin/VenueManagement';
import { VendorManagement } from './pages/admin/VendorManagement';
import { FeedbackManagement } from './pages/admin/FeedbackManagement';

export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/venues" element={<Venues />} />
              <Route path="/vendors" element={<ServicesVendors />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/invite/:code" element={<PublicRSVP />} />

              {/* User Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events"
                element={
                  <ProtectedRoute>
                    <MyEvents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/create"
                element={
                  <ProtectedRoute>
                    <CreateEvent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/:id"
                element={
                  <ProtectedRoute>
                    <EventDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditEvent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/guests"
                element={
                  <ProtectedRoute>
                    <GuestManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/budget"
                element={
                  <ProtectedRoute>
                    <BudgetExpensesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <EventManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/venues"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <VenueManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/vendors"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <VendorManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/feedback"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <FeedbackManagement />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
