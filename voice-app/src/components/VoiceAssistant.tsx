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

      vapiRef.current.on('ready', () => console.log('Vapi ready'));
      vapiRef.current.on('start', () => setInCall(true));
      vapiRef.current.on('end', () => setInCall(false));
      vapiRef.current.on('message', (msg: any) => console.log('Vapi message:', msg));
      vapiRef.current.on('error', (err: any) => {
        console.error('Vapi error:', err);
        setInCall(false);
      });
    }
  }, []);

  const startCall = () => {
    if (!vapiRef.current || inCall) return;
    vapiRef.current.start({
      voice: 'echo-openai',
      model: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        systemPrompt: `
You are Sakshi’s AI Responder.

1) Availability:
{"name":"checkAvailability","arguments":{"startTime":"2025-05-23T11:00:00-05:00","endTime":"2025-05-23T12:00:00-05:00"}}

2) Retrieve a note:
{"name":"getNote","arguments":{"query":"Grandma"}}

3) Save a note:
{"name":"addNote","arguments":{"note":"Caller wants to meet Sakshi at 2 PM tomorrow"}}

If none apply, say:
“I’m sorry, I don’t have that information right now, but I will let Sakshi know.”`,
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
      vapiRef.current.stop();
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6 flex flex-col items-center justify-center space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">🎧 Voice Assistant</h2>
      <p className="text-sm text-gray-500 text-center">
        Click to start a voice call with Sakshi’s AI responder. You can ask about availability or saved notes.
      </p>

      <div className="flex gap-4 mt-4">
        <button
          onClick={startCall}
          disabled={inCall}
          className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium shadow-sm transition ${
            inCall
              ? 'bg-gray-300 text-white cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          <FaMicrophoneAlt />
          Start Call
        </button>

        <button
          onClick={stopCall}
          disabled={!inCall}
          className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium shadow-sm transition ${
            !inCall
              ? 'bg-gray-300 text-white cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          <FaStop />
          Stop Call
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-2">
        {inCall ? 'Call in progress…' : 'Ready to take your call.'}
      </p>
    </div>
  );
}
