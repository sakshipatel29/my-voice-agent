import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const segments = url.pathname.split('/');
    const patientId = segments[segments.indexOf('patient') + 1];
    const patientName = decodeURIComponent(patientId);

    console.log('🔍 Fetching consultations for patient:', patientName);

    const snapshot = await db
      .collection('consultations')
      .where('patientName', '==', patientName)
      .orderBy('createdAt', 'desc')
      .get();

    console.log('📊 Found consultations:', snapshot.size);

    const consultations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log('✅ Returning consultations:', consultations);
    return NextResponse.json(consultations);
  } catch (error) {
    console.error('❌ Failed to fetch patient consultations:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      {
        error: 'Server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
