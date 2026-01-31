import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { authApi } from '@/services/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Lock, Mail, ShoppingCart, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { error: showError, success: showSuccess } = useToastStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      showError('Please enter both email and password', 5000);
      return;
    }
    
    setIsLoading(true);

    try {
      console.log('Attempting login with:', { email: formData.email });
      const response = await authApi.login(formData);
      console.log('Login response:', response);
      
      if (response && response.token && response.user) {
        setAuth(response.user, response.token);
        showSuccess('Login successful!');
        setTimeout(() => {
          navigate('/');
        }, 500);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      let errorMessage = 'Login failed';
      
      if (err.response) {
        // Server responded with error
        const status = err.response.status;
        const data = err.response.data;
        errorMessage = data?.message || data?.error || `Error ${status}: ${status === 401 ? 'Invalid credentials' : status === 400 ? 'Bad request' : 'Server error'}`;
        console.error('Server error response:', { status, data });
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'Cannot connect to server. Please check if backend is running.';
        console.error('No response received:', err.request);
      } else {
        // Something else happened
        errorMessage = err.message || 'An unexpected error occurred';
        console.error('Error:', err);
      }
      
      console.log('Showing error toast:', errorMessage);
      showError(errorMessage, 7000);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Pattern Background */}
      <div className="absolute inset-0" style={{
        backgroundColor: '#0a0a1a',
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(40, 40, 80, 0.04) 2px, rgba(40, 40, 80, 0.04) 4px),
          repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(40, 40, 80, 0.04) 2px, rgba(40, 40, 80, 0.04) 4px),
          repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(30, 30, 70, 0.06) 1px, rgba(30, 30, 70, 0.06) 2px),
          repeating-linear-gradient(-45deg, transparent, transparent 1px, rgba(30, 30, 70, 0.06) 1px, rgba(30, 30, 70, 0.06) 2px)
        `,
        backgroundSize: '40px 40px, 40px 40px, 20px 20px, 20px 20px'
      }}></div>


      <div className="w-full max-w-md z-10 p-4 relative">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl blur-sm opacity-30"></div>
              <div className="relative bg-gray-950/80 backdrop-blur-sm p-3 rounded-xl border border-cyan-500/30">
                <ShoppingCart className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            <h1 className="text-5xl font-extrabold">
              <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
                RESELLER VN
              </span>
            </h1>
          </div>
          <p className="text-gray-300 text-sm font-medium tracking-wider uppercase">
            SECURE AUTHENTICATION PORTAL
          </p>
        </div>

        {/* Card */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-2xl blur-sm"></div>
          <div className="relative bg-gray-950/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-800/50 shadow-soft">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  USERNAME
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-teal-500/0 to-emerald-500/0 group-hover:from-cyan-500/10 group-hover:via-teal-500/10 group-hover:to-emerald-500/10 rounded-lg transition-all duration-300"></div>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 w-5 h-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors z-10" />
                    <Input
                      type="email"
                      placeholder="Enter your username"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-12 bg-black/50 border-gray-800 focus:border-cyan-500 focus:ring-cyan-500/20"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  PASSWORD
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-teal-500/0 to-emerald-500/0 group-hover:from-cyan-500/10 group-hover:via-teal-500/10 group-hover:to-emerald-500/10 rounded-lg transition-all duration-300"></div>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-4 w-5 h-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors z-10" />
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-12 bg-black/50 border-gray-800 focus:border-cyan-500 focus:ring-cyan-500/20"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-4 text-gray-400 hover:text-cyan-400 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full mt-8 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-bold py-4 px-6 rounded-lg shadow-soft hover:shadow-soft transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]" 
                isLoading={isLoading}
              >
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  AUTHENTICATE
                </span>
              </Button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}

