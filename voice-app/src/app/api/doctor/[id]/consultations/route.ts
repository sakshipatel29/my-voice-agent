import { db } from '@/firebase/admin';
import { NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const snapshot = await db
      .collection('consultations')
      .where('doctorName', '==', decodeURIComponent(params.id))
      .get();

    const consultations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(consultations);
  } catch (error) {
    console.error('❌ Failed to fetch consultations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
