import { useEffect, useState } from 'react';
import { Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Report } from '../types/Report';

export function ReportDetailsPage() {
  const navigate = useNavigate();
  const { userEmail } = useAuth();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const backPath = location.pathname.startsWith('/reports/') ? '/reports' : '/my-reports';

  if (!userEmail) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError('');

        if (!id) {
          setError('Missing report id.');
          return;
        }

        const data = await apiClient.getReportById(id);
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load report.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) return <div className="page"><p>Loading report...</p></div>;
  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;
  if (!report) return <div className="page"><p>Report not found.</p></div>;

  const attachmentHref = report.attachmentUrl
  ? report.attachmentUrl.startsWith('http')
    ? report.attachmentUrl
    : `http://localhost:4000${report.attachmentUrl}`
  : '';

  return (
    <div className="page">
      <h1>Report Details</h1>

      <div className="card">
        <p><strong>ID:</strong> {report.id}</p>
        <p><strong>Issue Type:</strong> {report.issueType}</p>
        <p><strong>Description:</strong> {report.description}</p>
        <p><strong>Contact Name:</strong> {report.contactName}</p>
        <p><strong>Contact Email:</strong> {report.contactEmail}</p>
        <p><strong>Status:</strong> {report.status}</p>
        <p><strong>Created At:</strong> {new Date(report.createdAt).toLocaleString()}</p>
        <p><strong>Approved At:</strong> {report.approvedAt ? new Date(report.approvedAt).toLocaleString() : '—'}</p>

        {report.attachmentUrl && (
          <p>
            <strong>Attachment:</strong>{' '}
            <a href={attachmentHref} target="_blank" rel="noreferrer">
              Open attachment
            </a>
          </p>
        )}
      </div>
      <button className="btn btn-secondary" onClick={() => navigate(backPath)}>
        ← Back
      </button>
        
    </div>
  );
}