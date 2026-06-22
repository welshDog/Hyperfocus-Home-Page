export default function EcosystemTicker() {
  const stats = [
    { label: 'GitHub Repos', value: '88', emoji: '📦' },
    { label: 'Contributions', value: '3,991+', emoji: '⚡' },
    { label: 'Blog Posts', value: '26', emoji: '📝' },
    { label: 'AI Agents', value: '32', emoji: '🤖' },
    { label: 'Designs', value: '80+', emoji: '🎨' },
    { label: 'Discord Members', value: 'Growing', emoji: '👊' },
  ]

  return (
    <section className="bg-hf-text text-white py-4 overflow-hidden" aria-label="Ecosystem stats">
      <div className="flex gap-12 items-center justify-center flex-wrap px-4">
        {stats.map(stat => (
          <div key={stat.label} className="flex items-center gap-2 text-sm">
            <span>{stat.emoji}</span>
            <strong className="text-hf-blue">{stat.value}</strong>
            <span className="text-gray-300">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
