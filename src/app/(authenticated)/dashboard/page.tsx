import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import DashboardClient from './DashboardClient';

export const revalidate = 0; // Disable static cache for real-time dashboard data

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  // Direct server database query for optimal load speed (0ms network latency to DB)
  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: {
      fullName: true,
      occupation: true,
      profileUrl: true,
      avatarUrl: true,
      encryptedLiAt: true,
      encryptedJsessionid: true,
    },
  });

  const hasCookies = !!(profile?.encryptedLiAt && profile?.encryptedJsessionid);

  const syncCount = await prisma.refreshHistory.count({
    where: { profileId: user.id },
  });

  const analytics = await prisma.analytics.findFirst({
    where: { profileId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  const bestPosts = await prisma.post.findMany({
    where: { profileId: user.id },
    orderBy: { engagementScore: 'desc' },
    take: 3,
  });

  const totalPosts = await prisma.post.count({
    where: { profileId: user.id },
  });

  const overview = analytics ? {
    totalPosts,
    averageEngagement: analytics.averageEngagementRate,
    averageLikes: analytics.averageLikes,
    averageComments: analytics.averageComments,
    averageShares: analytics.averageShares,
    averageImpressions: analytics.averageImpressions,
    bestPostUrn: bestPosts[0]?.activityUrn || null,
    bestPostText: bestPosts[0]?.text || null,
    bestPostLikes: bestPosts[0]?.numLikes || 0,
    bestPostComments: bestPosts[0]?.numComments || 0,
  } : {
    totalPosts: 0,
    averageEngagement: 0,
    averageLikes: 0,
    averageComments: 0,
    averageShares: 0,
    averageImpressions: 0,
    bestPostUrn: null,
    bestPostText: null,
    bestPostLikes: 0,
    bestPostComments: 0,
  };

  return (
    <DashboardClient 
      initialProfile={profile}
      initialOverview={overview}
      initialBestPosts={bestPosts}
      initialUserEmail={user.email || ''}
      initialHasCookies={hasCookies}
      initialHasSynced={syncCount > 0}
    />
  );
}
