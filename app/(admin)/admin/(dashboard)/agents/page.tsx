import { AgentsLab } from '@/components/admin/AgentsLab'

export default function AdminAgents() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold">Agents Lab</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Activate your BROski agent cluster and watch the Command Deck.
        </p>
      </header>
      <AgentsLab />
    </div>
  )
}
