import { useState } from 'react'

import type { ScheduleTask, ScheduleWhen } from '../api/schedule'
import { useSchedules } from '../hooks/useSchedules'
import { formatRelativeTime } from '../lib/intl'

function cadence(when: ScheduleWhen): string {
  switch (when.kind) {
    case 'at':
      return `at ${when.at}`
    case 'every':
      return `every ${when.every}`
    case 'cron':
      return `cron ${when.cron}`
  }
}

const STATUS_BADGE: Record<'ok' | 'absent' | 'invalid', { label: string; cls: string }> = {
  ok: { label: 'scheduled', cls: 'bg-emerald-500/15 text-emerald-400' },
  absent: { label: 'no schedule', cls: 'bg-white/5 text-muted' },
  invalid: { label: 'invalid file', cls: 'bg-red-500/15 text-red-400' },
}

function fmtTime(ms: number | null): string {
  return ms == null ? '—' : formatRelativeTime(ms)
}

/**
 * Schedules dashboard — read-only view of GET /api/schedule. Each workspace
 * declares its own `.alice/schedule.json` (the agent writes it; a scanner fires
 * due tasks as headless runs); there is no central registry and nothing to
 * create here. Shows what's scheduled across workspaces + when each next runs.
 * Low-frequency passive surface → simple polling.
 */
export function AutomationSchedulesSection() {
  const { snapshot, error, loading } = useSchedules()
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggle = (wsId: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(wsId)) next.delete(wsId)
      else next.add(wsId)
      return next
    })

  // Once we have any snapshot (incl. the warm cache), keep showing it rather
  // than flipping to an error/loading state on a transient refresh failure.
  if (!snapshot) {
    if (loading) return <div className="text-sm text-muted">Loading…</div>
    return <div className="text-sm text-red-400">Failed to load schedules: {error}</div>
  }

  // A workspace with no schedule file is noise on this surface — only show the
  // ones that declared something (or whose file is broken and needs attention).
  const rows = snapshot.workspaces.filter((w) => w.status !== 'absent')

  // We keep showing the (possibly stale) snapshot on a failed refresh, but say so
  // rather than going silently stale.
  const staleBanner = error ? (
    <div className="rounded border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-400">
      Live refresh failing — showing the last known schedule.
    </div>
  ) : null

  if (rows.length === 0) {
    return (
      <div className="space-y-3">
        {staleBanner}
        <div className="max-w-prose text-sm text-muted">
          No workspace has scheduled anything yet. A workspace schedules itself by
          writing <code className="text-xs">.alice/schedule.json</code> in its own
          checkout — see the <span className="text-text">API</span> tab for the format.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {staleBanner}
      {rows.map((ws) => {
        const isOpen = expanded.has(ws.wsId)
        const badge = STATUS_BADGE[ws.status]
        return (
          <div key={ws.wsId} className="rounded border border-border">
            <button
              type="button"
              onClick={() => toggle(ws.wsId)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left"
            >
              <span className="text-xs text-muted">{isOpen ? '▾' : '▸'}</span>
              <span className="font-medium">{ws.tag}</span>
              <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${badge.cls}`}>
                {badge.label}
              </span>
              {ws.status === 'ok' && (
                <span className="text-xs text-muted">
                  {ws.tasks.length} task{ws.tasks.length === 1 ? '' : 's'}
                </span>
              )}
              <span className="ml-auto font-mono text-xs text-muted">{ws.wsId.slice(0, 8)}</span>
            </button>

            {isOpen && ws.status === 'invalid' && (
              <div className="border-t border-border px-3 py-2 text-xs text-red-400">
                {ws.error ?? 'schedule file is invalid'}
              </div>
            )}

            {isOpen && ws.status === 'ok' && (
              <div className="overflow-auto border-t border-border">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted">
                      <th className="py-1.5 pl-3 pr-4 font-medium">Task</th>
                      <th className="py-1.5 pr-4 font-medium">Cadence</th>
                      <th className="py-1.5 pr-4 font-medium">What</th>
                      <th className="py-1.5 pr-4 font-medium">Last run</th>
                      <th className="py-1.5 pr-4 font-medium">Next due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ws.tasks.map((t: ScheduleTask) => (
                      <tr
                        key={t.id}
                        className={`border-b border-border/50 align-top ${t.enabled ? '' : 'opacity-50'}`}
                      >
                        <td className="py-1.5 pl-3 pr-4 font-mono text-xs">
                          {t.id}
                          {!t.enabled && <span className="ml-1 text-muted">(off)</span>}
                        </td>
                        <td className="whitespace-nowrap py-1.5 pr-4 font-mono text-xs text-muted">
                          {cadence(t.when)}
                        </td>
                        <td className="max-w-md py-1.5 pr-4">
                          <span className="line-clamp-2 text-xs text-muted">{t.what}</span>
                        </td>
                        <td className="whitespace-nowrap py-1.5 pr-4 text-xs text-muted">
                          {fmtTime(t.lastFiredAtMs)}
                        </td>
                        <td className="whitespace-nowrap py-1.5 pr-4 text-xs text-muted">
                          {t.enabled ? fmtTime(t.nextDueAtMs) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
