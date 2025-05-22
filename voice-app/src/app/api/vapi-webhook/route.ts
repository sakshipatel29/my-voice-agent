// src/app/api/vapi-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { db } from '@/lib/firebaseAdmin';
import { getOAuthClient } from '@/lib/googleOAuth';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const message = body.message;

  // Only handle function calls
  if (!message || message.type !== 'function-call') {
    return NextResponse.json({}, { status: 200 });
  }

  const { name: funcName, parameters } = message.functionCall;
  let params: Record<string, any> = {};
  try {
    params = parameters ? JSON.parse(parameters) : {};
  } catch {
    // ignore parse errors
  }

  try {
    // --- checkAvailability ---
    if (funcName === 'checkAvailability') {
      const userDoc = await db.collection('users').doc('sakshi').get();
      const tokens = userDoc.data()?.tokens;
      if (!tokens) throw new Error('No Google tokens found');

      const oauth2 = getOAuthClient();
      oauth2.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth: oauth2 });

      const fb = await calendar.freebusy.query({
        requestBody: {
          timeMin: params.startTime,
          timeMax: params.endTime,
          items: [{ id: 'primary' }],
        },
      });
      const busy = fb.data.calendars?.primary?.busy || [];
      const result = busy.length
        ? 'User is busy during that time.'
        : 'User is available during that time.';

      return NextResponse.json({ result });
    }

    // --- getNote ---
    if (funcName === 'getNote') {
      const snapshot = await db.collection('notes').get();
      let found: string | null = null;
      snapshot.forEach((doc) => {
        const txt = doc.data().content as string;
        if (
          params.query &&
          txt.toLowerCase().includes((params.query as string).toLowerCase())
        ) {
          found = txt;
        }
      });
      const result = found
        ? `Here's what I know: ${found}`
        : "I don't have any info on that yet.";
      return NextResponse.json({ result });
    }

    // --- addNote ---
    if (funcName === 'addNote') {
      if (params.note) {
        await db.collection('notes').add({
          content: params.note,
          timestamp: new Date(),
        });
      }
      return NextResponse.json({ result: "I've noted that." });
    }

    // Unknown function
    return NextResponse.json({ result: 'Function not implemented.' });
  } catch (error: any) {
    console.error('[vapi-webhook] error:', error);
    return NextResponse.json(
      { result: 'Sorry, there was an error handling your request.' },
      { status: 500 }
    );
  }
}
