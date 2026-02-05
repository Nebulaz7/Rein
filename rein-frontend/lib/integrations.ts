// Integrations API utilities for frontend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface IntegrationStatus {
  platform: 'github' | 'calendar' | 'slack';
  connected: boolean;
  lastSync?: string;
  accountInfo?: {
    username?: string;
    email?: string;
  };
}

export const integrationsAPI = {
  async getStatus(userId: string): Promise<{ success: boolean; integrations?: IntegrationStatus[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/integrations/status/${userId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch integration status');
      }

      const data = await response.json();
      return { success: true, integrations: data };
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  async syncCalendar(userId: string, resolutionId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/integrations/calendar/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, resolutionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync calendar');
      }

      return { success: true, message: data.message };
    } catch (error) {
      console.error('Failed to sync calendar:', error);
      return { success: false, error: (error as Error).message };
    }
  },
};
