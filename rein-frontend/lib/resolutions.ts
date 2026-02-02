// API utilities for resolution management
export interface Resolution {
  id: string;
  userId: string;
  title: string;
  goal: string;
  roadmap: any;
  isPublic: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResolutionData {
  userId: string;
  title: string;
  goal: string;
  roadmap: any;
}

export interface TaskResource {
  type: "article" | "video";
  title: string;
  url: string;
}

export interface ResolutionTask {
  id: string;
  title: string;
  description?: string;
  platform: "github" | "calendar" | "slack" | "jira";
  time?: string;
  completed: boolean;
  resources?: TaskResource[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const resolutionAPI = {
  // Create a new resolution
  async create(data: CreateResolutionData): Promise<Resolution> {
    const response = await fetch(`${API_BASE_URL}/resolution`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create resolution');
    }

    return response.json();
  },

  // Get all resolutions for a user
  async getAllByUser(userId: string): Promise<Resolution[]> {
    const response = await fetch(`${API_BASE_URL}/resolution/user/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch resolutions');
    }

    return response.json();
  },

  // Get a specific resolution
  async getById(id: string, userId?: string): Promise<Resolution> {
    const url = userId 
      ? `${API_BASE_URL}/resolution/${id}?userId=${userId}`
      : `${API_BASE_URL}/resolution/${id}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch resolution');
    }

    return response.json();
  },

  // Delete a resolution
  async delete(id: string, userId: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/resolution/${id}?userId=${userId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete resolution');
    }

    return response.json();
  },

  // Toggle public status
  async togglePublic(id: string, userId: string, isPublic: boolean): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/resolution/${id}/public`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, isPublic }),
    });

    if (!response.ok) {
      throw new Error('Failed to toggle resolution visibility');
    }

    return response.json();
  },

  // Get resolution stats for dashboard overview
  async getStats(id: string, userId?: string): Promise<ResolutionStats> {
    const url = userId 
      ? `${API_BASE_URL}/resolution/${id}/stats?userId=${userId}`
      : `${API_BASE_URL}/resolution/${id}/stats`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch resolution stats');
    }

    return response.json();
  },

  // Get all tasks for a resolution
  async getTasks(id: string, userId?: string): Promise<ResolutionTasks> {
    const url = userId 
      ? `${API_BASE_URL}/resolution/${id}/tasks?userId=${userId}`
      : `${API_BASE_URL}/resolution/${id}/tasks`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }

    return response.json();
  },

  // Get upcoming tasks
  async getUpcomingTasks(id: string, userId?: string, limit: number = 5): Promise<UpcomingTasks> {
    const url = userId 
      ? `${API_BASE_URL}/resolution/${id}/tasks/upcoming?userId=${userId}&limit=${limit}`
      : `${API_BASE_URL}/resolution/${id}/tasks/upcoming?limit=${limit}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch upcoming tasks');
    }

    return response.json();
  },

  // Update task completion status
  async updateTaskStatus(
    resolutionId: string, 
    taskId: string, 
    userId: string, 
    completed: boolean
  ): Promise<{ success: boolean; taskId: string; completed: boolean }> {
    const response = await fetch(`${API_BASE_URL}/resolution/${resolutionId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, completed }),
    });

    if (!response.ok) {
      throw new Error('Failed to update task status');
    }

    return response.json();
  },
};

// Type definitions for new endpoints
export interface ResolutionStats {
  resolution: {
    id: string;
    title: string;
    description: string;
    startDate: string;
    targetDate: string;
  };
  stats: {
    streak: number;
    progress: number;
    healthStatus: string;
    totalTasks: number;
    completedTasks: number;
    remainingTasks: number;
  };
  coachMessage: {
    message: string;
    confidence: number;
  };
}

export interface ResolutionTask {
  id: string;
  title: string;
  description?: string;
  platform: 'github' | 'calendar' | 'jira' | 'slack';
  completed: boolean;
  time?: string; // scheduledDate from backend
  stageNumber?: number;
  stageTitle?: string;
  resources?: Array<{
    type: string;
    title: string;
    link: string;
    description: string;
  }>;
}

export interface ResolutionTasks {
  tasks: ResolutionTask[];
  totalCount: number;
  completedCount: number;
}

export interface UpcomingTasks {
  tasks: ResolutionTask[];
  totalUpcoming: number;
}