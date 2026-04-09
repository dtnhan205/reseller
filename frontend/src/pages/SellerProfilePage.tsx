import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { authApi } from '@/services/api';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import SellerStatsPanel from '@/components/seller/SellerStatsPanel';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Calendar,
  Loader2,
  Check,
  X,
  ArrowDownToLine,
  Receipt,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/format';

type ProfileTab = 'info' | 'stats';

export default function SellerProfilePage() {
  const { user, refreshUser } = useAuthStore();
  const { t, language } = useTranslation();
  const { usdToVnd } = useExchangeRate();
  const { error: showError, success: showSuccess } = useToastStore();

  const [activeTab, setActiveTab] = useState<ProfileTab>('info');
  const [isRefreshingProfile, setIsRefreshingProfile] = useState(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsRefreshingProfile(true);
      try {
        await refreshUser();
      } finally {
        setIsRefreshingProfile(false);
      }
    };
    load();
  }, [refreshUser]);

  const passwordRequirements = [
    { met: newPassword.length >= 6, text: 'Ít nhất 6 ký tự' },
    { met: /[A-Z]/.test(newPassword), text: 'Ít nhất 1 chữ hoa' },
    { met: /[a-z]/.test(newPassword), text: 'Ít nhất 1 chữ thường' },
    { met: /[0-9]/.test(newPassword), text: 'Ít nhất 1 số' },
  ];

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      showError('Vui lòng nhập mật khẩu cũ');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      showError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Mật khẩu mới không khớp');
      return;
    }

    const failedRequirements = passwordRequirements.filter((r) => !r.met);
    if (failedRequirements.length > 0) {
      showError('Mật khẩu mới chưa đủ yêu cầu');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      showSuccess('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      await refreshUser();
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Không thể đổi mật khẩu';
      showError(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const isPasswordStrong = passwordRequirements.every((r) => r.met);

  const totalTopup = user?.totalTopup ?? 0;
  const totalSpent = user?.totalSpent ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl">
            <User className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
              {t('profile.title')}
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">{t('profile.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Tabs: luôn phía trên nội dung (mobile & desktop) */}
      <div className="flex flex-wrap gap-2 border-b border-gray-800/80 pb-0">
        <button
          type="button"
          onClick={() => setActiveTab('info')}
          className={
            `px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-all ` +
            (activeTab === 'info'
              ? 'text-cyan-400 border-cyan-400 bg-cyan-500/10'
              : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5')
          }
        >
          {t('profile.tabInfo')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('stats')}
          className={
            `px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-all ` +
            (activeTab === 'stats'
              ? 'text-cyan-400 border-cyan-400 bg-cyan-500/10'
              : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5')
          }
        >
          {t('profile.tabStats')}
        </button>
      </div>

      {activeTab === 'info' && (
        <>
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">{t('profile.accountInfo')}</h2>
            </div>

            {isRefreshingProfile ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-black/30 rounded-xl p-4 border border-gray-800/50">
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">
                    {t('profile.email')}
                  </label>
                  <p className="text-white font-medium text-lg break-all">{user?.email || 'N/A'}</p>
                </div>

                <div className="bg-black/30 rounded-xl p-4 border border-gray-800/50">
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">
                    {t('profile.role')}
                  </label>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    <p className="text-white font-medium text-lg capitalize">{user?.role || 'seller'}</p>
                  </div>
                </div>

                <div className="bg-black/30 rounded-xl p-4 border border-gray-800/50">
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">
                    {t('profile.memberSince')}
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <p className="text-white font-medium">{user?.createdAt ? formatDate(user.createdAt) : 'N/A'}</p>
                  </div>
                </div>

                <div className="bg-black/30 rounded-xl p-4 border border-gray-800/50">
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">
                    {t('profile.balance')}
                  </label>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(user?.wallet || 0, language, usdToVnd)}
                  </p>
                </div>

                <div className="bg-black/30 rounded-xl p-4 border border-gray-800/50">
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block flex items-center gap-2">
                    <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-400" />
                    {t('profile.totalTopup')}
                  </label>
                  <p className="text-2xl font-bold text-emerald-400">
                    {formatCurrency(totalTopup, language, usdToVnd)}
                  </p>
                </div>

                <div className="bg-black/30 rounded-xl p-4 border border-gray-800/50">
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block flex items-center gap-2">
                    <Receipt className="w-3.5 h-3.5 text-amber-400" />
                    {t('profile.totalSpent')}
                  </label>
                  <p className="text-2xl font-bold text-amber-400">
                    {formatCurrency(totalSpent, language, usdToVnd)}
                  </p>
                </div>
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">{t('profile.changePassword')}</h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-300 font-medium">{t('profile.currentPassword')}</label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t('profile.enterCurrentPassword')}
                    className="pr-12 bg-black/50 border-gray-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300 font-medium">{t('profile.newPassword')}</label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t('profile.enterNewPassword')}
                    className="pr-12 bg-black/50 border-gray-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {newPassword && (
                  <div className="space-y-2 mt-3">
                    <div className="flex gap-2">
                      {passwordRequirements.map((req, idx) => (
                        <div
                          key={idx}
                          className={`flex-1 h-1.5 rounded-full transition-colors ${
                            req.met ? 'bg-green-500' : 'bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="space-y-1">
                      {passwordRequirements.map((req, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          {req.met ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <X className="w-3 h-3 text-gray-500" />
                          )}
                          <span className={req.met ? 'text-green-400' : 'text-gray-500'}>{req.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300 font-medium">{t('profile.confirmPassword')}</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('profile.confirmNewPassword')}
                    className="pr-12 bg-black/50 border-gray-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {confirmPassword && (
                  <div className="flex items-center gap-2 mt-2">
                    {newPassword === confirmPassword ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-400">{t('profile.passwordMatch')}</span>
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 text-red-500" />
                        <span className="text-xs text-red-400">{t('profile.passwordMismatch')}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={
                    isChangingPassword || !isPasswordStrong || newPassword !== confirmPassword || !currentPassword
                  }
                  className="w-full sm:w-auto"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {t('profile.changing')}
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      {t('profile.changePasswordButton')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-4">
          <SellerStatsPanel compactHeader />
        </div>
      )}
    </div>
  );
}
