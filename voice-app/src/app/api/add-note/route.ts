import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { note } = body;

  if (!note) {
    return NextResponse.json({ error: 'Note is required' }, { status: 400 });
  }

  await db.collection('notes').add({
    content: note,
    createdAt: new Date(),
  });

  return NextResponse.json({ message: 'Note saved successfully' });
}
