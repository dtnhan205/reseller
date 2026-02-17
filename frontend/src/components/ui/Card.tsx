import { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  id?: string;
  style?: CSSProperties;
}

export default function Card({ children, className = '', title, id, style }: CardProps) {
  return (
    <div 
      id={id} 
      className={`card ${className}`}
      style={{
        background: 'rgba(15, 23, 42, 0.35)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(31, 41, 55, 0.5)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.45)',
        ...style,
      }}
    >
      {title && (
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6 relative z-10">{title}</h3>
      )}
      <div className="relative z-10">
      {children}
      </div>
    </div>
  );
}

