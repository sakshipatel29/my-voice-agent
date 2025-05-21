import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { db } from '@/lib/firebaseAdmin';
import { getOAuthClient } from '@/lib/googleOAuth';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const message = body.message;

  if (!message || message.type !== 'function-call') {
    // Not a function call—ignore or return OK
    return NextResponse.json({}, { status: 200 });
  }

  const { name: funcName, parameters } = message.functionCall;
  let params: Record<string, any> = {};
  try {
    params = parameters ? JSON.parse(parameters) : {};
  } catch {
    // malformed parameters
  }

  try {
    // Handle calendar availability
    if (funcName === 'checkAvailability') {
      const { startTime, endTime } = params;
      // load tokens
      const userDoc = await db.collection('users').doc('sakshi').get();
      const userData = userDoc.data();
      if (!userData?.tokens) throw new Error('No calendar credentials');

      const oauth2Client = getOAuthClient();
      oauth2Client.setCredentials(userData.tokens);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const fb = await calendar.freebusy.query({
        requestBody: {
          timeMin: startTime,
          timeMax: endTime,
          items: [{ id: 'primary' }],
        },
      });
      const busy = fb.data.calendars?.primary?.busy || [];
      const isFree = busy.length === 0;
      const resultMsg = isFree
        ? 'User is available during that time.'
        : 'User is busy during that time.';

      return NextResponse.json({ result: resultMsg });
    }

    // Handle retrieving a note
    if (funcName === 'getNote') {
      const { query } = params;
      const snapshot = await db.collection('notes').get();
      let foundNote: string | null = null;
      snapshot.forEach((doc) => {
        const content = doc.data().content as string;
        if (
          query &&
          content.toLowerCase().includes((query as string).toLowerCase())
        ) {
          foundNote = content;
        }
      });
      const resultMsg = foundNote
        ? `Here's what I know: ${foundNote}`
        : "I don't have any info on that yet.";
      return NextResponse.json({ result: resultMsg });
    }

    // Handle adding a note
    if (funcName === 'addNote') {
      const { note } = params;
      if (note) {
        await db.collection('notes').add({
          content: note,
          createdAt: new Date(),
        });
      }
      return NextResponse.json({ result: "I've noted that." });
    }

    // Unknown function
    return NextResponse.json({ result: 'Function not implemented.' });
  } catch (err: any) {
    console.error('[Vapi Webhook Error]', err);
    return NextResponse.json(
      { result: 'Sorry, there was an error handling that request.' },
      { status: 500 }
    );
  }
}
