// frontend/src/App.js
// Main application component with routing and authentication

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { ToastProvider } from './context/ToastContext';

// Layout
import Layout from './components/common/Layout';

// Auth pages
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Dashboard
import Dashboard from './components/dashboard/Dashboard';

// Products
import ProductList from './components/products/ProductList';

// Orders
import OrderList from './components/orders/OrderList';

// Customers
import CustomerList from './components/customers/CustomerList';

// Inventory
import InventoryList from './components/inventory/InventoryList';

// Reports
import ReportsPage from './components/reports/ReportsPage';

// Settings
import SettingsPage from './components/settings/SettingsPage';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public route wrapper (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Placeholder components for routes we'll build in Stage 4
const PlaceholderPage = ({ title }) => (
  <Layout>
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-600">This page is coming soon in Stage 4.</p>
    </div>
  </Layout>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <StoreProvider>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </StoreProvider>
              </ProtectedRoute>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <StoreProvider>
                  <Layout>
                    <ProductList />
                  </Layout>
                </StoreProvider>
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <StoreProvider>
                  <Layout>
                    <OrderList />
                  </Layout>
                </StoreProvider>
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <StoreProvider>
                  <Layout>
                    <CustomerList />
                  </Layout>
                </StoreProvider>
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <StoreProvider>
                  <Layout>
                    <InventoryList />
                  </Layout>
                </StoreProvider>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <StoreProvider>
                  <Layout>
                    <ReportsPage />
                  </Layout>
                </StoreProvider>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <StoreProvider>
                  <Layout>
                    <SettingsPage />
                  </Layout>
                </StoreProvider>
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
