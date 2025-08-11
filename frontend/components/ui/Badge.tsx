import React from 'react';
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> { variant?: 'default' | 'level' | 'success' | 'danger'; }
const map: Record<string,string> = {
  default: 'bg-neutral-800 text-neutral-200',
  level: 'bg-brand text-white',
  success: 'bg-green-600 text-white',
  danger: 'bg-red-600 text-white'
};
export const Badge: React.FC<BadgeProps> = ({ variant='default', className='', ...rest }) => (
  <span className={`inline-flex items-center px-2 h-6 rounded-md text-xs font-medium ${map[variant]} ${className}`} {...rest} />
);
