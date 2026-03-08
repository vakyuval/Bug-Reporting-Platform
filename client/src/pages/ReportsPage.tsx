import { useState, useEffect, useCallback, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Report, Priority } from '../types/Report';

type StatusFilter   = 'ALL' | 'NEW' | 'APPROVED' | 'RESOLVED';
type PriorityFilter = 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type SortOrder      = 'newest' | 'oldest' | 'priority';

// Status badge styles 
const statusStyle: Record<Report['status'], React.CSSProperties> = {
  NEW:      { background: '#dbeafe', color: '#1d4ed8', padding: '2px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, display: 'inline-block' },
  APPROVED: { background: '#fef9c3', color: '#854d0e', padding: '2px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, display: 'inline-block' },
  RESOLVED: { background: '#dcfce7', color: '#166534', padding: '2px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, display: 'inline-block' },
};
const statusStyleDark: Record<Report['status'], React.CSSProperties> = {
  NEW:      { background: '#1e3a5f', color: '#60a5fa', padding: '2px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, display: 'inline-block' },
  APPROVED: { background: '#422006', color: '#fbbf24', padding: '2px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, display: 'inline-block' },
  RESOLVED: { background: '#14532d', color: '#4ade80', padding: '2px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, display: 'inline-block' },
};

// Priority 
const PRIORITY_CONFIG: Record<Priority, { label: string; emoji: string; color: string; bg: string; bgDark: string; colorDark: string; order: number }> = {
  CRITICAL: { label: 'Critical', emoji: '🔴', color: '#991b1b', bg: '#fee2e2', bgDark: '#450a0a', colorDark: '#fca5a5', order: 0 },
  HIGH:     { label: 'High',     emoji: '🟠', color: '#9a3412', bg: '#ffedd5', bgDark: '#431407', colorDark: '#fdba74', order: 1 },
  MEDIUM:   { label: 'Medium',   emoji: '🔵', color: '#1e40af', bg: '#eff6ff', bgDark: '#1e3a5f', colorDark: '#93c5fd', order: 2 },
  LOW:      { label: 'Low',      emoji: '🟢', color: '#166534', bg: '#dcfce7', bgDark: '#14532d', colorDark: '#4ade80', order: 3 },
};

const PRIORITIES: Priority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

function getStatusLabel(status: Report['status']) {
  switch (status) {
    case 'NEW':      return 'Open';
    case 'APPROVED': return 'In Progress';
    case 'RESOLVED': return 'Resolved';
    default:         return status;
  }
}

export function ReportsPage() {
  const { userEmail, userStatus } = useAuth();
  const navigate = useNavigate();

  // All hooks must be called before any early return (Rules of Hooks)
  const [reports,        setReports]        = useState<Report[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState('');
  const [actionLoading,  setActionLoading]  = useState<Record<string, string>>({});
  const [actionError,    setActionError]    = useState('');
  const [search,         setSearch]         = useState('');
  const [statusFilter,   setStatusFilter]   = useState<StatusFilter>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('ALL');
  const [sortOrder,      setSortOrder]      = useState<SortOrder>('newest');

  // Reactive dark mode — updates when user toggles the theme
  const [isDark, setIsDark] = useState(() => document.body.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.body.classList.contains('dark'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Auth guards — after all hooks
  if (!userEmail)             return <Navigate to="/login"      replace />;
  if (userStatus !== 'admin') return <Navigate to="/my-reports" replace />;

  
  const fetchReports = useCallback(async () => {
    setLoading(true); setError('');
    try {
      setReports(await apiClient.getReports());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const updateReport = (updated: Report) =>
    setReports(prev => prev.map(r => r.id === updated.id ? updated : r));

  // Actions 
  const handleApprove = async (id: string) => {
    setActionError('');
    setActionLoading(prev => ({ ...prev, [id]: 'approving' }));
    try { updateReport(await apiClient.approveReport(id)); }
    catch (err) { setActionError(err instanceof Error ? err.message : 'Failed.'); }
    finally { setActionLoading(prev => ({ ...prev, [id]: '' })); }
  };

  const handleResolve = async (id: string) => {
    setActionError('');
    setActionLoading(prev => ({ ...prev, [id]: 'resolving' }));
    try { updateReport(await apiClient.resolveReport(id)); }
    catch (err) { setActionError(err instanceof Error ? err.message : 'Failed.'); }
    finally { setActionLoading(prev => ({ ...prev, [id]: '' })); }
  };

  // Priority action
  const handlePriorityChange = async (id: string, priority: Priority) => {
    setActionError('');
    setActionLoading(prev => ({ ...prev, [id]: 'priority' }));
    try { updateReport(await apiClient.updatePriority(id, priority)); }
    catch (err) { setActionError(err instanceof Error ? err.message : 'Failed to update priority.'); }
    finally { setActionLoading(prev => ({ ...prev, [id]: '' })); }
  };

  // Filtered + sorted 
  const visibleReports = useMemo(() => {
    const q = search.trim().toLowerCase();
    let filtered = [...reports];

    if (statusFilter !== 'ALL')   filtered = filtered.filter(r => r.status === statusFilter);
    if (priorityFilter !== 'ALL') filtered = filtered.filter(r => r.priority === priorityFilter);
    if (q) filtered = filtered.filter(r =>
      r.id.toLowerCase().includes(q)          ||
      r.issueType.toLowerCase().includes(q)   ||
      r.description.toLowerCase().includes(q) ||
      r.contactName.toLowerCase().includes(q) ||
      r.contactEmail.toLowerCase().includes(q)
    );

    filtered.sort((a, b) => {
      if (sortOrder === 'priority') {
        // Sort by priority severity first, then newest within same priority
        const diff = PRIORITY_CONFIG[a.priority].order - PRIORITY_CONFIG[b.priority].order;
        return diff !== 0 ? diff : b.createdAt - a.createdAt;
      }
      return sortOrder === 'newest' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt;
    });

    return filtered;
  }, [reports, search, statusFilter, priorityFilter, sortOrder]);

  // Stats 
  const stats = useMemo(() => ({
    total:      reports.length,
    open:       reports.filter(r => r.status === 'NEW').length,
    inProgress: reports.filter(r => r.status === 'APPROVED').length,
    resolved:   reports.filter(r => r.status === 'RESOLVED').length,
    critical:   reports.filter(r => r.priority === 'CRITICAL' && r.status !== 'RESOLVED').length,
  }), [reports]);

  // Loading / error
  if (loading) return (
    <div className="page" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
      <p style={{ color: 'var(--text-muted)' }}>Loading reports...</p>
    </div>
  );

  if (error) return (
    <div className="page">
      <div className="alert alert-error">{error}</div>
      <button className="btn btn-secondary" onClick={fetchReports}>Retry</button>
    </div>
  );

  return (
    <div className="report-page">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Admin Reports</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Review, triage, and prioritize incoming submissions.
          </p>
        </div>
        <button className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }} onClick={fetchReports}>
          ↻ Refresh
        </button>
      </div>

      {/* Action error */}
      {actionError && (
        <div className="alert alert-error" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', color: 'inherit' }}>×</button>
        </div>
      )}

      {/* Stats cards — includes critical alert */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total',       value: stats.total,      color: 'var(--primary)' },
          { label: 'Open',        value: stats.open,       color: '#1d4ed8' },
          { label: 'In Progress', value: stats.inProgress, color: '#854d0e' },
          { label: 'Resolved',    value: stats.resolved,   color: '#166534' },
          { label: '🔴 Critical', value: stats.critical,   color: '#991b1b' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--bg)', border: `1px solid ${s.label === '🔴 Critical' && stats.critical > 0 ? '#fca5a5' : 'var(--border)'}`,
            borderRadius: 10, padding: '1rem 1.25rem',
          }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label htmlFor="report-search">Search</label>
          <input id="report-search" type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="ID, type, description, reporter..." />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label htmlFor="status-filter">Status</label>
          <select id="status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)}>
            <option value="ALL">All statuses</option>
            <option value="NEW">Open</option>
            <option value="APPROVED">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label htmlFor="priority-filter">Priority</label>
          <select id="priority-filter" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value as PriorityFilter)}>
            <option value="ALL">All priorities</option>
            {PRIORITIES.map(p => (
              <option key={p} value={p}>{PRIORITY_CONFIG[p].emoji} {PRIORITY_CONFIG[p].label}</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label htmlFor="sort-order">Sort by</label>
          <select id="sort-order" value={sortOrder} onChange={e => setSortOrder(e.target.value as SortOrder)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="priority">Priority (Critical first)</option>
          </select>
        </div>
      </div>

      {/* Empty state */}
      {visibleReports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
          <p>No reports match the current filters.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                {['ID', 'Type', 'Description', 'Reporter', 'Priority', 'Status', 'Created', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleReports.map(r => {
                const pc = PRIORITY_CONFIG[r.priority];
                const isActioning = !!actionLoading[r.id];
                return (
                  <tr
                    key={r.id}
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    {/* ID */}
                    <td data-label="ID" style={{ padding: '10px 8px', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {r.id.slice(0, 8)}...
                    </td>

                    {/* Type */}
                    <td data-label="Type" style={{ padding: '10px 8px' }}>{r.issueType}</td>

                    {/* Description */}
                    <td data-label="Description" style={{ padding: '10px 8px', maxWidth: 260 }}>
                      <div style={{ fontWeight: 500 }}>
                        {r.description.length > 90 ? r.description.slice(0, 90) + '…' : r.description}
                      </div>
                    </td>

                    {/* Reporter */}
                    <td data-label="Reporter" style={{ padding: '10px 8px' }}>
                      <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{r.contactName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{r.contactEmail}</div>
                    </td>

                    {/* Priority — inline dropdown for triage */}
                    <td data-label="Priority" style={{ padding: '10px 8px' }}>
                      <select
                        value={r.priority}
                        disabled={isActioning}
                        onChange={e => handlePriorityChange(r.id, e.target.value as Priority)}
                        style={{
                          background:   isDark ? pc.bgDark   : pc.bg,
                          color:        isDark ? pc.colorDark : pc.color,
                          border:       `1px solid ${isDark ? pc.colorDark : pc.color}`,
                          borderRadius: 20,
                          padding:      '3px 8px',
                          fontSize:     '0.75rem',
                          fontWeight:   600,
                          cursor:       'pointer',
                          appearance:   'none',
                          WebkitAppearance: 'none',
                          paddingRight: '1.5rem',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23666' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 6px center',
                          opacity: isActioning && actionLoading[r.id] === 'priority' ? 0.5 : 1,
                        }}
                      >
                        {PRIORITIES.map(p => (
                          <option key={p} value={p}>
                            {PRIORITY_CONFIG[p].emoji} {PRIORITY_CONFIG[p].label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Status badge */}
                    <td data-label="Status" style={{ padding: '10px 8px' }}>
                      <span style={isDark ? statusStyleDark[r.status] : statusStyle[r.status]}>
                        {getStatusLabel(r.status)}
                      </span>
                    </td>

                    {/* Created */}
                    <td data-label="Created" style={{ padding: '10px 8px', fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      <div>{new Date(r.createdAt).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.72rem', marginTop: 2 }}>
                        {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td data-label="Actions" style={{ padding: '10px 8px' }}>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                          onClick={() => navigate(`/reports/${r.id}`)}
                        >
                          View
                        </button>
                        {r.status === 'NEW' && (
                          <button
                            className="btn btn-primary"
                            style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                            disabled={isActioning}
                            onClick={() => handleApprove(r.id)}
                          >
                            {actionLoading[r.id] === 'approving' ? 'Updating...' : 'In Progress'}
                          </button>
                        )}
                        {r.status === 'APPROVED' && (
                          <button
                            className="btn btn-primary"
                            style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                            disabled={isActioning}
                            onClick={() => handleResolve(r.id)}
                          >
                            {actionLoading[r.id] === 'resolving' ? 'Updating...' : 'Resolve'}
                          </button>
                        )}
                        {r.status === 'RESOLVED' && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>✓ Done</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}