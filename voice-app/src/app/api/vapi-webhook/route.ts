// src/app/api/vapi-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { db } from '@/lib/firebaseAdmin';
import { getOAuthClient } from '@/lib/googleOAuth';
import { addHours, parseISO, formatISO } from 'date-fns';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const message = body.message;
  if (!message || message.type !== 'function-call') {
    return NextResponse.json({}, { status: 200 });
  }

  const { name: funcName, parameters } = message.functionCall;
  let params: Record<string, any> = {};
  try { params = parameters ? JSON.parse(parameters) : {}; }
  catch { /* ignore */ }

  try {
    // --- checkAvailability ---
    if (funcName === 'checkAvailability') {
      const { startTime, endTime } = params;
      const userDoc = await db.collection('users').doc('sakshi').get();
      const tokens = userDoc.data()?.tokens;
      if (!tokens) throw new Error('No Google tokens');

      const oauth2 = getOAuthClient();
      oauth2.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth: oauth2 });

      // 1) Check the requested slot
      const fb = await calendar.freebusy.query({
        requestBody: {
          timeMin: startTime,
          timeMax: endTime,
          items: [{ id: 'primary' }],
        },
      });
      const busy = fb.data.calendars?.primary?.busy || [];

      if (busy.length === 0) {
        // Save a note about the meeting request
        await db.collection('notes').add({
          content: `Caller wants to meet Sakshi at ${startTime}`,
          timestamp: new Date(),
        });
        return NextResponse.json({
          result: `Sakshi is available at that time. I will let her know that you want to see her then.`
        });
      }

      // 2) Search for next 1-hour free slot (up to 8 hours out)
      let suggestion: string | null = null;
      let candidateStart = parseISO(endTime);
      for (let i = 0; i < 8; i++) {
        const candidateEnd = addHours(candidateStart, 1);
        const slotFB = await calendar.freebusy.query({
          requestBody: {
            timeMin: formatISO(candidateStart),
            timeMax: formatISO(candidateEnd),
            items: [{ id: 'primary' }],
          },
        });
        const slotBusy = slotFB.data.calendars?.primary?.busy || [];
        if (slotBusy.length === 0) {
          suggestion = `Sakshi is busy at the requested time, but she is next available from ${formatISO(candidateStart)} to ${formatISO(candidateEnd)}.`;
          // Optionally log this suggestion
          await db.collection('notes').add({
            content: `Suggested meeting time: ${formatISO(candidateStart)}`,
            timestamp: new Date(),
          });
          break;
        }
        candidateStart = candidateEnd;
      }

      if (suggestion) {
        return NextResponse.json({ result: suggestion });
      } else {
        return NextResponse.json({
          result: `Sakshi is busy during that period and I couldn’t find an open hour today. Would you like to try another day?`
        });
      }
    }

    // --- getNote ---
    if (funcName === 'getNote') {
      const { query } = params;
      const snapshot = await db.collection('notes').get();
      let found: string | null = null;
      snapshot.forEach(doc => {
        const txt = doc.data().content as string;
        if (query && txt.toLowerCase().includes(query.toLowerCase())) {
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
      const { note } = params;
      if (note) {
        await db.collection('notes').add({
          content: note,
          timestamp: new Date(),
        });
        return NextResponse.json({ result: "I've noted that." });
      }
      return NextResponse.json({ result: "Nothing to note." });
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
