// ============================================
// API CLIENT (lib/api/interviews.ts)
// ============================================
import { ApplicationWithDetails, InterviewWithDetails, AvailableSlot, InterviewBooking, CreateInterviewRequest, InterviewStatus } from '@/app/types/interview';

export class InterviewAPI {
  private static async fetchAPI<T>(
    url: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  static async getApplications(status?: string): Promise<ApplicationWithDetails[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    
    return this.fetchAPI<ApplicationWithDetails[]>(
      `/api/applications?${params.toString()}`
    );
  }

  static async getInterviews(status?: InterviewStatus): Promise<InterviewWithDetails[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    
    return this.fetchAPI<InterviewWithDetails[]>(
      `/api/interviews?${params.toString()}`
    );
  }

  static async getAvailableSlots(
    recruiterId: string,
    date: string
  ): Promise<AvailableSlot[]> {
    const params = new URLSearchParams({ recruiterId, date });
    return this.fetchAPI<AvailableSlot[]>(
      `/api/interviews/available-slots?${params.toString()}`
    );
  }

  static async createInterview(
    data: CreateInterviewRequest
  ): Promise<InterviewBooking> {
    return this.fetchAPI<InterviewBooking>('/api/interviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateInterview(
    id: string,
    data: Partial<InterviewBooking>
  ): Promise<InterviewBooking> {
    return this.fetchAPI<InterviewBooking>(`/api/interviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static async cancelInterview(id: string): Promise<{ message: string }> {
    return this.fetchAPI<{ message: string }>(`/api/interviews/${id}`, {
      method: 'DELETE',
    });
  }
}