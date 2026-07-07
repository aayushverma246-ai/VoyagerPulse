import prisma from '@/lib/prisma';
import { generateInsights } from './insights-engine';
import { LinkedInPostRecord } from '@/types';

const MOCK_POSTS_RAW: LinkedInPostRecord[] = [
  {
    activityUrn: "urn:li:activity:7123456789012345678",
    text: "I am thrilled to announce the open-source release of our new workflow automation tools! 🚀 Check out how it simplifies integrations in minutes. #opensource #automation #nextjs",
    postUrl: "https://www.linkedin.com/posts/activity-7467575576896319488",
    postedRelative: "2d",
    numLikes: 210,
    numComments: 30,
    numShares: 8,
    numImpressions: 4500,
    engagementScore: 248,
    engagementRate: 5.51,
    reactionBreakdown: [
      { reactionType: "LIKE", count: 180 },
      { reactionType: "PRAISE", count: 20 },
      { reactionType: "APPRECIATION", count: 10 }
    ],
    missingUpdateObject: false,
    rank: 1
  },
  {
    activityUrn: "urn:li:activity:7123456789012345679",
    text: "Had a fantastic time hosting our weekly engineering roundtable discussion today. We dived deep into caching strategies and optimization patterns. Thanks for attending! @TechCorp @Google",
    postUrl: "https://www.linkedin.com/posts/activity-7467578578264559616",
    postedRelative: "4d",
    numLikes: 90,
    numComments: 10,
    numShares: 3,
    numImpressions: 2500,
    engagementScore: 103,
    engagementRate: 4.12,
    reactionBreakdown: [
      { reactionType: "LIKE", count: 80 },
      { reactionType: "EMPATHY", count: 10 },
      { reactionType: "APPRECIATION", count: 13 }
    ],
    missingUpdateObject: false,
    rank: 2
  },
  {
    activityUrn: "urn:li:activity:7123456789012345680",
    text: "Quick poll: Do you prefer JavaScript or TypeScript for writing serverless functions? Let's discuss in the comments below! #typescript #javascript #serverless",
    postUrl: "https://www.linkedin.com/posts/activity-7468477215404515328",
    postedRelative: "6d",
    numLikes: 40,
    numComments: 5,
    numShares: 1,
    numImpressions: 1500,
    engagementScore: 46,
    engagementRate: 3.07,
    reactionBreakdown: [
      { reactionType: "LIKE", count: 40 }
    ],
    missingUpdateObject: false,
    rank: 3
  },
  {
    activityUrn: "urn:li:activity:7123456789012345681",
    text: "Here is why we migrated our state management to Zustand. A lightweight, simple store that resolved our rendering bottlenecks without boilerplate. Read our new blog post. #react #zustand #webdev",
    postUrl: "https://www.linkedin.com/posts/activity-7467540679179517953",
    postedRelative: "1w",
    numLikes: 145,
    numComments: 18,
    numShares: 5,
    numImpressions: 3200,
    engagementScore: 168,
    engagementRate: 5.25,
    reactionBreakdown: [
      { reactionType: "LIKE", count: 120 },
      { reactionType: "PRAISE", count: 15 },
      { reactionType: "INTEREST", count: 10 }
    ],
    missingUpdateObject: false,
    rank: 2
  },
  {
    activityUrn: "urn:li:activity:7123456789012345682",
    text: "Excited to join the developer advocate team at VoyagerPulse! Building tools to help creators understand their content and scale their brand organically. 🚀 #voyagerpulse #saas #developers",
    postUrl: "https://www.linkedin.com/posts/activity-7470291059529621507",
    postedRelative: "2w",
    numLikes: 350,
    numComments: 68,
    numShares: 12,
    numImpressions: 7800,
    engagementScore: 430,
    engagementRate: 5.51,
    reactionBreakdown: [
      { reactionType: "LIKE", count: 280 },
      { reactionType: "PRAISE", count: 50 },
      { reactionType: "APPRECIATION", count: 20 }
    ],
    missingUpdateObject: false,
    rank: 1
  }
];

export async function seedMockData(profileId: string) {
  // Update Profile
  const profile = await prisma.profile.update({
    where: { id: profileId },
    data: {
      fullName: 'Jane Doe (Demo)',
      occupation: 'Senior Developer Advocate at TechCorp',
      publicIdentifier: 'jane-doe-advocate',
      profileUrl: 'https://www.linkedin.com/in/jane-doe-advocate',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    },
  });

  // Delete existing posts to prevent key conflicts
  await prisma.post.deleteMany({
    where: { profileId },
  });

  // Add Posts
  const createdPosts = await Promise.all(
    MOCK_POSTS_RAW.map((post, idx) => {
      // Simple hashtag & mention parser for mock data
      const hashtags = post.text ? (post.text.match(/#[\w]+/g) || []).map(h => h.toLowerCase()) : [];
      const mentions = post.text ? (post.text.match(/@[\w]+/g) || []).map(m => m.trim()) : [];
      const postType = post.text && post.text.length > 150 ? 'Long-form Text' : 'Short text';

      return prisma.post.create({
        data: {
          profileId,
          activityUrn: post.activityUrn,
          text: post.text,
          postUrl: post.postUrl,
          postedRelative: post.postedRelative,
          numLikes: post.numLikes,
          numComments: post.numComments,
          numShares: post.numShares,
          numImpressions: post.numImpressions,
          engagementScore: post.engagementScore,
          engagementRate: post.engagementRate,
          reactionBreakdown: post.reactionBreakdown as any,
          rank: idx + 1,
          postType,
          hashtags,
          mentions,
        },
      });
    })
  );

  // Generate Insights
  const insights = generateInsights(MOCK_POSTS_RAW);

  // Clear existing analytics and create new
  await prisma.analytics.deleteMany({
    where: { profileId },
  });

  const totalLikes = MOCK_POSTS_RAW.reduce((acc, p) => acc + p.numLikes, 0);
  const totalComments = MOCK_POSTS_RAW.reduce((acc, p) => acc + p.numComments, 0);
  const totalShares = MOCK_POSTS_RAW.reduce((acc, p) => acc + p.numShares, 0);
  const totalImpressions = MOCK_POSTS_RAW.reduce((acc, p) => acc + p.numImpressions, 0);
  const avgEngagementRate = MOCK_POSTS_RAW.reduce((acc, p) => acc + p.engagementRate, 0) / MOCK_POSTS_RAW.length;

  await prisma.analytics.create({
    data: {
      profileId,
      postsCount: MOCK_POSTS_RAW.length,
      totalLikes,
      totalComments,
      totalShares,
      totalImpressions,
      averageLikes: totalLikes / MOCK_POSTS_RAW.length,
      averageComments: totalComments / MOCK_POSTS_RAW.length,
      averageShares: totalShares / MOCK_POSTS_RAW.length,
      averageImpressions: totalImpressions / MOCK_POSTS_RAW.length,
      averageEngagementRate: avgEngagementRate,
      topHashtags: insights.bestHashtags as any,
      topMentions: insights.mostEngagingTopics as any, // reuse engaging topics as mentions or keywords
      insights: insights as any,
    },
  });

  // Log to refresh history
  await prisma.refreshHistory.create({
    data: {
      profileId,
      status: 'success',
      postsFetched: MOCK_POSTS_RAW.length,
    },
  });

  return { profile, posts: createdPosts };
}
