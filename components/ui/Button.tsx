import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          'relative inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 rounded-xl': variant === 'primary',
            'bg-white text-secondary-700 border-2 border-secondary-200 hover:bg-secondary-50 hover:border-secondary-300 shadow-md hover:shadow-lg rounded-xl': variant === 'secondary',
            'border-2 border-primary-200 bg-transparent text-primary-600 hover:bg-primary-50 hover:border-primary-300 rounded-xl': variant === 'outline',
            'text-secondary-600 hover:bg-secondary-100 rounded-lg': variant === 'ghost',
            'bg-gradient-to-r from-error-600 to-error-700 text-white hover:from-error-700 hover:to-error-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 rounded-xl': variant === 'destructive',
          },
          {
            'h-8 px-4 text-sm': size === 'sm',
            'h-12 px-6 text-base': size === 'md',
            'h-14 px-8 text-lg': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }