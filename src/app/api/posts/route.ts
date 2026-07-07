import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const postType = searchParams.get('postType') || '';
    const sortBy = searchParams.get('sortBy') || 'engagementScore';
    const order = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const where: Prisma.PostWhereInput = {
      profileId: user.id,
    };

    if (search) {
      where.text = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (postType && postType !== 'all') {
      where.postType = postType;
    }

    // Determine sorting fields
    let orderBy: Prisma.PostOrderByWithRelationInput = { engagementScore: 'desc' };
    if (['engagementScore', 'engagementRate', 'numLikes', 'numComments', 'numShares', 'numImpressions', 'rank', 'createdAt'].includes(sortBy)) {
      orderBy = { [sortBy]: order as Prisma.SortOrder };
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

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

    return NextResponse.json({
      success: true,
      posts,
      hasCookies,
      hasSynced,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching posts API:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
