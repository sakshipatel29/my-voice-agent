import { db } from '@/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { doctorName } = await req.json();

    if (!doctorName) {
      return NextResponse.json({ error: 'Missing doctor name' }, { status: 400 });
    }

    // Query urgent cases for the specified doctor
    const urgentCasesRef = db.collection('consultations')
      .where('doctorName', '==', doctorName)
      .where('severity', '==', 'High')
      .where('status', 'in', ['pending', 'needs_review']);

    const snapshot = await urgentCasesRef.get();
    const urgentCases = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ urgentCases });
  } catch (error) {
    console.error('Error fetching urgent cases:', error);
    return NextResponse.json({ error: 'Failed to fetch urgent cases' }, { status: 500 });
  }
} 