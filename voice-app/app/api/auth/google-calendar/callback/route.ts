import { NextRequest, NextResponse } from 'next/server';
import { getOAuthClient } from '@/lib/googleOAuth';
import { db } from '@/firebase/admin';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/?error=No code provided', req.url));
  }

  try {
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    
    // Store tokens in Firestore
    await db.collection('users').doc('sakshi').set({
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        scope: tokens.scope,
        token_type: tokens.token_type,
        expiry_date: tokens.expiry_date,
      }
    }, { merge: true });

    // Redirect back to the main page
    return NextResponse.redirect(new URL('/', req.url));
  } catch (error: any) {
    console.error('Error getting tokens:', error);
    return NextResponse.redirect(new URL('/?error=Failed to authenticate', req.url));
  }
} 