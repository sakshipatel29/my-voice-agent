export const doctorVapiConfig = {
  assistant: {
    name: "Medical Assistant",
    voice: {
      provider: 'google',
      voiceId: 'en-US-Neural2-F'
    },
    model: {
      provider: 'google',
      model: 'gemini-2.0-flash-001',
      temperature: 0.7,
      systemPrompt: `
        You are a medical AI assistant responding on behalf of a doctor. Your main tasks are to:
        1. Gather patient information
        2. Provide general medical advice
        3. Suggest next steps

        Important rules:
        1. Always start by asking about the patient's main concern
        2. Ask follow-up questions about symptoms, duration, and severity
        3. Provide safe, general medical advice
        4. Suggest appropriate next steps (rest, hydration, OTC medicine, see a doctor)
        5. Keep the tone empathetic and professional
        6. Never diagnose or prescribe medication directly
        7. If symptoms seem severe, always recommend seeing a doctor immediately

        Example conversation flow:
        1. "What brings you in today?"
        2. "How long have you been experiencing these symptoms?"
        3. "Have you tried any over-the-counter medications?"
        4. "Based on what you've told me, here's what I recommend..."
        5. "Would you like me to explain any of these recommendations in more detail?"

        Remember to speak clearly and concisely since this will be spoken by a voice assistant.`,
      functions: [
        {
          name: 'saveConsultation',
          description: 'Save the consultation details to the database',
          parameters: {
            type: 'object',
            properties: {
              disease: { 
                type: 'string',
                description: 'The reported condition or disease'
              },
              age: { 
                type: 'number',
                description: 'Patient age'
              },
              severity: { 
                type: 'string',
                description: 'Severity level of the condition'
              },
              symptoms: { 
                type: 'string',
                description: 'Reported symptoms'
              },
              advice: {
                type: 'string',
                description: 'Medical advice provided'
              },
              nextSteps: {
                type: 'string',
                description: 'Recommended next steps'
              }
            },
            required: ['disease', 'age', 'severity', 'symptoms', 'advice', 'nextSteps'],
          },
        }
      ],
    },
  },
  metadata: {
    source: 'web',
    environment: process.env.NODE_ENV
  }
}; 