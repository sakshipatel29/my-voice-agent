'use client';

import { useRef, useEffect } from 'react';
import { getVapi } from '@/lib/vapi.client';

export default function VoiceAssistant() {
  const vapiRef = useRef<any | null>(null);

  useEffect(() => {
    if (!vapiRef.current) {
      vapiRef.current = getVapi();

      // Verify the token is loaded
      console.log('VAPI token:', process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN);

      vapiRef.current.on('ready', () => {
        console.log('Vapi ready to start call');
      });

      vapiRef.current.on('message', (msg: any) => {
        console.log('Vapi message event:', msg);
      });

      vapiRef.current.on('error', (err: any) => {
        console.error('Vapi error:', err);
      });
    }
  }, []);

  const startCall = () => {
    if (!vapiRef.current) return;

    vapiRef.current.start({
      // No assistantId here—your Web Token scopes the correct assistant
      voice: 'echo-openai',  // choose a supported voice ID
      model: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        systemPrompt: `
You are Sakshi’s AI Responder.
When the caller asks about availability (e.g. “Is Sakshi available tomorrow at 11 AM?”), call:
  checkAvailability(startTime, endTime)
with ISO datetimes for the requested slot.
If the caller asks about something Sakshi asked you to remember, call:
  getNote(query)
with the relevant keyword.
If the caller instructs you to remember something new (“Please remember that…”), call:
  addNote(note)
with the full text.
Otherwise say: “I’m sorry, I don’t have that information right now, but I will let Sakshi know.”
Keep your tone friendly and professional.`,
        functions: [
          {
            name: 'checkAvailability',
            description: 'Check Sakshi’s Google Calendar availability',
            parameters: {
              type: 'object',
              properties: {
                startTime: {
                  type: 'string',
                  description: 'ISO start datetime, e.g. 2025-05-23T11:00:00-05:00'
                },
                endTime: {
                  type: 'string',
                  description: 'ISO end datetime, e.g. 2025-05-23T12:00:00-05:00'
                }
              },
              required: ['startTime', 'endTime']
            }
          },
          {
            name: 'getNote',
            description: 'Retrieve a stored note by keyword',
            parameters: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Keyword to search in saved notes'
                }
              },
              required: ['query']
            }
          },
          {
            name: 'addNote',
            description: 'Store a new note',
            parameters: {
              type: 'object',
              properties: {
                note: {
                  type: 'string',
                  description: 'Text of the note to save'
                }
              },
              required: ['note']
            }
          }
        ]
      },
      serverUrl: process.env.NEXT_PUBLIC_VAPI_WEBHOOK_URL  // your webhook endpoint
    });
  };

  return (
    <div className="p-4">
      <button
        onClick={startCall}
        className="px-4 py-2 bg-primary text-white rounded hover:opacity-90"
      >
        🎙️ Call Sakshi’s Assistant
      </button>
    </div>
  );
}
