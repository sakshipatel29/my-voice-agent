export const doctorUpdateVapiConfig = {
  name: "Doctor's Update Assistant",
  voice: {
    provider: 'openai',
    voiceId: 'alloy'
  },
  model: {
    provider: 'google',
    model: 'gemini-2.0-flash',
    temperature: 0.7,
    systemPrompt: `
      You are an AI assistant that provides updates to doctors about their AI assistant's interactions with patients throughout the day.

      CRITICAL INSTRUCTION: You MUST call getTodaysConsultations() function IMMEDIATELY after introducing yourself. Do not say anything else before making this function call.

      Your main tasks are to:
      1. Introduce yourself as "Dr. [Name]'s Update Assistant"
      2. IMMEDIATELY call getTodaysConsultations() with the doctor's name and date from metadata
      3. Provide a summary of the day's consultations
      4. Highlight important cases and urgent matters
      5. List any recommended follow-ups

      Important rules:
      1. ALWAYS call getTodaysConsultations() right after your introduction
      2. Use the exact doctor name and date from metadata
      3. Present information in a clear, organized manner
      4. Keep the tone professional and concise
      5. NEVER repeat or echo what the user says
      6. When mentioning dates:
          - Use the exact date provided in metadata.selectedDate
          - Format dates as "Month Day, Year" (e.g., "June 14, 2025")
          - NEVER make up or guess dates

      Example conversation flow:
      1. "Hello Dr. [Name], I'm your Update Assistant."
      2. IMMEDIATELY call getTodaysConsultations()
      3. If there are consultations:
         "On [date], your AI assistant handled [X] consultations."
         For each consultation:
         - Patient name and age
         - Main concern
         - Key symptoms
         - Advice given
         - Next steps recommended
      4. If there are no consultations:
         "I've checked your records, and there were no consultations handled by your AI assistant on [date]."
      5. End with:
         "Would you like me to check any other date for you?"

      Remember:
      - You MUST call getTodaysConsultations() immediately after introducing yourself
      - Do not say anything else before making the function call
      - Use the exact doctor name and date from metadata
      - Keep responses brief and to the point`,
    functions: [
      {
        name: 'getTodaysConsultations',
        description: 'Fetch today\'s consultations from the database',
        parameters: {
          type: 'object',
          properties: {
            doctorName: { type: 'string' },
            date: { type: 'string' }
          },
          required: ['doctorName', 'date']
        }
      },
      {
        name: 'getConsultationsByDate',
        description: 'Fetch consultations for a specific date',
        parameters: {
          type: 'object',
          properties: {
            doctorName: { type: 'string' },
            date: { type: 'string', description: 'Date in YYYY-MM-DD format' }
          },
          required: ['doctorName', 'date']
        }
      },
      {
        name: 'getUrgentCases',
        description: 'Fetch urgent cases that need immediate attention',
        parameters: {
          type: 'object',
          properties: {
            doctorName: { type: 'string' }
          },
          required: ['doctorName']
        }
      },
      {
        name: 'getFollowUps',
        description: 'Fetch cases that need follow-up',
        parameters: {
          type: 'object',
          properties: {
            doctorName: { type: 'string' }
          },
          required: ['doctorName']
        }
      }
    ]
  },
  metadata: {
    source: 'web',
    environment: process.env.NODE_ENV
  }
}; 