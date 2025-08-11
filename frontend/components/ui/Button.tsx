import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

const buttonStyles = cva(
  'inline-flex items-center justify-center font-medium rounded-md focus-ring transition-colors select-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-brand text-white hover:bg-pink-600',
        subtle: 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700',
        ghost: 'text-neutral-300 hover:bg-neutral-800',
        danger: 'bg-red-600 text-white hover:bg-red-500'
      },
      size: {
        sm: 'text-xs px-2 h-7',
        md: 'text-sm px-3 h-9',
        lg: 'text-sm px-4 h-11'
      }
    },
    defaultVariants: { variant: 'primary', size: 'md' }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonStyles> { }

export const Button: React.FC<ButtonProps> = ({ variant, size, className, ...rest }) => (
  <button className={buttonStyles({ variant, size, className })} {...rest} />
);
