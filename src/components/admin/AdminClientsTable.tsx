'use client'
import { useState } from 'react'
import { Plus, RefreshCw, Pencil, Search } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Client {
  id: string
  name: string
  email: string
  status: 'active' | 'suspended' | 'inactive'
  minute_limit: number
  created_at: string
  callCount: number
  agentCount?: number
  minutesUsed?: number
}

export default function AdminClientsTable({ clients: initial }: { clients: Client[] }) {
  const [clients, setClients] = useState(initial)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [newClient, setNewClient] = useState({ name: '', email: '', minute_limit: 300 })
  const [loading, setLoading] = useState(false)

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  async function handleAdd() {
    setLoading(true)
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newClient),
    })
    if (res.ok) {
      const added = await res.json()
      setClients(p => [added, ...p])
      setShowModal(false)
      setNewClient({ name: '', email: '', minute_limit: 300 })
    }
    setLoading(false)
  }

  async function toggleStatus(id: string, status: string) {
    const next = status === 'active' ? 'suspended' : 'active'
    await fetch(`/api/clients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    setClients(p => p.map(c => c.id === id ? { ...c, status: next as any } : c))
  }

  return (
    <div className="animate-fade-in">
      {/* Top bar */}
      <div className="top-bar">
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Welcome back, Admin</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{clients.filter(c => c.status === 'active').length} active clients</span>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={14} />
            New Client
          </button>
        </div>
      </div>

      <div className="page-body pt-7">
        {/* Header */}
        <div className="mb-7">
          <h1 className="page-title">Clients</h1>
          <p className="page-sub">Manage client accounts, minute limits, and agent assignments.</p>
        </div>

        {/* Search */}
        <div className="search-wrap max-w-sm">
          <Search size={14} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th className="th">Client</th>
                <th className="th">Usage</th>
                <th className="th">Agents</th>
                <th className="th">Status</th>
                <th className="th">Last Synced</th>
                <th className="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="td text-center text-gray-300 py-16">
                    {search ? 'No clients match your search.' : 'No clients yet. Add your first client.'}
                  </td>
                </tr>
              ) : filtered.map(client => {
                const pct = Math.min(100, Math.round(((client.minutesUsed || 0) / client.minute_limit) * 100))
                return (
                  <tr key={client.id} className="tr">
                    {/* Client */}
                    <td className="td">
                      <div className="font-medium text-gray-900">{client.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{client.email}</div>
                    </td>
                    {/* Usage */}
                    <td className="td">
                      <div className="text-gray-700 mb-1.5">
                        <span className="font-mono">{client.minutesUsed || 0}</span>
                        <span className="text-gray-300 mx-1">/</span>
                        <span className="font-mono">{client.minute_limit}</span>
                        <span className="text-gray-400 ml-1 text-xs">min</span>
                      </div>
                      <div className="usage-bar-bg w-28">
                        <div className="usage-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                    {/* Agents */}
                    <td className="td text-gray-500">
                      {client.agentCount != null ? `${client.agentCount} agent${client.agentCount !== 1 ? 's' : ''}` : '—'}
                    </td>
                    {/* Status */}
                    <td className="td">
                      {client.status === 'active' ? (
                        <span className="badge-active">
                          <span className="status-dot" />
                          Active
                        </span>
                      ) : client.status === 'suspended' ? (
                        <span className="badge-suspended">Suspended</span>
                      ) : (
                        <span className="badge-inactive">Inactive</span>
                      )}
                    </td>
                    {/* Last synced */}
                    <td className="td text-gray-400 text-xs">Never</td>
                    {/* Actions */}
                    <td className="td">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => fetch(`/api/clients/${client.id}/sync`, { method: 'POST' })}
                          className="btn-ghost"
                          title="Sync"
                        >
                          <RefreshCw size={13} />
                        </button>
                        <button
                          onClick={() => toggleStatus(client.id, client.status)}
                          className={client.status === 'active' ? 'btn-ghost text-red-400 hover:bg-red-50 hover:text-red-500' : 'btn-ghost text-emerald-500 hover:bg-emerald-50'}
                        >
                          {client.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button className="btn-ghost">
                          <Pencil size={13} />
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h2 className="modal-title">Add New Client</h2>
            <p className="modal-sub">Create a client account and portal access.</p>
            <div className="space-y-4">
              <div>
                <label className="input-label">Business Name</label>
                <input className="input" placeholder="e.g. Smith Law Firm" value={newClient.name} onChange={e => setNewClient(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="input-label">Email Address</label>
                <input className="input" type="email" placeholder="client@example.com" value={newClient.email} onChange={e => setNewClient(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label className="input-label">Package</label>
                <select className="input" value={newClient.minute_limit} onChange={e => setNewClient(p => ({ ...p, minute_limit: Number(e.target.value) }))}>
                  <option value={300}>Always Answered — 300 min/mo ($397)</option>
                  <option value={600}>Intake & Convert — 600 min/mo ($647)</option>
                  <option value={1200}>Full AI Front Desk — 1,200 min/mo ($1,097)</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button onClick={handleAdd} disabled={loading || !newClient.name || !newClient.email} className="btn-primary flex-1 justify-center">
                  {loading ? 'Creating…' : 'Create Client'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
