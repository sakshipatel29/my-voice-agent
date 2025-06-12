import { db } from "@/lib/firebaseAdmin";

export async function POST(request: Request) {
    const { doctorName, doctorExpertise, patientName, conversation, summary, timestamp } = await request.json();

    try {
        const conversationNote = {
            doctorName,
            doctorExpertise,
            patientName,
            conversation,
            summary,
            timestamp: timestamp || new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        await db.collection("conversation_notes").add(conversationNote);

        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error saving conversation note:", error);
        return Response.json({ success: false, error: error }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const doctorName = searchParams.get('doctorName');

    try {
        const collection = db.collection("conversation_notes");
        let query = collection.orderBy('timestamp', 'desc');
        
        if (doctorName) {
            query = query.where('doctorName', '==', doctorName);
        }

        const snapshot = await query.get();
        const notes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return Response.json({ success: true, notes }, { status: 200 });
    } catch (error) {
        console.error("Error fetching conversation notes:", error);
        return Response.json({ success: false, error: error }, { status: 500 });
    }
} 