import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import SettingsClient from './SettingsClient';

export const revalidate = 0; // Disable static cache for real-time settings data

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  // Direct server database query for optimal load speed (0ms network latency to DB)
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

  // Map to historical array types
  const mappedHistory = refreshHistory.map(log => ({
    id: log.id,
    status: log.status,
    errorMessage: log.errorMessage,
    postsFetched: log.postsFetched,
    createdAt: log.createdAt.toISOString(),
  }));

  return (
    <SettingsClient 
      initialTheme={settings?.theme || 'dark'}
      initialAutoRefresh={settings?.autoRefresh || false}
      initialHasCookies={!!(profile?.encryptedLiAt && profile?.encryptedJsessionid)}
      initialRefreshHistory={mappedHistory}
      initialUserEmail={user.email || ''}
    />
  );
}
