import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    'rounded-2xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base flex items-center justify-center relative px-4 py-3 min-h-[48px]';

  const variantClasses = {
    primary:
      'text-white bg-gradient-to-br from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 shadow-[0_0_5px_rgba(99,102,241,0.25)]',
    secondary:
      'text-gray-200 bg-slate-900/40 hover:bg-slate-900/60 border border-gray-800/40 shadow-[0_0_5px_rgba(99,102,241,0.15)]',
    outline:
      'text-indigo-300 bg-transparent border border-indigo-500/30 hover:border-indigo-500/50 shadow-[0_0_5px_rgba(99,102,241,0.15)]',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
