import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current cached analytics record
    const analytics = await prisma.analytics.findFirst({
      where: { profileId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    // Get all posts to compute timeline charts dynamically
    const posts = await prisma.post.findMany({
      where: { profileId: user.id },
      orderBy: { createdAt: 'asc' }, // Older first to draw timeline left-to-right
      select: {
        id: true,
        activityUrn: true,
        postedRelative: true,
        numLikes: true,
        numComments: true,
        numShares: true,
        numImpressions: true,
        engagementScore: true,
        engagementRate: true,
        postType: true,
        createdAt: true,
      },
    });

    // Group posts by postType to get average metrics
    const typeGroups: Record<string, { count: number; likes: number; comments: number; impressions: number; engagement: number }> = {};
    posts.forEach(post => {
      const type = post.postType;
      if (!typeGroups[type]) {
        typeGroups[type] = { count: 0, likes: 0, comments: 0, impressions: 0, engagement: 0 };
      }
      typeGroups[type].count++;
      typeGroups[type].likes += post.numLikes;
      typeGroups[type].comments += post.numComments;
      typeGroups[type].impressions += post.numImpressions;
      typeGroups[type].engagement += post.engagementScore;
    });

    const typeBreakdown = Object.entries(typeGroups).map(([type, stats]) => ({
      type,
      count: stats.count,
      avgLikes: +(stats.likes / stats.count).toFixed(1),
      avgComments: +(stats.comments / stats.count).toFixed(1),
      avgImpressions: +(stats.impressions / stats.count).toFixed(0),
      avgEngagement: +(stats.engagement / stats.count).toFixed(1),
    }));

    return NextResponse.json({
      success: true,
      summary: analytics ? {
        postsCount: analytics.postsCount,
        totalLikes: analytics.totalLikes,
        totalComments: analytics.totalComments,
        totalShares: analytics.totalShares,
        totalImpressions: analytics.totalImpressions,
        averageLikes: analytics.averageLikes,
        averageComments: analytics.averageComments,
        averageShares: analytics.averageShares,
        averageImpressions: analytics.averageImpressions,
        averageEngagementRate: analytics.averageEngagementRate,
        topHashtags: analytics.topHashtags,
        topMentions: analytics.topMentions,
        insights: analytics.insights,
      } : null,
      timeline: posts.map((p, idx) => ({
        index: idx + 1,
        postedRelative: p.postedRelative,
        likes: p.numLikes,
        comments: p.numComments,
        shares: p.numShares,
        impressions: p.numImpressions,
        engagement: p.engagementScore,
        rate: p.engagementRate,
      })),
      typeBreakdown,
    });
  } catch (error: any) {
    console.error('Error fetching analytics API:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
