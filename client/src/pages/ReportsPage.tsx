import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Report } from '../types/Report';

// appearence of reports according to the status
const statusStyle: Record<string, React.CSSProperties> = {
  NEW:      { background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 500 },
  APPROVED: { background: '#fef9c3', color: '#854d0e', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 500 },
  RESOLVED: { background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 500 },
};


export function ReportsPage() {
  const {userEmail, userStatus} = useAuth();
  if (!userEmail){
    return <Navigate to="/login" replace />;
  }
  if (userStatus !== 'admin'){
    return <Navigate to="/my-reports" replace />;
  }

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState('');


  const fetchReports = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await apiClient.getReports();
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchReports(); 
  }, [fetchReports]);

  const updateReport = (updated: Report) =>
    setReports(prev => prev.map(r => r.id === updated.id ? updated : r));

  const handleApprove = async (id: string) => {
    setActionLoading(prev => ({ ...prev, [id]: 'approving' }));
    try {
      const updated = await apiClient.approveReport(id);
      updateReport(updated);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Approve failed.');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleResolve = async (id: string) => {
    setActionLoading(prev => ({ ...prev, [id]: 'resolving' }));
    try {
      const updated = await apiClient.resolveReport(id);
      updateReport(updated);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Resolve failed.');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: '' }));
    }
  };

  if (loading) return <div className="page"><p>Loading reports...</p></div>;
  if (error) return (
    <div className="page">
      <div className="alert alert-error">{error}</div>
      <button className="btn btn-secondary" onClick={fetchReports}>Retry</button>
    </div>
  );
  if (reports.length === 0) return <div className="page"><p>No reports found.</p></div>;




  return (
    <div className="page">
      <h1>Reports List</h1>
      {actionError && (
        <div className="alert alert-error" style={{display:'flex',justifyContent:'space-between'}}>
          {actionError}
          <button onClick={() => setActionError('')} style={{background:'none',border:'none',cursor:'pointer',fontWeight:'bold'}}>×</button>
        </div>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
              <th style={{padding:'8px'}}>ID</th>
              <th style={{padding:'8px'}}>Type</th>
              <th style={{padding:'8px'}}>Description</th>
              <th style={{padding:'8px'}}>Reporter</th>
              <th style={{padding:'8px'}}>Status</th>
              <th style={{padding:'8px'}}>Created</th>
              <th style={{padding:'8px'}}>Approved</th>
              <th style={{padding:'8px'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td data-label="ID" style={{padding:'8px', fontFamily:'monospace', fontSize:'0.8rem'}}>{r.id.slice(0,8)}...</td>
                <td data-label="Type" style={{padding:'8px'}}>{r.issueType}</td>
                <td data-label="Description" style={{padding:'8px'}}>{r.description.length > 80 ? r.description.slice(0,80) + '...' : r.description}</td>
                <td data-label="Reporter" style={{padding:'8px'}}>
                  <div>{r.contactName}</div>
                  <div style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>{r.contactEmail}</div>
                </td>
                <td data-label="Status" style={{padding:'8px'}}><span style={statusStyle[r.status]}>{r.status}</span></td>
                <td data-label="Created" style={{padding:'8px'}}>{new Date(r.createdAt).toLocaleDateString()}</td>
                <td data-label="Approved" style={{padding:'8px'}}>{r.approvedAt ? new Date(r.approvedAt).toLocaleDateString() : '—'}</td>
                <td data-label="Actions" style={{padding:'8px', display:'flex', gap:'4px', flexWrap:'wrap'}}>
                  {r.status === 'NEW' && (
                    <button
                      className="btn btn-primary"
                      style={{fontSize:'0.8rem', padding:'4px 10px'}}
                      disabled={!!actionLoading[r.id]}
                      onClick={() => handleApprove(r.id)}
                    >
                      {actionLoading[r.id] === 'approving' ? '...' : 'Approve'}
                    </button>
                  )}
                  {r.status !== 'RESOLVED' && (
                    <button
                      className="btn btn-secondary"
                      style={{fontSize:'0.8rem', padding:'4px 10px'}}
                      disabled={!!actionLoading[r.id]}
                      onClick={() => handleResolve(r.id)}
                    >
                      {actionLoading[r.id] === 'resolving' ? '...' : 'Resolve'}
                    </button>
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