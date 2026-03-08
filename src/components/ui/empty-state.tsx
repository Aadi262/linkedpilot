import Link from 'next/link'
import { type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: { label: string; href: string }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center border border-white/10 border-dashed rounded-2xl p-16">
      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-gray-500" />
      </div>
      <h3 className="text-base font-semibold text-white mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-6">{description}</p>
      )}
      {action && (
        <Link href={action.href}>
          <Button variant="primary" className="gap-2">{action.label}</Button>
        </Link>
      )}
    </div>
  )
}
