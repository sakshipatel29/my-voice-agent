// src/app/api/save-consultation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin'; // make sure this is your Firestore admin setup

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📥 Incoming consultation body:", body); // ✅ log the full payload

    const {
      doctorName,
      doctorExpertise,
      patientName,
      consultation = null,
      transcript = [],
      summary = '',
    } = body;

    if (!patientName) {
      return NextResponse.json({ success: false, error: 'Patient name is required' }, { status: 400 });
    }

    const now = new Date();
    const docRef = await db.collection('consultations').add({
      doctorName,
      doctorExpertise,
      patientName,
      consultation,
      transcript,
      summary,
      createdAt: now.toISOString(),
      date: now.toISOString().split('T')[0], // Add date field in YYYY-MM-DD format
    });

    console.log("✅ Firestore write successful:", docRef.id);
    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('❌ Error saving consultation:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
