// GitHub API utilities for frontend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://rein-63fq.onrender.com';

export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  repoUrl: string;
  htmlUrl: string;
  description?: string;
  private: boolean;
  language?: string;
  updatedAt: string;
}

export interface GitHubIssue {
  number: number;
  title: string;
  url: string;
  state: string;
  createdAt: string;
}

export interface CreateRepoData {
  userId: string;
  name: string;
  description?: string;
  private?: boolean;
  autoInit?: boolean;
}

export interface CreateIssueForTaskData {
  userId: string;
  repoUrl: string; // format: "owner/repo"
  task: {
    title: string;
    description: string;
    scheduledDate?: string;
    stageTitle?: string;
    resources?: Array<{ type: string; title: string; url: string }>;
  };
  labels?: string[];
}

export interface UpdateTaskGitHubData {
  userId: string;
  resolutionId: string;
  taskId: string;
  githubIssueUrl?: string;
  githubRepoUrl?: string;
  githubIssueNumber?: number;
  githubDeclined?: boolean;
}

export const githubAPI = {
  // Create a new GitHub repository
  async createRepository(data: CreateRepoData): Promise<{ success: boolean; repository: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/github/create-repo?userId=${data.userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          private: data.private ?? true,
          autoInit: data.autoInit ?? true,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create repository');
      }

      return result;
    } catch (error) {
      console.error('Failed to create repository:', error);
      return {
        success: false,
        repository: null,
        error: error instanceof Error ? error.message : 'Failed to create repository',
      };
    }
  },

  // Create a GitHub issue for a task
  async createIssueForTask(data: CreateIssueForTaskData): Promise<{ success: boolean; issue: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/github/create-issue?userId=${data.userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoUrl: data.repoUrl,
          task: data.task,
          labels: data.labels,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create issue');
      }

      return result;
    } catch (error) {
      console.error('Failed to create issue:', error);
      return {
        success: false,
        issue: null,
        error: error instanceof Error ? error.message : 'Failed to create issue',
      };
    }
  },

  // Get user's GitHub repositories
  async getRepositories(userId: string): Promise<{ success: boolean; repositories: GitHubRepository[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/github/repositories?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch repositories');
      }

      return result;
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
      return {
        success: false,
        repositories: [],
        error: error instanceof Error ? error.message : 'Failed to fetch repositories',
      };
    }
  },

  // Update task with GitHub metadata
  async updateTaskGitHub(data: UpdateTaskGitHubData): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/resolution/${data.resolutionId}/tasks/${data.taskId}/github`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: data.userId,
            githubIssueUrl: data.githubIssueUrl,
            githubRepoUrl: data.githubRepoUrl,
            githubIssueNumber: data.githubIssueNumber,
            githubDeclined: data.githubDeclined,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update task');
      }

      return result;
    } catch (error) {
      console.error('Failed to update task:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update task',
      };
    }
  },
};
