import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export default function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`card ${className}`}>
      {title && (
        <h3 className="text-3xl font-bold text-cyan-400 mb-6">{title}</h3>
      )}
      {children}
    </div>
  );
}

