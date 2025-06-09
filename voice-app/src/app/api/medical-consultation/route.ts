import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/lib/firebaseAdmin";

export async function POST(request: Request) {
    const { disease, age, severity, symptoms, userid } = await request.json();

    try {
        const { text: agentResponse } = await generateText({
            model: google("gemini-2.0-flash-001"),
            prompt: `
                You are a virtual medical assistant responding on behalf of a doctor.

                The patient has reported the following:
                - Reported Condition: ${disease}
                - Age: ${age}
                - Severity level: ${severity}
                - Additional symptoms (if any): ${symptoms || "Not specified"}

                Based on this information:
                1. Ask one or two clarifying questions if needed.
                2. Give safe, general medical advice.
                3. Suggest possible next steps (e.g., rest, hydration, OTC medicine, see a doctor urgently).
                4. Keep the tone empathetic and professional.
                5. Avoid diagnosing or prescribing medication directly.

                Speak clearly and concisely, since this will be spoken by a voice assistant.
                `,
        });

        const patient_interaction = {
            userId: userid,
            disease,
            age,
            severity,
            symptoms,
            agentResponse,
            finalized: true,
            createdAt: new Date().toISOString(),
          };

        await db.collection("patient_interactions").add(patient_interaction);

        return Response.json({ success: true, response: agentResponse }, { status: 200 });

    } catch (error) {
        console.error("Error:", error);
        return Response.json({ success: false, error: error }, { status: 500 });
    }
}

export async function GET() {
    return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
} 