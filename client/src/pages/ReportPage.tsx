import { useState, FormEvent, useRef, useEffect} from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { CreateReportPayload } from '../types/Report';
import { useAuth } from '../context/AuthContext';
import { validateEmail } from './LoginPage';

const ISSUE_TYPES = ['Bug', 'Feature Request', 'Improvement', 'Documentation', 'Other'];
const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const supportsScreenCapture = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
};

export function ReportPage() {
  const { userEmail } = useAuth();
  // return to login if not connected
  if (!userEmail){
    return <Navigate to="/login" replace />;
  }
  const navigate = useNavigate();
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

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    setContactEmail(userEmail);
  }, [userEmail]);

  useEffect(() => {
    return () => {
      if (screenshotPreview.startsWith('blob:')) {
        URL.revokeObjectURL(screenshotPreview);
      }
    };
  }, [screenshotPreview]);


  // checking all fields before submiting the report
  const errors: Record<string, string> = {};
  if (touched.issueType && !issueType) {
    errors.issueType = 'Please select an issue type.';
  }
  if (touched.description && description.trim().length < 10) {
    errors.description = 'Must be at least 10 characters.';
  }
  if (touched.contactName && contactName.trim().length < 3) {
    errors.contactName = 'Must be at least 3 characters.';
  }
  if (touched.contactEmail && !validateEmail(contactEmail)) {
    errors.contactEmail = 'Please enter a valid email.';
  }

  const touch = (field: string) => setTouched(t => ({ ...t, [field]: true }));

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearAttachmentState = () => {
    if (screenshotPreview.startsWith('blob:')) {
      URL.revokeObjectURL(screenshotPreview);
    }

    setAttachment(null);
    setScreenshotPreview('');
    setAttachmentError('');
    resetFileInput();
  };

  const validateAndSetFile = (file: File | null) => {
    if (!file) {
      setAttachment(null);
      setAttachmentError('');
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setAttachmentError('Only PNG, JPG, and PDF files are allowed.');
      setAttachment(null);
      resetFileInput();
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setAttachmentError('File must be under 5MB.');
      setAttachment(null);
      resetFileInput();
      return;
    }

    setAttachment(file);
    setAttachmentError('');
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    if (screenshotPreview.startsWith('blob:')) {
      URL.revokeObjectURL(screenshotPreview);
      setScreenshotPreview('');
    }

    validateAndSetFile(file);
  };

  const handleCaptureScreenshot = async () => {
    if (!supportsScreenCapture()) {
      setAttachmentError('Screen capture is not supported in this browser.');
      return;
    }

    setCapturingScreenshot(true);
    setAttachmentError('');
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) {
        stream.getTracks().forEach((track) => track.stop());
        setAttachmentError('Screenshot tools are not available.');
        setCapturingScreenshot(false);
        return;
      }

      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;

      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => resolve();
      });

      await video.play();

      // Small delay so the first painted frame is available
      await new Promise((resolve) => setTimeout(resolve, 250));

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        stream.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
        setAttachmentError('Failed to prepare screenshot canvas.');
        setCapturingScreenshot(false);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      stream.getTracks().forEach((track) => track.stop());
      video.srcObject = null;

      canvas.toBlob((blob) => {
        if (!blob) {
          setAttachmentError('Failed to generate screenshot file.');
          setCapturingScreenshot(false);
          return;
        }

        const file = new File([blob], 'screenshot.png', { type: 'image/png' });

        if (screenshotPreview.startsWith('blob:')) {
          URL.revokeObjectURL(screenshotPreview);
        }

        setAttachment(file);
        setScreenshotPreview(URL.createObjectURL(blob));
        setAttachmentError('');
        resetFileInput();
        setCapturingScreenshot(false);
      }, 'image/png');
    } catch (err) {
      if (
        err instanceof DOMException &&
        (err.name === 'NotAllowedError' || err.name === 'AbortError')
      ) {
        // User cancelled screen capture — this is not a real validation error
        setAttachmentError('');
      } else {
        setAttachmentError('Failed to capture screenshot. Please try again.');
      }

      setCapturingScreenshot(false);
    }
  };

  const handleRemoveScreenshot = () => {
    clearAttachmentState();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setTouched({
      issueType: true,
      description: true,
      contactName: true,
      contactEmail: true,
    });

    const hasValidationErrors =
      !issueType ||
      description.trim().length < 10 ||
      contactName.trim().length < 3 ||
      !validateEmail(contactEmail) ||
      !!attachmentError;

    if (hasValidationErrors) {
      return;
    }

    setSubmitting(true);
    setSubmitSuccess('');
    setSubmitError('');

    try {
      const payload: CreateReportPayload = {
        issueType,
        description: description.trim(),
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        attachment: attachment ?? undefined,
      };

      const report = await apiClient.createReportWithFile(payload);

      setSubmitSuccess(`Report submitted successfully! ID: ${report.id}`);
      setIssueType('');
      setDescription('');
      setContactName('');
      setContactEmail(userEmail);
      setTouched({});
      clearAttachmentState();
      setTimeout(() => {
        navigate('/my-reports');
      }, 1000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled =
    submitting ||
    !issueType ||
    !description.trim() ||
    !contactName.trim() ||
    !contactEmail.trim() ||
    !!attachmentError ||
    capturingScreenshot;

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
            color-scheme="light"
          >
            <option value="">Select issue type...</option>
            {ISSUE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.issueType && (
            <span className="validation-hint" style={{ color: 'var(--danger)' }}>
              {errors.issueType}
            </span>
          )}
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
          {errors.description && (
            <span className="validation-hint" style={{ color: 'var(--danger)' }}>
              {errors.description}
            </span>
          )}
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
          {errors.contactName && (
            <span className="validation-hint" style={{ color: 'var(--danger)' }}>
              {errors.contactName}
            </span>
          )}
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
          {errors.contactEmail && (
            <span className="validation-hint" style={{ color: 'var(--danger)' }}>
              {errors.contactEmail}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="attachment">Attachment (optional)</label>

          {supportsScreenCapture() && (
            <button
              type="button"
              className="btn btn-secondary"
              disabled={!!attachment || capturingScreenshot}
              onClick={handleCaptureScreenshot}
              style={{ marginBottom: '0.5rem' }}
            >
              {capturingScreenshot ? 'Capturing...' : '📸 Capture Screenshot'}
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            id="attachment"
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={handleFileChange}
            disabled={!!screenshotPreview || capturingScreenshot}
          />

          {attachment && (
            <small className="form-hint" style={{ display: 'block', marginTop: '0.5rem' }}>
              Selected file: {attachment.name}
            </small>
          )}

          {screenshotPreview && (
            <div style={{ marginTop: '0.75rem' }}>
              <img
                src={screenshotPreview}
                alt="Screenshot preview"
                style={{
                  maxWidth: '200px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  display: 'block',
                }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleRemoveScreenshot}
                style={{ marginTop: '0.5rem', marginLeft: 0 }}
              >
                Remove Screenshot
              </button>
            </div>
          )}

          {attachmentError && (
            <span className="validation-hint" style={{ color: 'var(--danger)' }}>
              {attachmentError}
            </span>
          )}

          <small className="form-hint">PNG, JPG, or PDF — max 5MB</small>
        </div>

        <button type="submit" className="btn btn-primary" disabled={isDisabled}>
          {submitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <video ref={videoRef} style={{ display: 'none' }} />
    </div>
  );
}