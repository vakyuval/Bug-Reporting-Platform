export function ReportsPage() {

  return (
    <div className="page">
      <h1>Reports List</h1>

      <p className="placeholder-text">
        <strong>Admin Only:</strong> This page should only be accessible to admin users.
      </p>

      <p className="placeholder-text">
        TODO: Implement reports list with loading, error, and empty states.
      </p>

      <button className="btn btn-secondary" disabled>
        Load Reports
      </button>

      <div className="placeholder-box">
        <p>Reports will be displayed here.</p>
        <p>Each report should show:</p>
        <ul>
          <li>Issue type and description</li>
          <li>Contact name and email</li>
          <li>Status (NEW / APPROVED / RESOLVED)</li>
          <li>Created date</li>
          <li>Approved date (if applicable)</li>
          <li>Attachment link</li>
          <li>Action buttons (Approve / Resolve)</li>
        </ul>
      </div>
    </div>
  );
}
