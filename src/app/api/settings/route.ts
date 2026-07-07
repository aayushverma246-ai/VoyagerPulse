import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.settings.findUnique({
      where: { profileId: user.id },
    });

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: {
        encryptedLiAt: true,
        encryptedJsessionid: true,
      },
    });

    const refreshHistory = await prisma.refreshHistory.findMany({
      where: { profileId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      email: user.email,
      settings: settings || { theme: 'dark', autoRefresh: false },
      hasCookies: !!(profile?.encryptedLiAt && profile?.encryptedJsessionid),
      refreshHistory,
    });
  } catch (error: any) {
    console.error('Error fetching settings API:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { liAt, jsessionid, theme, autoRefresh } = body;

    // Update settings preferences
    if (theme || typeof autoRefresh === 'boolean') {
      await prisma.settings.upsert({
        where: { profileId: user.id },
        update: {
          ...(theme && { theme }),
          ...(typeof autoRefresh === 'boolean' && { autoRefresh }),
        },
        create: {
          profileId: user.id,
          theme: theme || 'dark',
          autoRefresh: autoRefresh || false,
        },
      });
    }

    // Encrypt and update cookies if provided
    if (liAt && jsessionid) {
      const encryptedLiAt = encrypt(liAt.trim());
      const encryptedJsessionid = encrypt(jsessionid.trim());

      // Purge old LinkedIn profile data to prevent account mixing (retaining log history)
      await prisma.$transaction([
        prisma.post.deleteMany({ where: { profileId: user.id } }),
        prisma.analytics.deleteMany({ where: { profileId: user.id } }),
        prisma.profile.update({
          where: { id: user.id },
          data: {
            encryptedLiAt,
            encryptedJsessionid,
            fullName: 'Ingesting New Profile...', // Temp indicator
            avatarUrl: null,
            occupation: null,
            publicIdentifier: null,
            profileUrl: null
          },
        })
      ]);
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully.',
    });
  } catch (error: any) {
    console.error('Error saving settings API:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
