// src/app/api/auth/google-calendar/callback/route.ts
import { NextRequest } from 'next/server';
import { getOAuthClient } from '@/lib/googleOAuth';
import { db } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return new Response('Missing code parameter', { status: 400 });
  }

  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);

  // Save tokens under hardcoded user ID "sakshi"
  await db.collection('users').doc('sakshi').set({
    tokens,
    createdAt: new Date(),
  });

  return new Response('Google Calendar connected! You can close this tab.');
}
