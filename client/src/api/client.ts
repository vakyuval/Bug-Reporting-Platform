import { Report, CreateReportPayload } from '../types/Report';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

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

  async getReports(): Promise<Report[]> {
    return this.request<Report[]>('/api/reports');
  }

  async createReport(payload: CreateReportPayload): Promise<Report> {
    return this.request<Report>('/api/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
