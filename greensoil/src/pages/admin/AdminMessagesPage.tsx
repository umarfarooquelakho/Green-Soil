import { useEffect, useState, useCallback } from 'react'
import { Mail, MailOpen, Archive } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { contentService } from '@/services/contentService'
import type { TableColumn } from '@/types/common.types'
import { formatDateTime } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: string
  created_at: string
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState<ContactMessage | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await contentService.getContactMessages(page, 20)
    setMessages(res.data as ContactMessage[])
    setTotal(res.total)
    setTotalPages(res.totalPages)
    setLoading(false)
  }, [page])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id: string, status: string) => {
    await contentService.updateMessageStatus(id, status)
    toast.success(`Marked as ${status.toLowerCase()}`)
    load()
  }

  const statusVariant: Record<string, 'warning' | 'info' | 'success' | 'default'> = {
    NEW: 'warning', READ: 'info', REPLIED: 'success', ARCHIVED: 'default',
  }

  const columns: TableColumn<ContactMessage>[] = [
    {
      key: 'status',
      header: '',
      width: '40px',
      render: (_, row) => (
        row.status === 'NEW'
          ? <Mail className="w-4 h-4 text-primary-600" />
          : <MailOpen className="w-4 h-4 text-dark-400" />
      ),
    },
    {
      key: 'name',
      header: 'From',
      render: (_, row) => (
        <div>
          <p className="font-medium text-dark-900">{row.name}</p>
          <p className="text-xs text-dark-400">{row.email}</p>
        </div>
      ),
    },
    { key: 'subject', header: 'Subject', render: (_, row) => <span className="text-dark-700">{row.subject}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (_, row) => (
        <Badge variant={statusVariant[row.status] ?? 'default'} size="sm">{row.status}</Badge>
      ),
    },
    { key: 'created_at', header: 'Received', render: (_, row) => formatDateTime(row.created_at) },
    {
      key: 'id',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          {row.status === 'NEW' && (
            <button onClick={() => updateStatus(row.id, 'READ')}
              className="p-1.5 text-dark-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Mark Read">
              <MailOpen className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => updateStatus(row.id, 'ARCHIVED')}
            className="p-1.5 text-dark-400 hover:text-dark-600 hover:bg-dark-100 rounded-lg transition-colors" title="Archive">
            <Archive className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900">Contact Messages</h1>
        <p className="text-dark-500 text-sm mt-0.5">{total} messages</p>
      </div>

      <DataTable
        columns={columns}
        data={messages}
        loading={loading}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => setSelected(row)}
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={20}
        onPageChange={setPage}
        emptyTitle="No messages yet"
      />

      {/* Message detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-dark-900 text-lg">{selected.subject}</h3>
                <p className="text-sm text-dark-500">from {selected.name} · {selected.email}</p>
                {selected.phone && <p className="text-sm text-dark-500">{selected.phone}</p>}
              </div>
              <button onClick={() => setSelected(null)} className="text-dark-400 hover:text-dark-600 text-xl">×</button>
            </div>
            <div className="bg-dark-50 rounded-xl p-4 text-dark-700 text-sm leading-relaxed mb-4 whitespace-pre-line">
              {selected.message}
            </div>
            <div className="flex gap-2 justify-end">
              {selected.status !== 'REPLIED' && (
                <Button size="sm" onClick={() => { updateStatus(selected.id, 'REPLIED'); setSelected(null) }}>
                  Mark as Replied
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
