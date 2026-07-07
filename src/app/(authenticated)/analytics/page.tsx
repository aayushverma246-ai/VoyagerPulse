import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import AnalyticsClient from './AnalyticsClient';

export const revalidate = 0; // Disable static cache for real-time analytics data

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    redirect('/login');
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

  const summary = analytics ? {
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
    insights: analytics.insights as any,
  } : null;

  const timeline = posts.map((p, idx) => ({
    index: idx + 1,
    postedRelative: p.postedRelative || 'Recent',
    likes: p.numLikes,
    comments: p.numComments,
    shares: p.numShares,
    impressions: p.numImpressions,
    engagement: p.engagementScore,
    rate: p.engagementRate,
  }));

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: {
      encryptedLiAt: true,
      encryptedJsessionid: true,
    },
  });
  const hasCookies = !!(profile?.encryptedLiAt && profile?.encryptedJsessionid);

  const syncCount = await prisma.refreshHistory.count({
    where: { profileId: user.id },
  });
  const hasSynced = syncCount > 0;

  return (
    <AnalyticsClient 
      initialSummary={summary}
      initialTimeline={timeline}
      initialTypeBreakdown={typeBreakdown}
      initialHasCookies={hasCookies}
      initialHasSynced={hasSynced}
    />
  );
}
