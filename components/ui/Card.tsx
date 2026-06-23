import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Adds hover elevation — use for interactive/linked cards. */
  interactive?: boolean
}

/** Surface-elevation card. No coloured side borders (design rule). */
export function Card({ className, interactive, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white dark:bg-card shadow-card border border-black/5 dark:border-white/5',
        interactive &&
          'transition-shadow duration-200 hover:shadow-card-hover',
        className,
      )}
      {...props}
    />
  )
}
