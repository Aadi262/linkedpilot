import { TrendingUp, Users, MessageSquare, Megaphone, ArrowUpRight } from 'lucide-react'
import { PageTransition } from '@/components/ui/page-transition'
import { CountUp } from '@/components/ui/count-up'

const kpiCards = [
  { title: 'Connections Sent', value: 2847, suffix: '', change: '+18%', changePositive: true, icon: Users, sub: 'this month' },
  { title: 'Acceptance Rate', value: 38, suffix: '.4%', change: '+3.2%', changePositive: true, icon: TrendingUp, sub: 'avg across campaigns' },
  { title: 'Total Replies', value: 412, suffix: '', change: '+22%', changePositive: true, icon: MessageSquare, sub: 'this month' },
  { title: 'Active Campaigns', value: 7, suffix: '', change: '2 paused', changePositive: false, icon: Megaphone, sub: 'running now' },
]

const recentActivity = [
  { initials: 'SK', name: 'Sarah Kim', action: 'Connected with', target: 'John Doe', via: 'Campaign: Q1 Outreach', time: '2m ago', color: 'bg-blue-500' },
  { initials: 'MR', name: 'Mike R.', action: 'Reply received from', target: 'Emma Wilson', via: 'Campaign: SaaS Founders', time: '8m ago', color: 'bg-green-500' },
  { initials: 'AT', name: 'Alex T.', action: 'Connection accepted by', target: 'David Chen', via: 'Campaign: Q1 Outreach', time: '15m ago', color: 'bg-violet-500' },
  { initials: 'SK', name: 'Sarah Kim', action: 'Message sent to', target: 'Lisa Park', via: 'Campaign: Agency Leads', time: '23m ago', color: 'bg-blue-500' },
  { initials: 'MR', name: 'Mike R.', action: 'Connected with', target: 'James White', via: 'Campaign: Q1 Outreach', time: '31m ago', color: 'bg-blue-500' },
]

const accountHealth = [
  { name: 'Sarah K.', status: 'active' },
  { name: 'Mike R.', status: 'active' },
  { name: 'Alex T.', status: 'frozen' },
  { name: 'Jenny W.', status: 'active' },
  { name: 'Chris B.', status: 'flagged' },
]

export default function DashboardPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpiCards.map(({ title, value, suffix, change, changePositive, icon: Icon, sub }) => (
            <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-5 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">{title}</span>
                <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-violet-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                <CountUp value={value} suffix={suffix} />
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium flex items-center gap-0.5 ${changePositive ? 'text-green-400' : 'text-yellow-400'}`}>
                  {changePositive && <ArrowUpRight className="w-3 h-3" />}
                  {change}
                </span>
                <span className="text-xs text-gray-600">{sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Account Health Strip */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white">Account Health</span>
            <a href="/dashboard/accounts" className="text-xs text-violet-400 hover:text-violet-300">View all →</a>
          </div>
          <div className="flex flex-wrap gap-2">
            {accountHealth.map(({ name, status }) => (
              <div key={name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
                {status === 'active' ? (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                ) : status === 'frozen' ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                )}
                {name}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Chart */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-white">Activity (Last 30 Days)</span>
              <div className="flex gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />Connections</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Replies</span>
              </div>
            </div>
            <div className="h-44 flex items-end gap-1">
              {Array.from({ length: 30 }, (_, i) => {
                const h1 = 20 + Math.sin(i * 0.4) * 30 + (i % 7) * 3
                const h2 = 5 + Math.sin(i * 0.4 + 1) * 15 + (i % 5) * 2
                return (
                  <div key={i} className="flex-1 flex flex-col justify-end gap-0.5">
                    <div className="bg-green-500/60 rounded-sm" style={{ height: `${Math.max(4, h2)}%` }} />
                    <div className="bg-violet-500/70 rounded-sm" style={{ height: `${Math.max(8, h1)}%` }} />
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-700 mt-2">
              <span>Feb 1</span><span>Feb 15</span><span>Mar 1</span>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-white">Recent Activity</span>
            </div>
            <div className="space-y-3">
              {recentActivity.map(({ initials, name, action, target, via, time, color }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-full ${color} flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 mt-0.5`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300">
                      <span className="text-gray-500">{name}</span> {action} <span className="text-white font-medium">{target}</span>
                    </p>
                    <p className="text-xs text-gray-600">{via} · {time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
