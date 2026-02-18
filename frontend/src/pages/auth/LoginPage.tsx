import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { useTranslation } from '@/hooks/useTranslation';
import { authApi } from '@/services/api';
import { Lock, Mail, Sparkles, Loader2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { error: showError, success: showSuccess } = useToastStore();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!formData.email || !formData.password) {
      showError(t('auth.enterBoth'), 5000);
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.login(formData);

      if (response && response.token && response.user) {
        setAuth(response.user, response.token);
        showSuccess(t('auth.loginSuccess'));
        setTimeout(() => {
          const dest = response.user.role === 'admin' ? '/app/admin' : '/app/generate';
          navigate(dest, { replace: true });
        }, 500);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      let errorMessage = t('auth.loginFailed');

      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        errorMessage =
          data?.message ||
          data?.error ||
          `Error ${status}: ${
            status === 401
              ? 'Invalid credentials'
              : status === 400
                ? 'Bad request'
                : 'Server error'
          }`;
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please check if backend is running.';
      } else {
        errorMessage = err.message || 'An unexpected error occurred';
      }

      showError(errorMessage, 7000);
      setIsLoading(false);
      return false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-black overflow-hidden p-4 sm:p-6 text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-black" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '4px 4px',
          }}
        />
      </div>

      <div className="w-full max-w-md z-10 relative animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl border border-gray-800/40 bg-slate-900/20 shadow-xl">
              <Sparkles className="w-6 h-6 text-indigo-400/80" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-white via-indigo-200 to-slate-400 bg-clip-text text-transparent">
                RESELLER VN
              </span>
            </h1>
          </div>
          <p className="text-gray-500 text-xs font-bold tracking-[0.2em] uppercase">
            Secure Authentication Portal
          </p>
        </div>

        <Card className="p-8 sm:p-10 border-gray-800/30 bg-slate-900/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider px-1">
                  {t('auth.username')}
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-indigo-400/60 transition-colors" />
                  <input
                    type="email"
                    placeholder={t('auth.enterUsername')}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-gray-800/40 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/30 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider px-1">
                  {t('auth.password')}
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-indigo-400/60 transition-colors" />
                  <input
                    type="password"
                    placeholder={t('auth.enterPassword')}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-gray-800/40 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/30 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-br from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 border-none"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('auth.loginButton')}...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>{t('auth.authenticate')}</span>
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-800/30 text-center">
            <button
              type="button"
              onClick={() => {
                showSuccess('Vui lòng liên hệ với Zalo 0342031354 để đăng ký tài khoản seller', 8000);
              }}
              className="text-xs font-semibold text-gray-500 hover:text-indigo-300 transition-colors"
            >
              {t('auth.noAccount') || 'Bạn chưa có tài khoản?'}
            </button>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-gray-700 text-xs">© {new Date().getFullYear()} Reseller Platform.</p>
        </div>
      </div>
    </div>
  );
}
