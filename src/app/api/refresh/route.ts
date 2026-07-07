import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { runVoyagerAnalytics } from '@/services/linkedin-voyager';
import { generateInsights } from '@/services/insights-engine';
import { seedMockData } from '@/services/mock-seeder';

export async function POST(request: NextRequest) {
  let userId = '';
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    userId = user.id;

    // Check if the user is requesting mock seed data
    const body = await request.json().catch(() => ({}));
    if (body.seed === true || body.demo === true) {
      const result = await seedMockData(userId);
      return NextResponse.json({
        success: true,
        message: 'Mock demonstration data seeded successfully.',
        profile: result.profile,
      });
    }

    // Retrieve encrypted cookies from DB
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: {
        encryptedLiAt: true,
        encryptedJsessionid: true,
      },
    });

    if (!profile || !profile.encryptedLiAt || !profile.encryptedJsessionid) {
      return NextResponse.json({
        error: 'Credentials missing. Please go to Settings to save your LinkedIn cookies first.',
        code: 'COOKIES_MISSING'
      }, { status: 400 });
    }

    // Decrypt credentials
    const liAt = decrypt(profile.encryptedLiAt);
    const jsessionid = decrypt(profile.encryptedJsessionid);

    if (!liAt || !jsessionid) {
      return NextResponse.json({
        error: 'Failed to decrypt credentials. Please re-enter them in Settings.',
        code: 'DECRYPTION_FAILED'
      }, { status: 400 });
    }

    // Trigger ingest from LinkedIn Voyager API
    const ingestResult = await runVoyagerAnalytics(liAt, jsessionid);
    
    if (!ingestResult.success) {
      throw new Error(ingestResult.postsError || 'Voyager extraction failed.');
    }

    // Update Profile details in DB
    await prisma.profile.update({
      where: { id: userId },
      data: {
        fullName: ingestResult.profile.fullName,
        occupation: ingestResult.profile.occupation,
        profileUrl: ingestResult.profile.profileUrl,
        avatarUrl: ingestResult.profile.avatarUrl,
      },
    });

    // Clear existing posts (including any mock posts) to ensure a clean sync
    await prisma.post.deleteMany({
      where: { profileId: userId },
    });

    // Create posts in DB
    const posts = ingestResult.posts;
    await Promise.all(
      posts.map(post => {
        // Simple hashtag & mention parser
        const hashtags = post.text ? (post.text.match(/#[\w]+/g) || []).map(h => h.toLowerCase()) : [];
        const mentions = post.text ? (post.text.match(/@[\w]+/g) || []).map(m => m.trim()) : [];
        
        // Classify content type
        const hasLink = /https?:\/\/[^\s]+/.test(post.text || '');
        const emojiCount = (post.text?.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g) || []).length;
        let postType = 'Short text';
        if (hasLink) postType = 'Link Share';
        else if (emojiCount >= 3) postType = 'Media Rich';
        else if ((post.text?.length || 0) > 500) postType = 'Long-form Text';

        return prisma.post.create({
          data: {
            profileId: userId,
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
            rank: post.rank,
            postType,
            hashtags,
            mentions,
          },
        });
      })
    );

    // Compute insights using insights engine
    const insights = generateInsights(posts);

    // Cache summary to Analytics table
    await prisma.analytics.deleteMany({
      where: { profileId: userId },
    });

    await prisma.analytics.create({
      data: {
        profileId: userId,
        postsCount: ingestResult.analytics.postsFound,
        totalLikes: ingestResult.analytics.totalLikes,
        totalComments: ingestResult.analytics.totalComments,
        totalShares: ingestResult.analytics.totalShares,
        totalImpressions: ingestResult.analytics.totalImpressions,
        averageLikes: ingestResult.analytics.averageLikes,
        averageComments: ingestResult.analytics.averageComments,
        averageShares: ingestResult.analytics.averageShares,
        averageImpressions: ingestResult.analytics.averageImpressions,
        averageEngagementRate: ingestResult.analytics.averageEngagementRate,
        topHashtags: insights.bestHashtags as any,
        topMentions: insights.mostEngagingTopics as any,
        insights: insights as any,
      },
    });

    // Save success history
    await prisma.refreshHistory.create({
      data: {
        profileId: userId,
        status: 'success',
        postsFetched: posts.length,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${posts.length} posts.`,
      postsFetched: posts.length,
    });
  } catch (error: any) {
    console.error('Error synchronizing LinkedIn API:', error);

    if (userId) {
      // Save failure history
      await prisma.refreshHistory.create({
        data: {
          profileId: userId,
          status: 'failed',
          errorMessage: error.message || 'Unknown Voyager error',
        },
      });
    }

    return NextResponse.json({
      error: `Sync failed: ${error.message || 'Unknown internal error'}`
    }, { status: 500 });
  }
}
