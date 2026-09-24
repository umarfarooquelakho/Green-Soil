import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDateTime } from '@/lib/utils'
import { PageLoading } from '@/components/ui/LoadingSpinner'

interface AuditLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  created_at: string
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100).then(({ data }) => {
      setLogs(data ?? [])
      setLoading(false)
    })
  }, [])

  if (loading) return <PageLoading />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-900">Audit Logs</h1>
      <div className="bg-white rounded-xl border border-dark-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-dark-50 border-b border-dark-100">
              {['Action', 'Entity', 'Entity ID', 'User', 'Time'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-dark-600 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-50">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-dark-50/50">
                <td className="px-4 py-2.5 font-medium text-dark-900">{log.action}</td>
                <td className="px-4 py-2.5 text-dark-600">{log.entity_type}</td>
                <td className="px-4 py-2.5 text-dark-400 font-mono text-xs">{log.entity_id?.slice(0,8) ?? '—'}</td>
                <td className="px-4 py-2.5 text-dark-400 font-mono text-xs">{log.user_id?.slice(0,8) ?? 'system'}</td>
                <td className="px-4 py-2.5 text-dark-400 text-xs">{formatDateTime(log.created_at)}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-dark-400">No audit logs yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
