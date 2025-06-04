'use client';

import { useRef, useEffect, useState } from 'react';
import { getVapi } from '@/lib/vapi.client';
import { FaMicrophoneAlt, FaStop } from 'react-icons/fa';

export default function VoiceAssistant() {
  const vapiRef = useRef<any | null>(null);
  const [inCall, setInCall] = useState(false);

  useEffect(() => {
    if (!vapiRef.current) {
      vapiRef.current = getVapi();
      console.log('VAPI token:', process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN);

      vapiRef.current.on('ready', () => console.log('✅ Vapi ready'));
      vapiRef.current.on('start', () => {
        console.log('✅ Call started');
        setInCall(true);
      });
      vapiRef.current.on('end', () => {
        console.log('📞 Call ended');
        setInCall(false);
      });
      vapiRef.current.on('message', (msg: any) => {
        console.log('📨 Vapi message:', msg);
      });
      vapiRef.current.on('error', (err: any) => {
        console.error('❌ Vapi error:', err);
        setInCall(false);
      });
    }
  }, []);

  const startCall = () => {
    if (!vapiRef.current || inCall) return;
    console.log('▶️ Start Call button clicked');
    console.log('Payload:', {
      voice: 'alloy-openai',
      model: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        // ...
      },
      serverUrl: process.env.NEXT_PUBLIC_VAPI_WEBHOOK_URL,
    });
    
    vapiRef.current.start({
      voice: 'alloy-openai',
      model: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        systemPrompt: `
          You are Sakshi's AI Responder.

          1) Availability:
          {"name":"checkAvailability","arguments":{"startTime":"2025-05-23T11:00:00-05:00","endTime":"2025-05-23T12:00:00-05:00"}}

          2) Retrieve a note:
          {"name":"getNote","arguments":{"query":"Grandma"}}

          3) Save a note:
          {"name":"addNote","arguments":{"note":"Caller wants to meet Sakshi at 2 PM tomorrow"}}

          If none apply, say:
          "I'm sorry, I don't have that information right now, but I will let Sakshi know."`,
        functions: [
          {
            name: 'checkAvailability',
            description: 'Check calendar availability',
            parameters: {
              type: 'object',
              properties: {
                startTime: { type: 'string' },
                endTime: { type: 'string' },
              },
              required: ['startTime', 'endTime'],
            },
          },
          {
            name: 'getNote',
            description: 'Retrieve a saved note',
            parameters: {
              type: 'object',
              properties: {
                query: { type: 'string' },
              },
              required: ['query'],
            },
          },
          {
            name: 'addNote',
            description: 'Store a new note',
            parameters: {
              type: 'object',
              properties: {
                note: { type: 'string' },
              },
              required: ['note'],
            },
          },
        ],
      },
      serverUrl: process.env.NEXT_PUBLIC_VAPI_WEBHOOK_URL,
    });
  };

  const stopCall = () => {
    if (vapiRef.current && inCall) {
      console.log('⛔ Stopping call');
      vapiRef.current.stop();
    }
  };

  return (
    <div className="voice-assistant">
      <h2 className="voice-assistant-title">🎧 Voice Assistant</h2>
      <p className="voice-assistant-description">
        Click to start a voice call with Sakshi's AI responder. You can ask about availability or saved notes.
      </p>

      <div className="voice-assistant-buttons">
        <button
          onClick={startCall}
          disabled={inCall}
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
        {inCall ? '📞 Call in progress…' : '✅ Ready to take your call.'}
      </p>
    </div>
  );
}
