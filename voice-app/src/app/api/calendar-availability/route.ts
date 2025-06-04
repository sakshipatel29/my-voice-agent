import { google } from 'googleapis';
import { db } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

// Helper to create OAuth client
function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    `${process.env.NEXTAUTH_URL}/api/auth/google-calendar/callback`
  );
}

export async function POST(req: NextRequest) {
  const { startTime, endTime } = await req.json();

  if (!startTime || !endTime) {
    return NextResponse.json({ error: 'Missing startTime or endTime' }, { status: 400 });
  }

  try {
    // Load saved tokens from Firestore
    const userDoc = await db.collection('users').doc('sakshi').get();
    const userData = userDoc.data();

    if (!userData?.tokens) {
      return NextResponse.json({ error: 'No calendar credentials found' }, { status: 403 });
    }

    const oauth2Client = getOAuthClient();
    oauth2Client.setCredentials(userData.tokens);

    // Add token refresh handler
    oauth2Client.on('tokens', async (tokens) => {
      if (tokens.refresh_token) {
        // Store the new refresh token
        await userDoc.ref.update({
          tokens: {
            ...userData.tokens,
            refresh_token: tokens.refresh_token
          }
        });
      }
      // Store the new access token
      await userDoc.ref.update({
        tokens: {
          ...userData.tokens,
          access_token: tokens.access_token,
          expiry_date: tokens.expiry_date
        }
      });
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Query for free/busy status
    const result = await calendar.freebusy.query({
      requestBody: {
        timeMin: startTime,
        timeMax: endTime,
        items: [{ id: 'primary' }],
      },
    });

    const busy = result.data.calendars?.primary?.busy || [];
    const isFree = busy.length === 0;

    return NextResponse.json({
      available: isFree,
      busySlots: busy,
      message: isFree
        ? 'User is available during that time.'
        : 'User is busy during that time.',
    });
  } catch (err: any) {
    console.error('[Calendar Check Error]', err.message);
    if (err.message === 'invalid_grant') {
      return NextResponse.json({ 
        error: 'Calendar access has expired. Please re-authenticate.',
        needsReauth: true 
      }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to check calendar' }, { status: 500 });
  }
}
