import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/layout/Layout';
import Login from '@/features/auth/Login';
import Register from '@/features/auth/Register';
import VerifyEmail from '@/features/auth/VerifyEmail';
import Dashboard from '@/features/dashboard/Dashboard';
import Categories from '@/features/categories/Categories';
import Expenses from '@/features/expenses/Expenses';
import Budgets from '@/features/budgets/Budgets';
import Subscriptions from '@/features/subscriptions/Subscriptions';
import SavingGoals from '@/features/saving-goals/SavingGoals';
import Settings from '@/features/settings/Settings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/saving-goals" element={<SavingGoals />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
          
          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
