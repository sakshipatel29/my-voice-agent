import { db } from '@/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

interface Consultation {
  id: string;
  patientName: string;
  age: string;
  disease: string;
  symptoms: string;
  severity: string;
  advice: string;
  nextSteps: string;
  summary: string;
  doctorName: string;
  doctorExpertise: string;
  createdAt: string;
  transcript: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const { doctorName, date } = await req.json();
    console.log("🔍 Searching for consultations:", { doctorName, date });

    if (!doctorName || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Convert the input date to start and end of day in ISO format
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    console.log("📅 Date range:", {
      start: startOfDay.toISOString(),
      end: endOfDay.toISOString()
    });

    // Query consultations for the specified doctor and date range
    const consultationsRef = db.collection('consultations')
      .where('doctorName', '==', doctorName)
      .where('createdAt', '>=', startOfDay.toISOString())
      .where('createdAt', '<=', endOfDay.toISOString());

    const snapshot = await consultationsRef.get();
    console.log("📊 Found consultations:", snapshot.size);

    let consultations: Consultation[] = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log("📄 Consultation data:", { id: doc.id, ...data });
      return {
        id: doc.id,
        ...data
      } as Consultation;
    });

    // If no consultations found, return a hardcoded one
    if (consultations.length === 0) {
      console.log("📝 No consultations found, returning hardcoded consultation");
      consultations = [{
        id: 'hardcoded-consultation',
        patientName: 'Sakshi R Patel',
        age: '23',
        disease: 'Chest Pain',
        symptoms: 'Sharp pain in left side of chest',
        severity: 'Moderate',
        advice: 'Rest and avoid strenuous activities',
        nextSteps: 'Schedule ECG and follow-up in 2 weeks',
        summary: 'Patient reported chest pain for 2 days. Recommended ECG and follow-up.',
        doctorName: doctorName,
        doctorExpertise: 'Cardiology',
        createdAt: startOfDay.toISOString(),
        transcript: [
          {
            role: 'patient',
            content: 'I have been experiencing chest pain',
            timestamp: '2024-03-20T10:00:00Z'
          },
          {
            role: 'assistant',
            content: 'How long have you been experiencing this?',
            timestamp: '2024-03-20T10:01:00Z'
          },
          {
            role: 'patient',
            content: 'About a week',
            timestamp: '2024-03-20T10:02:00Z'
          }
        ]
      }];
    }

    return NextResponse.json({ consultations });
  } catch (error) {
    console.error('❌ Error fetching consultations:', error);
    return NextResponse.json({ error: 'Failed to fetch consultations' }, { status: 500 });
  }
} 