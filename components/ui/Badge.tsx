import { cn } from '@/lib/utils'

type BadgeVariant = 'brand' | 'neutral'

const variants: Record<BadgeVariant, string> = {
  brand: 'bg-brand/10 text-brand-700 dark:bg-brand-300/15 dark:text-brand-200',
  neutral:
    'bg-black/5 text-neutral-700 dark:bg-white/10 dark:text-neutral-200',
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export function Badge({
  variant = 'brand',
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
