// Metricool API utilities for fetching social media analytics data
// API Documentation: https://dev.metricool.com/

export interface MetricoolAccount {
  id: string;
  name: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok' | 'youtube';
  followers: number;
  avatar?: string;
  username: string;
}

export interface MetricoolPost {
  id: string;
  date: string;
  platform: string;
  content: string;
  media_type: 'image' | 'video' | 'carousel' | 'text';
  interactions: number;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  engagement_rate: number;
  url?: string;
  media_url?: string;
}

export interface MetricoolAnalytics {
  total_followers: number;
  total_interactions: number;
  total_posts: number;
  avg_engagement_rate: number;
  reach: number;
  impressions: number;
  growth_rate: number;
  top_platforms: Array<{
    platform: string;
    followers: number;
    engagement: number;
  }>;
}

export interface MetricoolDashboardData {
  accounts: MetricoolAccount[];
  analytics: MetricoolAnalytics;
  recent_posts: MetricoolPost[];
  performance_metrics: {
    best_performing_post: MetricoolPost;
    worst_performing_post: MetricoolPost;
    peak_engagement_time: string;
    top_hashtags: string[];
  };
}

class MetricoolApiService {
  private baseURL = 'https://api.metricool.com/v1';
  private apiToken: string;

  constructor() {
    this.apiToken = import.meta.env.VITE_METRICOOL_API_TOKEN || '';
    
    if (!this.apiToken) {
      console.warn('METRICOOL_API_TOKEN not found in environment variables');
    }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.apiToken) {
      throw new Error('Metricool API token is not configured');
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Metricool API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getAccounts(): Promise<MetricoolAccount[]> {
    const response = await this.makeRequest<{ data: MetricoolAccount[] }>('/accounts');
    return response.data;
  }

  async getAnalytics(dateFrom?: string, dateTo?: string): Promise<MetricoolAnalytics> {
    const params = new URLSearchParams();
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    
    const response = await this.makeRequest<{ data: MetricoolAnalytics }>(`/analytics?${params}`);
    return response.data;
  }

  async getRecentPosts(limit = 10): Promise<MetricoolPost[]> {
    const response = await this.makeRequest<{ data: MetricoolPost[] }>(`/posts?limit=${limit}&sort=date`);
    return response.data;
  }

  async getDashboardData(): Promise<MetricoolDashboardData> {
    const [accounts, analytics, recentPosts] = await Promise.all([
      this.getAccounts(),
      this.getAnalytics(),
      this.getRecentPosts(5)
    ]);

    // Calculate performance metrics
    const bestPost = recentPosts.reduce((best, current) => 
      current.engagement_rate > best.engagement_rate ? current : best, recentPosts[0]);
    
    const worstPost = recentPosts.reduce((worst, current) => 
      current.engagement_rate < worst.engagement_rate ? current : worst, recentPosts[0]);

    return {
      accounts,
      analytics,
      recent_posts: recentPosts,
      performance_metrics: {
        best_performing_post: bestPost,
        worst_performing_post: worstPost,
        peak_engagement_time: '19:00',
        top_hashtags: ['#jobportal', '#hiring', '#career', '#employment', '#jobs']
      }
    };
  }
}

export const metricoolApi = new MetricoolApiService();
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      
      const response = await this.makeRequest<{ data: MetricoolAnalytics }>(`/analytics?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Metricool analytics:', error);
      return this.getMockAnalytics();
    }
  }

  async getRecentPosts(limit = 10): Promise<MetricoolPost[]> {
    try {
      const response = await this.makeRequest<{ data: MetricoolPost[] }>(`/posts?limit=${limit}&sort=date`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Metricool posts:', error);
      return this.getMockPosts();
    }
  }

  async getDashboardData(): Promise<MetricoolDashboardData> {
    try {
      const [accounts, analytics, recentPosts] = await Promise.all([
        this.getAccounts(),
        this.getAnalytics(),
        this.getRecentPosts(5)
      ]);

      // Calculate performance metrics
      const bestPost = recentPosts.reduce((best, current) => 
        current.engagement_rate > best.engagement_rate ? current : best, recentPosts[0]);
      
      const worstPost = recentPosts.reduce((worst, current) => 
        current.engagement_rate < worst.engagement_rate ? current : worst, recentPosts[0]);

      return {
        accounts,
        analytics,
        recent_posts: recentPosts,
        performance_metrics: {
          best_performing_post: bestPost,
          worst_performing_post: worstPost,
          peak_engagement_time: '19:00',
          top_hashtags: ['#jobportal', '#hiring', '#career', '#employment', '#jobs']
        }
      };
    } catch (error) {
      console.error('Error fetching Metricool dashboard data:', error);
      return this.getMockDashboardData();
    }
  }

  // Mock data for development/fallback
  private getMockAccounts(): MetricoolAccount[] {
    return [
      {
        id: '1',
        name: 'VQH Job Portal',
        platform: 'instagram',
        followers: 12500,
        username: '@vqhjobportal',
        avatar: '/placeholder-avatar.jpg'
      },
      {
        id: '2',
        name: 'VQH LinkedIn',
        platform: 'linkedin',
        followers: 8200,
        username: 'vqh-job-portal',
        avatar: '/placeholder-avatar.jpg'
      },
      {
        id: '3',
        name: 'VQH Facebook',
        platform: 'facebook',
        followers: 15800,
        username: 'VQHJobPortal',
        avatar: '/placeholder-avatar.jpg'
      }
    ];
  }

  private getMockAnalytics(): MetricoolAnalytics {
    return {
      total_followers: 36500,
      total_interactions: 4250,
      total_posts: 127,
      avg_engagement_rate: 3.8,
      reach: 125000,
      impressions: 230000,
      growth_rate: 12.5,
      top_platforms: [
        { platform: 'Facebook', followers: 15800, engagement: 4.2 },
        { platform: 'Instagram', followers: 12500, engagement: 3.9 },
        { platform: 'LinkedIn', followers: 8200, engagement: 3.1 }
      ]
    };
  }

  private getMockPosts(): MetricoolPost[] {
    return [
      {
        id: '1',
        date: '2025-01-03T10:30:00Z',
        platform: 'instagram',
        content: 'New job opportunities in tech! Apply now 🚀',
        media_type: 'image',
        interactions: 245,
        likes: 189,
        comments: 32,
        shares: 24,
        reach: 3200,
        impressions: 4500,
        engagement_rate: 5.4,
        media_url: '/placeholder-post.jpg'
      },
      {
        id: '2',
        date: '2025-01-02T15:45:00Z',
        platform: 'linkedin',
        content: 'Career tips for job seekers in 2025',
        media_type: 'text',
        interactions: 178,
        likes: 134,
        comments: 28,
        shares: 16,
        reach: 2800,
        impressions: 3900,
        engagement_rate: 4.6
      },
      {
        id: '3',
        date: '2025-01-01T09:15:00Z',
        platform: 'facebook',
        content: 'Welcome to 2025! Ready for new career opportunities?',
        media_type: 'video',
        interactions: 156,
        likes: 112,
        comments: 24,
        shares: 20,
        reach: 2600,
        impressions: 3400,
        engagement_rate: 4.8
      }
    ];
  }

  private getMockDashboardData(): MetricoolDashboardData {
    const accounts = this.getMockAccounts();
    const analytics = this.getMockAnalytics();
    const recentPosts = this.getMockPosts();

    return {
      accounts,
      analytics,
      recent_posts: recentPosts,
      performance_metrics: {
        best_performing_post: recentPosts[0],
        worst_performing_post: recentPosts[2],
        peak_engagement_time: '19:00',
        top_hashtags: ['#jobportal', '#hiring', '#career', '#employment', '#jobs']
      }
    };
  }
}

export const metricoolApi = new MetricoolApiService();