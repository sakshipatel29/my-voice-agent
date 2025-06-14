import { db } from '@/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const consultationId = context.params.id;
    
    // Delete the consultation document
    await db.collection('consultations').doc(consultationId).delete();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Failed to delete consultation:', error);
    return NextResponse.json(
      { error: 'Failed to delete consultation' },
      { status: 500 }
    );
  }
} 