import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let profile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: {
        settings: true,
      },
    });

    if (!profile) {
      // Fallback create if trigger failed to initialize it
      profile = await prisma.profile.create({
        data: {
          id: user.id,
          fullName: user.email?.split('@')[0] || 'User',
          occupation: '',
          profileUrl: '',
        },
        include: {
          settings: true,
        },
      });
    }

    // Hide sensitive encrypted values
    const { encryptedLiAt, encryptedJsessionid, ...safeProfile } = profile as any;
    
    return NextResponse.json({ 
      success: true, 
      profile: {
        ...safeProfile,
        hasCookies: !!(profile.encryptedLiAt && profile.encryptedJsessionid),
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      }
    });
  } catch (error: any) {
    console.error('Error fetching profile API:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
