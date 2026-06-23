import { forwardRef } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Variant = 'solid' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 font-heading font-semibold rounded-xl transition-colors duration-150 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none'

// Solid + outline only — no gradient buttons (design rule).
const variants: Record<Variant, string> = {
  solid: 'bg-brand text-white hover:bg-brand-600 active:bg-brand-700',
  outline:
    'border-2 border-brand text-brand hover:bg-brand hover:text-white dark:text-brand-200 dark:border-brand-300 dark:hover:bg-brand-300 dark:hover:text-ink',
  ghost:
    'text-brand hover:bg-brand/10 dark:text-brand-200 dark:hover:bg-brand-300/10',
}

// Heights keep min 44px touch targets on md/lg.
const sizes: Record<Size, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-11 px-6 text-base',
  lg: 'h-12 px-8 text-base',
}

interface ButtonBaseProps {
  variant?: Variant
  size?: Size
  className?: string
}

interface ButtonProps
  extends ButtonBaseProps,
    React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'solid', size = 'md', className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  ),
)
Button.displayName = 'Button'

interface ButtonLinkProps
  extends ButtonBaseProps,
    Omit<React.ComponentProps<typeof Link>, 'className'> {}

/** Anchor styled as a button — for navigation CTAs. */
export function ButtonLink({
  variant = 'solid',
  size = 'md',
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  )
}
