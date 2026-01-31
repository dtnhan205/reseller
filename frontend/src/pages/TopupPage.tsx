import { useState } from 'react';
import { sellerApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Wallet, Plus } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

export default function TopupPage() {
  const { user, updateUser } = useAuthStore();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const quickAmounts = [10, 25, 50, 100, 200, 500];

  const handleTopup = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const { newBalance } = await sellerApi.topup({ amount: numAmount });
      updateUser({ ...user!, wallet: newBalance });
      setSuccess(`Successfully topped up ${formatCurrency(numAmount)}!`);
      setAmount('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Topup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl">
      <Card title="Topup Wallet">
        <div className="space-y-6">
          {/* Current Balance */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-500/30 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Current Balance</p>
                <p className="text-3xl font-bold gradient-text">
                  {formatCurrency(user?.wallet || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <Input
              type="number"
              label="Topup Amount"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Quick Amount
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="py-2 px-4 bg-gray-950 hover:bg-gray-900 border border-gray-800 rounded-lg text-gray-300 hover:text-white transition-colors"
                >
                  ${quickAmount}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Topup Button */}
          <Button
            onClick={handleTopup}
            className="w-full"
            isLoading={isLoading}
            disabled={!amount || parseFloat(amount) <= 0}
          >
            <Plus className="w-5 h-5 inline mr-2" />
            TOPUP WALLET
          </Button>
        </div>
      </Card>
      </div>
    </div>
  );
}

