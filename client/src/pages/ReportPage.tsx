import { useState, FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { CreateReportPayload } from '../types/Report';
import { useAuth } from '../context/AuthContext';
import { validateEmail } from './LoginPage';

const ISSUE_TYPES = ['Bug', 'Feature Request', 'Improvement', 'Documentation', 'Other'];
const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;


export function ReportPage() {
  const { userEmail } = useAuth();
  // return to login if not connected
  if (!userEmail){
    return <Navigate to="/login" replace />;
  }

  // Form fields that user should provide
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  // UI states
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attachmentError, setAttachmentError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [capturingScreenshot, setCapturingScreenshot] = useState(false);

  // checking all fields before submiting the report
  const errors: Record<string, string> = {};
  if (touched.issueType && !issueType) errors.issueType = 'Please select an issue type.';
  if (touched.description && description.trim().length < 10) errors.description = 'Must be at least 10 characters.';
  if (touched.contactName && contactName.trim().length < 3) errors.contactName = 'Must be at least 3 characters.';
  if (touched.contactEmail && !validateEmail(contactEmail)) errors.contactEmail = 'Please enter a valid email.';

  const touch = (field: string) => setTouched(t => ({ ...t, [field]: true }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) { setAttachment(null); setAttachmentError(''); return; }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setAttachmentError('Only PNG, JPG, and PDF files are allowed.');
      setAttachment(null); e.target.value = '';
    } else if (file.size > MAX_FILE_SIZE) {
      setAttachmentError('File must be under 5MB.');
      setAttachment(null); e.target.value = '';
    } else {
      setAttachment(file); setAttachmentError('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setTouched({ issueType: true, description: true, contactName: true, contactEmail: true });
    if (!issueType || description.trim().length < 10 || contactName.trim().length < 3 || !validateEmail(contactEmail)) return;
    setSubmitting(true); setSubmitSuccess(''); setSubmitError('');

    try {
      const payload: CreateReportPayload = { issueType, description, contactName, contactEmail, attachment: attachment ?? undefined };
      const report = await apiClient.createReportWithFile(payload);
      setSubmitSuccess(`Report submitted successfully! ID: ${report.id}`);
      setIssueType(''); setDescription(''); setContactName(''); setContactEmail(userEmail);
      setAttachment(null); setTouched({}); setScreenshotPreview('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = submitting || !issueType || !description || !contactName || !contactEmail;


  return (
    <div className="page">
      <h1>Report a Bug</h1>
      {submitSuccess && <div className="alert alert-success">{submitSuccess}</div>}
      {submitError && <div className="alert alert-error">{submitError}</div>}
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="issueType">Issue Type</label>
          <select
            id="issueType"
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            onBlur={() => touch('issueType')}
          >
            <option value="">Select issue type...</option>
            {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {errors.issueType && <span className="validation-hint" style={{color:'var(--danger)'}}>{errors.issueType}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue..."
            rows={5}
            onBlur={() => touch('description')}
          />
          {errors.description && <span className="validation-hint" style={{color:'var(--danger)'}}>{errors.description}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="contactName">Your Name</label>
          <input
            type="text"
            id="contactName"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Enter your name"
            onBlur={() => touch('contactName')}
          />
          {errors.contactName && <span className="validation-hint" style={{color:'var(--danger)'}}>{errors.contactName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="contactEmail">Your Email</label>
          <input
            type="email"
            id="contactEmail"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="Enter your email"
            onBlur={() => touch('contactEmail')}
          />
          {errors.contactEmail && <span className="validation-hint" style={{color:'var(--danger)'}}>{errors.contactEmail}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="attachment">Attachment (optional)</label>
          <input
            type="file"
            id="attachment"
            accept=".png,.jpg,.jpeg,.pdf"
            disabled
            onChange={handleFileChange}
          />
          {attachmentError && <span className="validation-hint" style={{color:'var(--danger)'}}>{attachmentError}</span>}
          <small className="form-hint">PNG, JPG, or PDF — max 5MB</small>
        </div>

        <button type="submit" className="btn btn-primary" disabled={isDisabled}>
          {submitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}
