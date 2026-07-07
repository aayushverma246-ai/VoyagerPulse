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

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        fullName: true,
        occupation: true,
        profileUrl: true,
        avatarUrl: true,
        encryptedLiAt: true,
        encryptedJsessionid: true,
      },
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

    // Overview metric cards values
    const overview = analytics ? {
      totalPosts: totalPosts,
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

    const hasCookies = !!(profile?.encryptedLiAt && profile?.encryptedJsessionid);
    const syncCount = await prisma.refreshHistory.count({
      where: { profileId: user.id },
    });

    return NextResponse.json({
      success: true,
      email: user.email,
      profile,
      overview,
      bestPosts,
      hasCookies,
      hasSynced: syncCount > 0,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard API:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
