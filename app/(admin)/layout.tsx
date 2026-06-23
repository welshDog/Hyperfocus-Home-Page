// Mission Control is dark-only. The `dark` class activates Tailwind dark:
// variants for any shared components reused here (Card, Button, Badge).
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dark min-h-dvh bg-ink text-neutral-100 font-body">
      {children}
    </div>
  )
}
