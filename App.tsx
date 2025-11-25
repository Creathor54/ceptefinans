
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CameraScan from './components/CameraScan';
import ConfirmReceipt from './components/ConfirmReceipt';
import ManualEntry from './components/ManualEntry';
import ManageCategories from './components/ManageCategories';
import Budgets from './components/Budgets';
import PaymentPlan from './components/PaymentPlan';
import Subscriptions from './components/Subscriptions';
import Notifications from './components/Notifications';
import EditProfile from './components/EditProfile';
import ChangePassword from './components/ChangePassword';
import { ExpenseProvider } from './context/ExpenseContext';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-[#0B1120] z-[100]">
      <div className="relative flex flex-col items-center animate-in fade-in zoom-in duration-700">
        <div className="relative mb-6">
           {/* Ambient Glow */}
           <div className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-xl animate-pulse"></div>
           {/* CSS Logo */}
           <div className="relative size-24 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30 transform rotate-6 animate-[bounce_2s_infinite]">
               <span className="material-symbols-outlined text-white text-5xl">account_balance_wallet</span>
           </div>
        </div>
        <h1 className="text-4xl font-[900] tracking-tighter text-zinc-900 dark:text-white animate-pulse">
            Cepte<span className="text-[#3B82F6]">Finans</span>
        </h1>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2200); // Show splash for 2.2 seconds
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/scan" element={<CameraScan />} />
      <Route path="/confirm" element={<ConfirmReceipt />} />
      <Route path="/manual" element={<ManualEntry />} />
      <Route path="/categories" element={<ManageCategories />} />
      <Route path="/budgets" element={<Budgets />} />
      <Route path="/payment-plan" element={<PaymentPlan />} />
      <Route path="/subscriptions" element={<Subscriptions />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/edit-profile" element={<EditProfile />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ExpenseProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </ExpenseProvider>
  );
};

export default App;
