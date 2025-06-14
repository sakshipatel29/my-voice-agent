import { db } from '@/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { doctorName } = await req.json();

    if (!doctorName) {
      return NextResponse.json({ error: 'Missing doctor name' }, { status: 400 });
    }

    // Query follow-up cases for the specified doctor
    const followUpsRef = db.collection('consultations')
      .where('doctorName', '==', doctorName)
      .where('needsFollowUp', '==', true)
      .where('status', 'in', ['pending', 'scheduled']);

    const snapshot = await followUpsRef.get();
    const followUps = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ followUps });
  } catch (error) {
    console.error('Error fetching follow-ups:', error);
    return NextResponse.json({ error: 'Failed to fetch follow-ups' }, { status: 500 });
  }
} 