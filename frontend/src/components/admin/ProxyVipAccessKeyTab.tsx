import { useEffect, useState } from 'react';
import { adminApi } from '@/services/api';
import { useToastStore } from '@/store/toastStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Key } from 'lucide-react';

export default function ProxyVipAccessKeyTab() {
  const { success: showSuccess, error: showError } = useToastStore();
  const [currentKey, setCurrentKey] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadKey = async () => {
      setIsLoading(true);
      try {
        const data = await adminApi.getProxyVipAccessKey();
        setCurrentKey(data.value || '');
        setKeyInput(data.value || '');
      } catch (err: any) {
        showError(err.response?.data?.message || 'Không thể tải key Proxy VIP');
      } finally {
        setIsLoading(false);
      }
    };

    loadKey();
  }, [showError]);

  const handleUpdateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = keyInput.trim();
    if (!trimmed) {
      showError('Vui lòng nhập key');
      return;
    }
    if (trimmed.length < 4 || trimmed.length > 128) {
      showError('Key phải từ 4 đến 128 ký tự');
      return;
    }

    setIsLoading(true);
    try {
      const updated = await adminApi.updateProxyVipAccessKey(trimmed);
      setCurrentKey(updated.value || trimmed);
      showSuccess('Đã cập nhật key Proxy VIP');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Cập nhật key thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card
        title="Proxy VIP Access Key"
        style={{
          backdropFilter: 'blur(2px) saturate(120%)',
          WebkitBackdropFilter: 'blur(2px) saturate(120%)',
        }}
      >
        <form onSubmit={handleUpdateKey} className="space-y-6">
          <div className="bg-gray-900/40 border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm">Key hiện tại</span>
              <span className="text-emerald-400 font-bold text-base break-all">{currentKey || 'Chưa có'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Key mới</label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Nhập key mới"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="pl-12 bg-black/50 border-gray-800 focus:border-cyan-500 text-base"
                required
              />
            </div>
            <p className="text-xs text-gray-500">Dùng để truy cập trang Proxy VIP public.</p>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 shadow-lg"
            isLoading={isLoading}
          >
            {!isLoading && <Key className="w-5 h-5 inline mr-2" />}
            {isLoading ? 'Đang cập nhật...' : 'Cập nhật key'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
