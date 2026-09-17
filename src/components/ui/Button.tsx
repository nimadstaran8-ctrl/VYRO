import { cn } from '../../lib/utils';
import { cloneElement, isValidElement } from 'react';
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  isLoading?: boolean;
  asChild?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  isLoading,
  disabled,
  asChild,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-white text-primary border border-border hover:bg-background',
    outline: 'bg-transparent text-primary border border-primary hover:bg-primary hover:text-white',
    ghost: 'bg-transparent text-primary hover:bg-black/5',
    accent: 'bg-accent text-primary hover:bg-accent/90',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs tracking-wide',
    md: 'px-6 py-3 text-sm tracking-wide',
    lg: 'px-8 py-4 text-sm tracking-wide',
  };

  const classes = cn(baseStyles, variants[variant], sizes[size], className);

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string; children?: ReactNode }>;
    return cloneElement(child, {
      className: cn(classes, child.props.className),
      ...props,
    });
  }

  return (
    <button className={classes} disabled={disabled || isLoading} {...props}>
      {isLoading ? (
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}
