import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { EventProvider } from './context/EventContext';
import { AuthProvider } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages for better performance
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const DashboardOverview = lazy(() => import('./pages/DashboardOverview')); // NEW
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
const VerifiedCircles = lazy(() => import('./pages/VerifiedCircles'));
const CreateCircle = lazy(() => import('./pages/CreateCircle'));
const PendingApprovals = lazy(() => import('./pages/PendingApprovals'));
const AdminCreatedCircles = lazy(() => import('./pages/AdminCreatedCircles'));
const SettingsPage = lazy(() => import('./pages/SettingsPage')); // NEW

import { PreferencesProvider } from './context/PreferencesContext';

function App() {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <EventProvider>
          <Router>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<AdminLayout />}>
                    <Route path="dashboard" element={<DashboardOverview />} /> {/* Updated */}
                    <Route path="admin/approvals" element={<PendingApprovals />} /> {/* Moved */}
                    <Route path="admin/circles" element={<VerifiedCircles />} />
                    <Route path="admin/my-circles" element={<AdminCreatedCircles />} />
                    <Route path="admin/create-circle" element={<CreateCircle />} />
                    <Route path="admin/edit-circle/:id" element={<CreateCircle />} />
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
                    <Route path="settings" element={<SettingsPage />} />

                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </Router>
        </EventProvider>
      </PreferencesProvider>
    </AuthProvider>
  );
}

export default App;
