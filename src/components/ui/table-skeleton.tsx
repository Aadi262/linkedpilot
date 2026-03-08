import { Skeleton } from '@/components/ui/skeleton'

interface TableSkeletonProps {
  rows?: number
  cols?: number
}

export function TableSkeleton({ rows = 5, cols = 5 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b border-white/5">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3.5">
              <Skeleton className="h-4 rounded bg-white/8" style={{ width: `${60 + (c * 13 + r * 7) % 35}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export function ConversationSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="divide-y divide-white/5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="w-9 h-9 rounded-full bg-white/8 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-32 bg-white/8 rounded" />
            <Skeleton className="h-3 w-48 bg-white/8 rounded" />
          </div>
          <Skeleton className="h-3 w-10 bg-white/8 rounded" />
        </div>
      ))}
    </div>
  )
}
