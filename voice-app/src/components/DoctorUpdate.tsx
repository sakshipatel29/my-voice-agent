'use client';

import { useRef, useEffect, useState } from 'react';
import { getVapi } from '@/lib/vapi.client';
import { doctorUpdateVapiConfig } from '@/lib/doctor-update-vapi';
import { FaMicrophoneAlt, FaStop } from 'react-icons/fa';
import { Button } from './ui/button';

export default function DoctorUpdate() {
  const vapiRef = useRef<any>(null);
  const [inCall, setInCall] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: 'assistant' | 'doctor'; content: string; timestamp: string }[]>([]);

  // Hardcoded values
  const HARDCODED_DOCTOR_NAME = "Dr. Sara Johnson";
  const HARDCODED_DATE = "2025-06-14";

  useEffect(() => {
    if (!vapiRef.current) {
      vapiRef.current = getVapi();
      
      vapiRef.current.on('call-start', () => {
        console.log("📞 Call started");
        setInCall(true);
      });

      vapiRef.current.on('call-end', () => {
        console.log("📞 Call ended");
        setInCall(false);
      });

      vapiRef.current.on('error', (error: any) => {
        console.error("Error:", error);
        setError(error.message);
      });

      vapiRef.current.on('message', (msg: any) => {
        if (msg.type === 'transcript' && msg.transcriptType === 'final') {
          setMessages((prev) => [...prev, { role: msg.role, content: msg.transcript, timestamp: new Date().toISOString() }]);
        }
      });

      // Set up function call handler
      vapiRef.current.on('function-call', async (event: any) => {

        if (event.name === 'getTodaysConsultations') {
          try {
            console.log(" Fetching consultations for:", { 
              date: HARDCODED_DATE, 
              doctor: HARDCODED_DOCTOR_NAME 
            });
            
            const response = await fetch('/api/get-consultations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                doctorName: HARDCODED_DOCTOR_NAME,
                date: HARDCODED_DATE
              }),
            });
            const data = await response.json();
            
            if (data.consultations?.length > 0) {
              console.log("📄 First consultation:", data.consultations[0]);
            }
            return data;
          } catch (error) {
            console.error("Failed to fetch consultations:", error);
            return { error: 'Failed to fetch consultations' };
          }
        }

        if (event.name === 'getConsultationsByDate') {
          try {
            console.log(" Fetching consultations for:", { 
              date: HARDCODED_DATE, 
              doctor: HARDCODED_DOCTOR_NAME 
            });
            
            const response = await fetch('/api/get-consultations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                doctorName: HARDCODED_DOCTOR_NAME,
                date: HARDCODED_DATE
              }),
            });
            const data = await response.json();
            console.log("Consultations found:", data.consultations?.length || 0);
            if (data.consultations?.length > 0) {
              console.log("First consultation:", data.consultations[0]);
            }
            return data;
          } catch (error) {
            console.error("Failed to fetch consultations:", error);
            return { error: 'Failed to fetch consultations' };
          }
        }

        if (event.name === 'getConsultationDetails') {
          try {
            const { consultationId } = event.args;
            console.log("🔍 Fetching details for consultation:", consultationId);
            
            const response = await fetch(`/api/get-consultation/${consultationId}`);
            const data = await response.json();
            console.log("Consultation details:", data);
            return data;
          } catch (error) {
            console.error("Failed to fetch consultation details:", error);
            return { error: 'Failed to fetch consultation details' };
          }
        }

        return { error: 'Unknown function call' };
      });
    }

    return () => {
      if (vapiRef.current) {
        vapiRef.current = null;
      }
    };
  }, []);

  const startCall = () => {
    if (!vapiRef.current || inCall) return;

    const webhookUrl = process.env.NEXT_PUBLIC_VAPI_WEBHOOK_URL;
    if (!webhookUrl) {
      setError('Webhook URL is not configured.');
      return;
    }

    const config = {
      ...doctorUpdateVapiConfig,
      name: `${HARDCODED_DOCTOR_NAME}'s Update Assistant`,
      serverUrl: webhookUrl,
      model: {
        ...doctorUpdateVapiConfig.model,
        systemPrompt: doctorUpdateVapiConfig.model.systemPrompt
          .replace('[Name]', HARDCODED_DOCTOR_NAME),
      },
      metadata: {
        ...doctorUpdateVapiConfig.metadata,
        doctorName: HARDCODED_DOCTOR_NAME,
        selectedDate: HARDCODED_DATE,
      },
    };

    setInCall(true);

    try {
      vapiRef.current.start(config);
    } catch (err) {
      console.error('Failed to start call:', err);
      setError('Failed to start the call.');
    }
  };

  const stopCall = () => {
    if (!vapiRef.current || !inCall) return;
    
    try {
      vapiRef.current.stop();
    } catch (err) {
      console.error('Failed to stop call:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-md font-semibold text-gray-700">Daily Update Assistant</h2>
        <div className="flex items-center gap-4">
          <Button
            onClick={inCall ? stopCall : startCall}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-white ${
              inCall 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-blue-400 hover:bg-blue-500'
            }`}
          >
            {inCall ? (
              <>
                <FaStop /> End Call
              </>
            ) : (
              <>
                <FaMicrophoneAlt /> Start Update
              </>
            )}
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {messages.length > 0 && (
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg ${
                msg.role === 'assistant'
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <p className="text-sm text-gray-700">{msg.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 