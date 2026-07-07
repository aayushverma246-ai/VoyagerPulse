export interface LinkedInProfile {
  fullName: string;
  occupation: string | null;
  publicIdentifier: string | null;
  profileUrl: string | null;
  avatarUrl?: string | null;
}

export interface ReactionTypeCount {
  reactionType: string;
  count: number;
}

export interface LinkedInPostRecord {
  activityUrn: string;
  text: string | null;
  postUrl: string | null;
  postedRelative: string | null;
  numLikes: number;
  numComments: number;
  numShares: number;
  numImpressions: number;
  engagementScore: number;
  engagementRate: number;
  reactionBreakdown: ReactionTypeCount[];
  missingUpdateObject: boolean;
  rank: number;
}

export interface LinkedInAnalyticsSummary {
  postsFound: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalImpressions: number;
  averageLikes: number;
  averageComments: number;
  averageShares: number;
  averageImpressions: number;
  averageEngagementRate: number;
  highestEngagementPost: LinkedInPostRecord | null;
  highestViewedPost: LinkedInPostRecord | null;
  lowestPerformingPost: LinkedInPostRecord | null;
}

export interface IngestionResult {
  success: boolean;
  profile: LinkedInProfile;
  analytics: LinkedInAnalyticsSummary;
  posts: LinkedInPostRecord[];
  postsError?: string;
}

export interface AnalyticsInsightsData {
  bestPostingStyle: {
    title: string;
    description: string;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
  };
  bestHashtags: { hashtag: string; count: number; avgEngagement: number }[];
  averageEngagement: number;
  topPerformingContentType: {
    type: string;
    avgEngagement: number;
    description: string;
  };
  postingRecommendations: string[];
  mostEngagingTopics: { topic: string; count: number; weight: number }[];
  contentFrequency: {
    description: string;
    postsPerWeek: number;
  };
  weakestPerformingPosts: {
    description: string;
    commonFactors: string[];
  };
}
