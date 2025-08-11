import React from 'react';
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className='', ...rest }) => (
  <div className={`surface p-4 ${className}`} {...rest} />
);
