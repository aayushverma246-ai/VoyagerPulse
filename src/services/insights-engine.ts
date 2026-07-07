import { LinkedInPostRecord, AnalyticsInsightsData } from '@/types';

export function parseHashtags(text: string | null): string[] {
  if (!text) return [];
  const matches = text.match(/#[\w\d]+/g);
  return matches ? matches.map(tag => tag.toLowerCase()) : [];
}

export function parseMentions(text: string | null): string[] {
  if (!text) return [];
  const matches = text.match(/@[\w\d\s]+/g); // Simplistic mention parser
  return matches ? matches.map(m => m.trim()) : [];
}

export function classifyPostType(text: string | null): string {
  if (!text) return 'Text';
  const hasLink = /https?:\/\/[^\s]+/.test(text);
  const emojiCount = (text.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g) || []).length;
  
  if (hasLink) return 'Link Share';
  if (emojiCount >= 3) return 'Media Rich';
  if (text.length > 500) return 'Long-form Text';
  return 'Short text';
}

export function generateInsights(posts: LinkedInPostRecord[]): AnalyticsInsightsData {
  const totalPosts = posts.length;
  
  if (totalPosts === 0) {
    return {
      bestPostingStyle: {
        title: 'Insufficient Data',
        description: 'Sync your LinkedIn data to generate insights.',
        impact: 'LOW',
      },
      bestHashtags: [],
      averageEngagement: 0,
      topPerformingContentType: {
        type: 'Text',
        avgEngagement: 0,
        description: 'Not enough posts found.',
      },
      postingRecommendations: ['Connect cookies and refresh data to view recommendations.'],
      mostEngagingTopics: [],
      contentFrequency: {
        description: 'No posts tracked.',
        postsPerWeek: 0,
      },
      weakestPerformingPosts: {
        description: 'No posts tracked.',
        commonFactors: [],
      },
    };
  }

  // 1. Analyze Hashtags
  const hashtagStats: Record<string, { count: number; totalEngagement: number }> = {};
  // 2. Analyze Mentions
  const mentionStats: Record<string, { count: number; totalEngagement: number }> = {};
  // 3. Analyze Post Types
  const typeStats: Record<string, { count: number; totalEngagement: number; posts: LinkedInPostRecord[] }> = {};
  
  let totalEngagementScore = 0;

  posts.forEach(post => {
    totalEngagementScore += post.engagementScore;
    const tags = parseHashtags(post.text);
    tags.forEach(tag => {
      if (!hashtagStats[tag]) {
        hashtagStats[tag] = { count: 0, totalEngagement: 0 };
      }
      hashtagStats[tag].count++;
      hashtagStats[tag].totalEngagement += post.engagementScore;
    });

    const mentions = parseMentions(post.text);
    mentions.forEach(mention => {
      if (!mentionStats[mention]) {
        mentionStats[mention] = { count: 0, totalEngagement: 0 };
      }
      mentionStats[mention].count++;
      mentionStats[mention].totalEngagement += post.engagementScore;
    });

    const type = classifyPostType(post.text);
    if (!typeStats[type]) {
      typeStats[type] = { count: 0, totalEngagement: 0, posts: [] };
    }
    typeStats[type].count++;
    typeStats[type].totalEngagement += post.engagementScore;
    typeStats[type].posts.push(post);
  });

  // Calculate best hashtags
  const bestHashtags = Object.entries(hashtagStats)
    .map(([hashtag, stat]) => ({
      hashtag,
      count: stat.count,
      avgEngagement: +(stat.totalEngagement / stat.count).toFixed(2),
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement)
    .slice(0, 5);

  // Calculate content types stats
  const contentTypes = Object.entries(typeStats).map(([type, stat]) => ({
    type,
    count: stat.count,
    avgEngagement: +(stat.totalEngagement / stat.count).toFixed(2),
  }));

  const bestType = contentTypes.sort((a, b) => b.avgEngagement - a.avgEngagement)[0] || {
    type: 'Text',
    avgEngagement: 0,
  };

  // Heuristics for recommendations
  const averageEngagement = +(totalEngagementScore / totalPosts).toFixed(2);
  const recommendations: string[] = [];
  
  if (bestType.type === 'Long-form Text') {
    recommendations.push(
      'Format: Double down on story-based, long-form content. Your audience engages heavily with comprehensive narratives.'
    );
  } else if (bestType.type === 'Media Rich') {
    recommendations.push(
      'Format: Focus on visual posts, carousels, or documents with multiple emojis to highlight key takeaways.'
    );
  } else {
    recommendations.push(
      'Format: Keep posts crisp and to-the-point. Short updates perform best for your target audience.'
    );
  }

  if (bestHashtags.length > 0) {
    recommendations.push(
      `Hashtags: Prioritize using ${bestHashtags.slice(0, 2).map(h => h.hashtag).join(' & ')} which yield above-average engagement scores.`
    );
  } else {
    recommendations.push(
      'Hashtags: Introduce 3-5 relevant industry hashtags to expand your organic reach on the feed.'
    );
  }

  // Find average text length of top 25% posts vs bottom 25%
  const sortedPosts = [...posts].sort((a, b) => b.engagementScore - a.engagementScore);
  const topQuarter = sortedPosts.slice(0, Math.ceil(totalPosts * 0.25));
  const avgTopLength = topQuarter.reduce((acc, p) => acc + (p.text?.length || 0), 0) / (topQuarter.length || 1);
  
  recommendations.push(
    `Length: Aim for a word count of approximately ${Math.round(avgTopLength / 5)} words (${Math.round(avgTopLength)} characters) as observed in your highest performing posts.`
  );

  // Simple keyword topic analysis (most common words excluding stop words)
  const stopwords = new Set(['the', 'a', 'and', 'to', 'in', 'is', 'for', 'of', 'on', 'with', 'at', 'by', 'an', 'this', 'that', 'our', 'we', 'i', 'you', 'it']);
  const wordFrequency: Record<string, { count: number; engagement: number }> = {};
  
  posts.forEach(post => {
    if (!post.text) return;
    const words = post.text
      .toLowerCase()
      .replace(/[^\w\s#@]/g, '')
      .split(/\s+/);
      
    const uniqueWordsInPost = [...new Set(words)]; // Count frequency per post
    uniqueWordsInPost.forEach(word => {
      if (word.length > 3 && !stopwords.has(word) && !word.startsWith('#') && !word.startsWith('@')) {
        if (!wordFrequency[word]) {
          wordFrequency[word] = { count: 0, engagement: 0 };
        }
        wordFrequency[word].count++;
        wordFrequency[word].engagement += post.engagementScore;
      }
    });
  });

  const mostEngagingTopics = Object.entries(wordFrequency)
    .map(([topic, stat]) => ({
      topic,
      count: stat.count,
      weight: +(stat.engagement / stat.count).toFixed(2),
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);

  return {
    bestPostingStyle: {
      title: bestType.type === 'Media Rich' ? 'Visual & Visual Aids' : bestType.type === 'Long-form Text' ? 'Personal Narratives' : 'Direct Updates',
      description: `Your highest engaging posts are categorized as ${bestType.type} with an average engagement score of ${bestType.avgEngagement} per post.`,
      impact: bestType.avgEngagement > averageEngagement * 1.2 ? 'HIGH' : 'MEDIUM',
    },
    bestHashtags,
    averageEngagement,
    topPerformingContentType: {
      type: bestType.type,
      avgEngagement: bestType.avgEngagement,
      description: `Posts containing format attributes for "${bestType.type}" out-perform other posting categories by ${Math.round(((bestType.avgEngagement - averageEngagement) / (averageEngagement || 1)) * 100)}% on average.`,
    },
    postingRecommendations: recommendations,
    mostEngagingTopics,
    contentFrequency: {
      description: `You are currently publishing approximately ${totalPosts} posts over the tracked window.`,
      postsPerWeek: +(totalPosts / 4).toFixed(1), // Rough estimate for a 4-week window
    },
    weakestPerformingPosts: {
      description: 'Your lowest performing updates tend to receive less engagement due to missing attributes.',
      commonFactors: [
        'No hashtags or industry topic tags included',
        'Lacking call-to-actions (e.g. polls, link shares)',
        'Extremely short commentary format (<100 characters)'
      ],
    },
  };
}
