import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/auth/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import GeneratePage from './pages/GeneratePage';
import StatsPage from './pages/StatsPage';
import HistoryPage from './pages/HistoryPage';
import TransactionsPage from './pages/TransactionsPage';
import TopupPage from './pages/TopupPage';
import AdminPage from './pages/AdminPage';
import ToastContainer from './components/ui/ToastContainer';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  return user?.role === 'admin' ? <>{children}</> : <Navigate to="/" replace />;
}

function SellerRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  return user?.role === 'seller' ? <>{children}</> : <Navigate to="/admin" replace />;
}

function App() {
  const { user } = useAuthStore();
  const defaultRoute = user?.role === 'admin' ? '/admin' : '/generate';

  return (
    <>
      <ToastContainer />
      <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to={defaultRoute} replace />} />
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
        <Route
          path="generate"
          element={
            <SellerRoute>
              <GeneratePage />
            </SellerRoute>
          }
        />
        <Route
          path="stats"
          element={
            <SellerRoute>
              <StatsPage />
            </SellerRoute>
          }
        />
        <Route
          path="history"
          element={
            <SellerRoute>
              <HistoryPage />
            </SellerRoute>
          }
        />
        <Route
          path="transactions"
          element={
            <SellerRoute>
              <TransactionsPage />
            </SellerRoute>
          }
        />
        <Route
          path="topup"
          element={
            <SellerRoute>
              <TopupPage />
            </SellerRoute>
          }
        />
      </Route>
    </Routes>
    </>
  );
}

export default App;

