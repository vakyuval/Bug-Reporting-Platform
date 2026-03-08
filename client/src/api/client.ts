import { Report, CreateReportPayload, Priority} from '../types/Report';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export interface CheckStatusResponse {
  status: 'allowed' | 'admin' | 'blacklisted';
  reason?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  // Generic request helper for all API calls
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // LOGIN API 

  // Sends the user's email and password to the backend
  // and checks whether the user is allowed, admin, or blacklisted.
  async checkStatus(email: string, password: string): Promise<CheckStatusResponse> {
    return this.request<CheckStatusResponse>('/api/check-status', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Sends a registration request to create a new user account
  async register(name: string, email: string, password: string): Promise<void> {
    return this.request('/api/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }


  // REPORT API 

  // Fetches all reports from the backend - used by admins to view the full reports list.
  async getReports(): Promise<Report[]> {
    return this.request<Report[]>('/api/reports');
  }

  // Fetches only the reports that belong to a specific email address.
  async getReportsByEmail(email: string): Promise<Report[]> {
    const query = `?email=${encodeURIComponent(email)}`;
    return this.request<Report[]>(`/api/reports${query}`);
  }

  // Sends a request to approve a report by its ID
  async approveReport(id: string): Promise<Report> {
    return this.request<Report>(`/api/reports/${id}/approve`, { method: 'POST' });
  }

  // Sends a request to mark a report as resolved.
  async resolveReport(id: string): Promise<Report> {
    return this.request<Report>(`/api/reports/${id}/resolve`, { method: 'POST' });
  }


  // Creates a new report
  async createReportWithFile(payload: CreateReportPayload): Promise<Report> {
    if (payload.attachment) {
      const formData = new FormData();
      formData.append('issueType', payload.issueType);
      formData.append('description', payload.description);
      formData.append('contactName', payload.contactName);
      formData.append('contactEmail', payload.contactEmail);
      formData.append('attachment', payload.attachment);
      const url = `${this.baseUrl}/api/reports`;
      const response = await fetch(url, { method: 'POST', body: formData });
      if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
      return response.json();
    }
    return this.request<Report>('/api/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Fetches a single report by its ID.
  async getReportById(id: string): Promise<Report>{
    return this.request<Report>(`/api/reports/${id}`);
  }

  // Deletes a report by its ID
  async deleteReport(id: string): Promise<void> {
    return this.request<void>(`/api/reports/${id}`, {
      method: 'DELETE',
    });
  }

  // ADMIN API

  // Updates the priority of a specific report
  async updatePriority(id: string, priority: Priority): Promise<Report> {
    return this.request<Report>(`/api/reports/${id}/priority`, {
      method: 'PATCH',
      body: JSON.stringify({ priority }),
    });
  }

  

}

export const apiClient = new ApiClient(API_BASE_URL);
