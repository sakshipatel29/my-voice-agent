'use client';

import { useRef, useEffect, useState } from 'react';
import { getVapi } from '@/lib/vapi.client';
import { FaMicrophoneAlt, FaStop } from 'react-icons/fa';

export default function VoiceAssistant() {
  const vapiRef = useRef<any | null>(null);
  const [inCall, setInCall] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vapiRef.current) {
      const token = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
      if (!token) {
        setError('Vapi token is not configured. Please check your environment variables.');
        return;
      }

      try {
        vapiRef.current = getVapi();
        console.log('VAPI token:', token);

        vapiRef.current.on('ready', () => {
          console.log('✅ Vapi ready');
          setError(null);
        });

        vapiRef.current.on('start', () => {
          console.log('✅ Call started');
          setInCall(true);
          setError(null);
        });

        vapiRef.current.on('end', () => {
          console.log('📞 Call ended');
          setInCall(false);
        });

        vapiRef.current.on('message', (msg: any) => {
          console.log('📨 Vapi message:', msg);
        });

        vapiRef.current.on('error', (err: any) => {
          console.error('❌ Vapi error details:', {
            message: err.message,
            status: err.status,
            data: err.data,
            type: err.type,
            url: err.url
          });
          setInCall(false);
          let errorMessage = 'An error occurred with the voice assistant';
          
          if (err.status === 400) {
            errorMessage = 'Invalid request. Please check your configuration.';
          } else if (err.status === 401) {
            errorMessage = 'Authentication failed. Please check your Vapi token.';
          } else if (err.status === 403) {
            errorMessage = 'Access denied. Please check your permissions.';
          } else if (err.message) {
            errorMessage = err.message;
          }
          
          setError(errorMessage);
        });
      } catch (err) {
        console.error('Failed to initialize Vapi:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize voice assistant');
      }
    }
  }, []);

  const startCall = () => {
    if (!vapiRef.current || inCall) return;
    console.log('▶️ Start Call button clicked');

    const webhookUrl = process.env.NEXT_PUBLIC_VAPI_WEBHOOK_URL;
    if (!webhookUrl) {
      setError('Webhook URL is not configured. Please check your environment variables.');
      return;
    }

    const config = {
      voice: {
        provider: 'openai',
        voiceId: 'alloy'
      },
      model: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
        systemPrompt: `
          You are Sakshi's AI Responder. Your main tasks are to check calendar availability and manage notes.

          When someone asks about availability, ALWAYS use the checkAvailability function with specific times.
          For example:
          - "Is Sakshi available tomorrow at 2 PM?" -> Use checkAvailability with tomorrow at 2 PM
          - "Can I meet Sakshi on Friday at 3 PM?" -> Use checkAvailability with Friday at 3 PM
          - "When is Sakshi free today?" -> Use checkAvailability with today's time slots

          Example function calls:
          1) To check availability:
          {"name":"checkAvailability","arguments":{"startTime":"2024-03-20T14:00:00-05:00","endTime":"2024-03-20T15:00:00-05:00"}}

          2) To retrieve a note:
          {"name":"getNote","arguments":{"query":"meeting"}}

          3) To save a note:
          {"name":"addNote","arguments":{"note":"Caller wants to meet Sakshi at 2 PM tomorrow"}}

          Important rules:
          1. ALWAYS use checkAvailability when asked about scheduling or availability
          2. ALWAYS include both startTime and endTime in ISO format
          3. If someone asks about availability without a specific time, suggest a time and use checkAvailability
          4. If you're unsure about the time, ask for clarification
          5. Never say "I don't have that information" for availability questions - always try to check the calendar

          If the request is not about availability or notes, say:
          "I'm sorry, I can only help with checking Sakshi's availability and managing notes. Would you like to check her availability for a specific time?"`,
        functions: [
          {
            name: 'checkAvailability',
            description: 'Check calendar availability for a specific time slot',
            parameters: {
              type: 'object',
              properties: {
                startTime: { 
                  type: 'string',
                  description: 'Start time in ISO format (e.g., 2024-03-20T14:00:00-05:00)'
                },
                endTime: { 
                  type: 'string',
                  description: 'End time in ISO format (e.g., 2024-03-20T15:00:00-05:00)'
                },
              },
              required: ['startTime', 'endTime'],
            },
          },
          {
            name: 'getNote',
            description: 'Retrieve a saved note by searching for keywords',
            parameters: {
              type: 'object',
              properties: {
                query: { 
                  type: 'string',
                  description: 'Search term to find relevant notes'
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'addNote',
            description: 'Store a new note about a meeting or request',
            parameters: {
              type: 'object',
              properties: {
                note: { 
                  type: 'string',
                  description: 'The note content to store'
                },
              },
              required: ['note'],
            },
          },
        ],
      },
      serverUrl: webhookUrl,
      metadata: {
        source: 'web',
        environment: process.env.NODE_ENV
      }
    };

    console.log('Payload:', config);
    
    try {
      vapiRef.current.start(config);
    } catch (err) {
      console.error('Failed to start call:', err);
      setError(err instanceof Error ? err.message : 'Failed to start call');
    }
  };

  const stopCall = () => {
    if (vapiRef.current && inCall) {
      console.log('⛔ Stopping call');
      try {
        vapiRef.current.stop();
      } catch (err) {
        console.error('Failed to stop call:', err);
        setError(err instanceof Error ? err.message : 'Failed to stop call');
      }
    }
  };

  return (
    <div className="voice-assistant">
      <h2 className="voice-assistant-title">🎧 Voice Assistant</h2>
      <p className="voice-assistant-description">
        Click to start a voice call with Sakshi's AI responder. You can ask about availability or saved notes.
      </p>

      {error && (
        <div className="error-card">
          {error}
        </div>
      )}

      <div className="voice-assistant-buttons">
        <button
          onClick={startCall}
          disabled={inCall || !!error}
          className={`voice-assistant-button ${inCall ? 'button-disabled' : 'button-start'}`}
        >
          <FaMicrophoneAlt />
          Start Call
        </button>

        <button
          onClick={stopCall}
          disabled={!inCall}
          className={`voice-assistant-button ${!inCall ? 'button-disabled' : 'button-stop'}`}
        >
          <FaStop />
          Stop Call
        </button>
      </div>

      <p className="voice-assistant-status">
        {inCall ? '📞 Call in progress…' : error ? '❌ Error occurred' : '✅ Ready to take your call.'}
      </p>
    </div>
  );
}
