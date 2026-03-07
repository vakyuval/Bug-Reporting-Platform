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
  const { userEmail} = useAuth();
  if (!userEmail){
    return <Navigate to="/login" replace />;
  }
  const navigate = useNavigate();
  const [ reports, setReports] = useState<Report[]>([]);
  const [loading, setLoadig] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoadig(true);
    setError('');
    try {
      const allReports = await apiClient.getReportsByEmail(userEmail);
      setReports(allReports);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports.');
    } finally{
      setLoadig(false);
    }

  }, [userEmail]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    const confirmed = window.confirm('Are you sure you want to delete this report?');
    if (!confirmed) return;

    try {
      setDeleteLoadingId(id);

      // make sure this exists in apiClient + backend
      await apiClient.deleteReport(id);

      setReports((prev) => prev.filter((report) => report.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete report.');
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
    <div className="page">
      <p>You haven't submitted any reports yet.</p>
      <button className="btn btn-primary" onClick={() => navigate('/report')}>Submit one</button>
    </div>
  );

  return (
    <div className="page">
      <h1>My Reports</h1>
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
                onClick={() => navigate(`/my-reports/${r.id}`)}
                style={{
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                }}
              >
                <td data-label="ID" style={{padding:'8px', fontFamily:'monospace', fontSize:'0.8rem'}}>{r.id.slice(0,8)}...</td>
                <td data-label="Type" style={{padding:'8px'}}>{r.issueType}</td>
                <td data-label="Description" style={{padding:'8px'}}>{r.description.length > 80 ? r.description.slice(0,80) + '...' : r.description}</td>
                <td data-label="Status" style={{padding:'8px'}}><span style={badgeStyle[r.status]}>{r.status}</span></td>
                <td data-label="CreatedAt" style={{padding:'8px'}}>{new Date(r.createdAt).toLocaleDateString()}</td>
                <td data-label="ApprovedAt" style={{padding:'8px'}}>{r.approvedAt ? new Date(r.approvedAt).toLocaleDateString() : '—'}</td>
                <td data-label="Actions" style={{padding:'8px', display:'flex', gap:'4px', flexWrap:'wrap'}}>
                  {r.status === 'NEW' && (
                    <>
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/my-reports/${r.id}`);
                      }}
                    >
                      View
                    </button>

                    <button
                      className="btn btn-secondary"
                      style={{
                        fontSize: '0.8rem',
                        padding: '4px 10px',
                        background: 'var(--danger)',
                      }}
                      onClick={(e) => handleDelete(e, r.id)}
                      disabled={deleteLoadingId === r.id}
                    >
                      {deleteLoadingId === r.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </>
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