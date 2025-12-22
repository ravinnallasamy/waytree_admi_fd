import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { EventProvider } from './context/EventContext';
import { AuthProvider } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages for better performance
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const CreateEventForm = lazy(() => import('./pages/CreateEventForm'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const AdminEvents = lazy(() => import('./pages/AdminEvents'));
const EventDetailsPage = lazy(() => import('./pages/EventDetailsPage'));
const EventConnections = lazy(() => import('./pages/EventConnections'));
const AdminPermission = lazy(() => import('./pages/AdminPermission'));
const AdminManagement = lazy(() => import('./pages/AdminManagement'));
const DataExplorer = lazy(() => import('./pages/DataExplorer'));
const UserManipulationPage = lazy(() => import('./pages/UserManipulationPage'));

function App() {
  return (
    <AuthProvider>
      <EventProvider>
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<AdminLayout />}>
                  <Route path="dashboard" element={<div className="text-gray-800">Dashboard Content Coming Soon</div>} />
                  <Route path="create-event" element={<EventsPage />} />
                  <Route path="create-event/new" element={<CreateEventForm />} />
                  <Route path="admin/events" element={<AdminEvents />} />
                  <Route path="admin/events/:id" element={<EventDetailsPage />} />
                  <Route path="admin/events/:eventId/connections" element={<EventConnections />} />
                  <Route path="admin/permission" element={<AdminPermission />} />
                  <Route path="admin/users" element={<UsersPage />} />
                  <Route path="admin/user-manipulation" element={<UserManipulationPage />} />
                  <Route path="admin/management" element={<AdminManagement />} />
                  <Route path="admin/explorer" element={<DataExplorer />} />
                  <Route path="settings" element={<div className="text-gray-800">Settings Page Coming Soon</div>} />

                </Route>
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </EventProvider>
    </AuthProvider>
  );
}

export default App;
