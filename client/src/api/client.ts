import { Report, CreateReportPayload } from '../types/Report';

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


  async checkStatus(email: string): Promise<CheckStatusResponse> {
    return this.request<CheckStatusResponse>('/api/check-status', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }


  async getReports(): Promise<Report[]> {
    return this.request<Report[]>('/api/reports');
  }

  async createReport(payload: CreateReportPayload): Promise<Report> {
    return this.request<Report>('/api/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getReportsByEmail(email: string): Promise<Report[]> {
    const query = `?email=${encodeURIComponent(email)}`;
    return this.request<Report[]>(`/api/reports${query}`);
  }

  async approveReport(id: string): Promise<Report> {
    return this.request<Report>(`/api/reports/${id}/approve`, { method: 'POST' });
  }

  async resolveReport(id: string): Promise<Report> {
    return this.request<Report>(`/api/reports/${id}/resolve`, { method: 'POST' });
  }

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


}

export const apiClient = new ApiClient(API_BASE_URL);
