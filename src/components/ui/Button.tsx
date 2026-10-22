import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'amber' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
}

const variantClass: Record<Variant, string> = {
  primary:
    'bg-gs-cyan text-gs-navy font-semibold hover:bg-[#2952D6] active:bg-[#1E40B2] disabled:bg-gs-cyan/40 disabled:text-gs-navy/60',
  secondary:
    'bg-gs-raised text-gs-ice border border-black/10 hover:border-gs-cyan/50 hover:text-gs-cyan active:bg-gs-panel',
  ghost: 'bg-transparent text-gs-mist hover:text-gs-ice hover:bg-black/4',
  amber: 'bg-gs-amber text-gs-navy font-semibold hover:bg-[#D34545] active:bg-[#B93A3A]',
  danger: 'bg-transparent text-gs-danger border border-gs-danger/40 hover:bg-gs-danger/10',
}

const sizeClass: Record<Size, string> = {
  sm: 'text-xs px-2.5 py-1.5 gap-1.5 rounded-lg',
  md: 'text-sm px-4 py-2 gap-2 rounded-xl',
  lg: 'text-base px-6 py-3 gap-2.5 rounded-xl',
}

export function Button({ variant = 'secondary', size = 'md', icon, className = '', children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center whitespace-nowrap transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}
