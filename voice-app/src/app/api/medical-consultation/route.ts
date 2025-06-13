import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";

export async function POST(request: Request) {
    const { disease, age, severity, symptoms, userid, doctorName, doctorExpertise } = await request.json();

    try {
        const { text: agentResponse } = await generateText({
            model: google("gemini-2.0-flash-001"),
            prompt: `
                You are a virtual medical assistant responding on behalf of Dr. ${doctorName}, who is a specialist in ${doctorExpertise}.

                Start your response with: "Hello, I am Dr. ${doctorName}'s AI assistant. Dr. ${doctorName} is a specialist in ${doctorExpertise} and might be busy at the moment. How can I help you today?"

                The patient has reported the following:
                - Reported Condition: ${disease}
                - Age: ${age}
                - Severity level: ${severity}
                - Additional symptoms (if any): ${symptoms || "Not specified"}

                Based on this information and your expertise in ${doctorExpertise}:
                1. Ask one or two clarifying questions if needed.
                2. Give safe, general medical advice from the perspective of a ${doctorExpertise} specialist.
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
            doctorName,
            doctorExpertise,
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