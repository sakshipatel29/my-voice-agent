// src/app/api/auth/google-calendar/route.ts
import { NextRequest } from 'next/server';
import { getOAuthClient, SCOPES } from '@/lib/googleOAuth';

export async function GET(req: NextRequest) {
  const oauth2Client = getOAuthClient();

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  return Response.redirect(url);
}
