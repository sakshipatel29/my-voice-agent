// import { db } from '@/firebase/admin';
// import { NextRequest, NextResponse } from 'next/server';

// export async function DELETE(request: NextRequest) {
//   try {
//     const url = new URL(request.url);
//     const segments = url.pathname.split('/');
//     const consultationId = segments[segments.length - 1];

//     if (!consultationId) {
//       return NextResponse.json({ error: 'Missing consultation ID' }, { status: 400 });
//     }

//     // Delete the consultation document
//     await db.collection('consultations').doc(consultationId).delete();

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error('❌ Failed to delete consultation:', error);
//     return NextResponse.json(
//       { error: 'Failed to delete consultation' },
//       { status: 500 }
//     );
//   }
// }
