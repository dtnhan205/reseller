import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSelector from '@/components/ui/LanguageSelector';
import { Wallet, Sparkles, BarChart3, Clock, DollarSign, Plus, LogOut, Shield } from 'lucide-react';
import { formatBalance } from '@/utils/format';

const sellerNavItems = [
  { path: '/generate', labelKey: 'nav.generate' as const, icon: Sparkles },
  { path: '/stats', labelKey: 'nav.stats' as const, icon: BarChart3 },
  { path: '/history', labelKey: 'nav.history' as const, icon: Clock },
  { path: '/transactions', labelKey: 'nav.transactions' as const, icon: DollarSign },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, refreshUser } = useAuthStore();
  const { t } = useTranslation();
  const balance = user?.wallet || 0;
  const isAdmin = user?.role === 'admin';

  // Refresh user data when component mounts
  useEffect(() => {
    if (user && !isAdmin) {
      // Refresh only on mount
      refreshUser();
    }
  }, []); // Only run once on mount

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen">
      <div className="flex justify-center">
        <div className="w-full max-w-[1800px] p-4 sm:p-6 md:p-8 lg:p-10 relative">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 relative">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${isAdmin ? 'from-cyan-500 to-teal-500' : 'from-cyan-500 to-teal-500'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                {isAdmin ? <Shield className="w-5 h-5 sm:w-7 sm:h-7 text-white" /> : <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-white" />}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">
                {isAdmin ? t('admin.dashboard') : t('dashboard.title')}
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
              <LanguageSelector />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-base sm:text-lg p-2 sm:p-0"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{t('auth.logout')}</span>
              </button>
            </div>
          </div>

          {/* Welcome & Balance (only for sellers) */}
          {!isAdmin && (
            <div className="mb-6 sm:mb-8 flex flex-col items-center">
              <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base md:text-lg text-center px-4">
                {t('dashboard.welcome')}, <span className="text-cyan-400 font-semibold break-all">{user?.email}</span>
              </p>
              <button
                onClick={() => navigate('/topup')}
                className="flex items-center gap-2 sm:gap-4 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg shadow-soft hover:shadow-medium transition-all duration-200 text-sm sm:text-base md:text-lg w-full sm:w-auto max-w-xs"
              >
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="truncate">{t('dashboard.balance')}: {formatBalance(balance)}$</span>
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 justify-center">
          {isAdmin ? (
            <button
              onClick={() => navigate('/admin')}
              className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-200 shadow-soft text-sm sm:text-base ${
                location.pathname === '/admin'
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white'
                  : 'bg-gray-950 text-gray-300 hover:bg-gray-900 border border-gray-800'
              }`}
            >
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">ADMIN</span>
              <span className="sm:hidden">ADM</span>
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
                    className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-200 shadow-soft text-sm sm:text-base ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white'
                        : 'bg-gray-950 text-gray-300 hover:bg-gray-900 border border-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">{t(item.labelKey)}</span>
                    <span className="sm:hidden">{t(item.labelKey).split(' ')[0]}</span>
                  </button>
                );
              })}
              <button
                onClick={() => navigate('/topup')}
                className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 transition-all duration-200 shadow-soft text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{t('nav.topup')}</span>
                <span className="sm:hidden">+</span>
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

