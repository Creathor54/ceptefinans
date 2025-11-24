
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CameraScan from './components/CameraScan';
import ConfirmReceipt from './components/ConfirmReceipt';
import ManualEntry from './components/ManualEntry';
import ManageCategories from './components/ManageCategories';
import Budgets from './components/Budgets';
import PaymentPlan from './components/PaymentPlan';
import Subscriptions from './components/Subscriptions';
import Notifications from './components/Notifications';
import Login from './components/Login';
import EditProfile from './components/EditProfile';
import ChangePassword from './components/ChangePassword';
import { ExpenseProvider, useExpenses } from './context/ExpenseContext';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useExpenses();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
    return (
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/scan" element={<ProtectedRoute><CameraScan /></ProtectedRoute>} />
          <Route path="/confirm" element={<ProtectedRoute><ConfirmReceipt /></ProtectedRoute>} />
          <Route path="/manual" element={<ProtectedRoute><ManualEntry /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><ManageCategories /></ProtectedRoute>} />
          <Route path="/budgets" element={<ProtectedRoute><Budgets /></ProtectedRoute>} />
          <Route path="/payment-plan" element={<ProtectedRoute><PaymentPlan /></ProtectedRoute>} />
          <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

const App: React.FC = () => {
  return (
    <ExpenseProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </ExpenseProvider>
  );
};

export default App;
