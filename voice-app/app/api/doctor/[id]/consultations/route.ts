import { db } from '@/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const segments = url.pathname.split('/');
    const doctorId = segments[segments.indexOf('doctor') + 1];

    if (!doctorId) {
      return NextResponse.json({ error: 'Doctor ID is missing' }, { status: 400 });
    }

    const snapshot = await db
      .collection('consultations')
      .where('doctorName', '==', decodeURIComponent(doctorId))
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
