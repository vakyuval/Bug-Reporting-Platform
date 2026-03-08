import { useState, useEffect, useCallback } from 'react';
import { Navigate, useNavigate} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Report } from '../types/Report';

const badgeStyle: Record<string, React.CSSProperties> = {
  NEW:      { background:'#dbeafe', color:'#1d4ed8', padding:'2px 8px', borderRadius:'12px', fontSize:'0.8rem', fontWeight:500 },
  APPROVED: { background:'#fef9c3', color:'#854d0e', padding:'2px 8px', borderRadius:'12px', fontSize:'0.8rem', fontWeight:500 },
  RESOLVED: { background:'#dcfce7', color:'#166534', padding:'2px 8px', borderRadius:'12px', fontSize:'0.8rem', fontWeight:500 },
};

export function MyReportsPage(){
  const { userEmail } = useAuth();
  const navigate = useNavigate();

  // All hooks before any early return (Rules of Hooks)
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');
  // ID of report pending confirmation — shows inline confirm UI instead of window.confirm
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    if (!userEmail) return;
    setLoading(true);
    setError('');
    try {
      const allReports = await apiClient.getReportsByEmail(userEmail);
      setReports(allReports);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  // Auth guard — after all hooks
  if (!userEmail) {
    return <Navigate to="/login" replace />;
  }

  const handleDeleteConfirmed = async (id: string) => {
    setConfirmDeleteId(null);
    setDeleteError('');
    try {
      setDeleteLoadingId(id);
      await apiClient.deleteReport(id);
      // Remove from local state immediately — no need to re-fetch
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete report.');
    } finally {
      setDeleteLoadingId(null);
    }
  };

  if (loading) return <div className="page"><p>Loading your reports...</p></div>;
  if (error) return (
    <div className="page">
      <div className="alert alert-error">{error}</div>
      <button className="btn btn-secondary" onClick={fetchReports}>Retry</button>
    </div>
  );
  if (reports.length === 0) return (
    <div className="report-page">
      <p>You haven't submitted any reports yet.</p>
      <button className="btn btn-primary" onClick={() => navigate('/report')}>Submit one</button>
    </div>
  );

  return (
    <div className="report-page">
      <h1>My Reports</h1>

      {/* Delete error — inline, doesn't hide the table */}
      {deleteError && (
        <div className="alert alert-error" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span>{deleteError}</span>
          <button
            onClick={() => setDeleteError('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', color: 'inherit' }}
          >
            ×
          </button>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
              <th style={{padding:'8px'}}>ID</th>
              <th style={{padding:'8px'}}>Type</th>
              <th style={{padding:'8px'}}>Description</th>
              <th style={{padding:'8px'}}>Status</th>
              <th style={{padding:'8px'}}>Created</th>
              <th style={{padding:'8px'}}>Approved</th>
              <th style={{padding:'8px'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr
                key={r.id}
                onClick={() => {
                  if (confirmDeleteId === r.id) return;
                  navigate(`/my-reports/${r.id}`);
                }}
                style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
              >
                <td data-label="ID" style={{padding:'8px', fontFamily:'monospace', fontSize:'0.8rem'}}>{r.id.slice(0,8)}...</td>
                <td data-label="Type" style={{padding:'8px'}}>{r.issueType}</td>
                <td data-label="Description" style={{padding:'8px'}}>{r.description.length > 80 ? r.description.slice(0,80) + '...' : r.description}</td>
                <td data-label="Status" style={{padding:'8px'}}><span style={badgeStyle[r.status]}>{r.status}</span></td>
                <td data-label="CreatedAt" style={{ padding: '8px' }}>
                  {new Date(r.createdAt).toLocaleString([], {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </td>
                <td data-label="ApprovedAt" style={{padding:'8px'}}>{r.approvedAt ? new Date(r.approvedAt).toLocaleDateString() : '—'}</td>
                <td data-label="Actions" style={{padding:'8px'}} onClick={e => e.stopPropagation()}>
                  {confirmDeleteId === r.id ? (
                    // Inline confirm row — no window.confirm needed
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Delete?</span>
                      <button
                        className="btn"
                        style={{ fontSize: '0.78rem', padding: '3px 10px', background: 'var(--danger)', color: 'white', border: 'none' }}
                        onClick={() => handleDeleteConfirmed(r.id)}
                        disabled={deleteLoadingId === r.id}
                      >
                        {deleteLoadingId === r.id ? 'Deleting...' : 'Yes'}
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: '0.78rem', padding: '3px 10px' }}
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                        onClick={() => navigate(`/my-reports/${r.id}`)}
                      >
                        View
                      </button>
                      {r.status === 'NEW' && (
                        <button
                          className="btn btn-secondary"
                          style={{ fontSize: '0.8rem', padding: '4px 10px', background: 'var(--danger)', color: 'white' }}
                          onClick={() => setConfirmDeleteId(r.id)}
                          disabled={deleteLoadingId === r.id}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}