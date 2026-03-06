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
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td data-label="ID" style={{padding:'8px', fontFamily:'monospace', fontSize:'0.8rem'}}>{r.id.slice(0,8)}...</td>
                <td data-label="Type" style={{padding:'8px'}}>{r.issueType}</td>
                <td data-label="Description" style={{padding:'8px'}}>{r.description.length > 80 ? r.description.slice(0,80) + '...' : r.description}</td>
                <td data-label="Status" style={{padding:'8px'}}><span style={badgeStyle[r.status]}>{r.status}</span></td>
                <td data-label="Created" style={{padding:'8px'}}>{new Date(r.createdAt).toLocaleDateString()}</td>
                <td data-label="Approved" style={{padding:'8px'}}>{r.approvedAt ? new Date(r.approvedAt).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

}