import { ReactNode } from 'react';
import { typography } from '../../config/theme';

interface ButtonProps {
  onClick: () => void;
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'success';
}

const baseStyle = {
  ...typography.smallLabel,
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 500,
};

const variantStyles = {
  primary: {
    padding: '8px 12px',
    backgroundColor: 'transparent',
    color: 'var(--primary-color)',
    boxShadow: 'var(--shadow-sm)',
  },
  success: {
    width: '40px',
    height: '40px',
    backgroundColor: 'transparent',
    color: 'var(--success-color)',
    boxShadow: 'var(--shadow-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: {
    width: '40px',
    height: '40px',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    boxShadow: 'var(--shadow-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export function Button({ onClick, children, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} style={{ ...baseStyle, ...variantStyles[variant] }}>
      {children}
    </button>
  );
}
