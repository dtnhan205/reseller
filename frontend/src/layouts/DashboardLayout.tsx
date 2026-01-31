import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Wallet, Sparkles, BarChart3, Clock, DollarSign, Plus, LogOut, Shield } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

const sellerNavItems = [
  { path: '/generate', label: 'GENERATE', icon: Sparkles },
  { path: '/stats', label: 'STATS', icon: BarChart3 },
  { path: '/history', label: 'HISTORY', icon: Clock },
  { path: '/transactions', label: 'TRANSACTIONS', icon: DollarSign },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const balance = user?.wallet || 0;
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen">
      <div className="flex justify-center">
        <div className="w-full max-w-[1800px] p-6 md:p-8 lg:p-10 relative">
          {/* Header */}
          <div className="flex items-center justify-center mb-8 relative">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${isAdmin ? 'from-cyan-500 to-teal-500' : 'from-cyan-500 to-teal-500'} rounded-lg flex items-center justify-center`}>
                {isAdmin ? <Shield className="w-7 h-7 text-white" /> : <Sparkles className="w-7 h-7 text-white" />}
              </div>
              <h1 className="text-4xl font-bold gradient-text">
                {isAdmin ? 'Admin Dashboard' : 'Reseller Dashboard'}
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="absolute right-0 flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-lg"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>

          {/* Welcome & Balance (only for sellers) */}
          {!isAdmin && (
            <div className="mb-8 flex flex-col items-center">
              <p className="text-gray-400 mb-4 text-lg">
                Welcome, <span className="text-cyan-400 font-semibold">{user?.email}</span>
              </p>
              <button
                onClick={() => navigate('/topup')}
                className="flex items-center gap-4 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-semibold py-4 px-8 rounded-lg shadow-soft hover:shadow-medium transition-all duration-200 text-lg"
              >
                <Wallet className="w-6 h-6" />
                <span>Balance: {formatCurrency(balance)}</span>
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-wrap gap-4 mb-8 justify-center">
          {isAdmin ? (
            <button
              onClick={() => navigate('/admin')}
              className={`flex items-center gap-3 px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-soft text-base ${
                location.pathname === '/admin'
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white'
                  : 'bg-gray-950 text-gray-300 hover:bg-gray-900 border border-gray-800'
              }`}
            >
              <Shield className="w-5 h-5" />
              ADMIN
            </button>
          ) : (
            <>
              {sellerNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-soft text-base ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white'
                        : 'bg-gray-950 text-gray-300 hover:bg-gray-900 border border-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
              <button
                onClick={() => navigate('/topup')}
                className="flex items-center gap-3 px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 transition-all duration-200 shadow-soft text-base"
              >
                <Plus className="w-5 h-5" />
                TOPUP
              </button>
            </>
          )}
        </div>

          {/* Main Content */}
          <div className="flex justify-center">
            <div className="w-full max-w-[1600px]">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

