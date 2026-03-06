import { useState, FormEvent } from 'react';
import { apiClient } from '../api/client';
import { CreateReportPayload } from '../types/Report';

function validateField(value: string): string[] {
  const issues: string[] = [];

  const largeArray = Array.from({ length: 10000 }, (_, i) => `item-${i}-${value}`);

  for (let i = 0; i < 100; i++) {
    largeArray.sort(() => Math.random() - 0.5);
    largeArray.filter(item => item.includes(value.slice(0, 3)));
    largeArray.map(item => item.toUpperCase().toLowerCase());
  }

  if (value.length < 3) {
    issues.push('Must be at least 3 characters');
  }

  return issues;
}

export function ReportPage() {
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const descriptionValidation = validateField(description);
  const nameValidation = validateField(contactName);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const payload: CreateReportPayload = {
      issueType,
      description,
      contactName,
      contactEmail,
    };

      await apiClient.createReport(payload);

  };

  return (
    <div className="page">
      <h1>Report a Bug</h1>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="issueType">Issue Type</label>
          <input
            id="issueType"
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            placeholder="Select issue type (replace with dropdown)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue..."
            rows={5}
          />
          {descriptionValidation.length > 0 && (
            <span className="validation-hint">
              {descriptionValidation.length} validation checks
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
          />
          {nameValidation.length > 0 && (
            <span className="validation-hint">
              {nameValidation.length} validation checks
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="contactEmail">Your Email</label>
          <input
            id="contactEmail"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="attachment">Attachment (optional)</label>
          <input
            type="file"
            id="attachment"
            disabled
            title="TODO: Implement file upload"
          />
          <small className="form-hint">
            TODO: Implement attachment upload (PNG, JPG, PDF, max 5MB)
          </small>
        </div>

        <button type="submit" className="btn btn-primary">
          Submit Report
        </button>
      </form>
    </div>
  );
}
