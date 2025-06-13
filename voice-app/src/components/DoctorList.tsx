'use client';

import { useRef, useEffect, useState } from 'react';
import { getVapi } from '@/lib/vapi.client';
import { FaMicrophoneAlt, FaStop } from 'react-icons/fa';
import { doctorVapiConfig } from '@/lib/doctor-vapi';

interface Doctor {
  id: string;
  name: string;
  expertise: string;
}

const doctors: Doctor[] = [
  { id: '1', name: 'Dr. Sarah Johnson', expertise: 'Cardiology' },
  { id: '2', name: 'Dr. Michael Chen', expertise: 'Neurology' },
  { id: '3', name: 'Dr. Emily Rodriguez', expertise: 'Pediatrics' },
  { id: '4', name: 'Dr. James Wilson', expertise: 'Orthopedics' },
  { id: '5', name: 'Dr. Lisa Patel', expertise: 'Dermatology' },
  { id: '6', name: 'Dr. Robert Kim', expertise: 'Ophthalmology' },
  { id: '7', name: 'Dr. Maria Garcia', expertise: 'Gynecology' },
  { id: '8', name: 'Dr. David Thompson', expertise: 'Psychiatry' },
  { id: '9', name: 'Dr. Anna Lee', expertise: 'Endocrinology' },
  { id: '10', name: 'Dr. John Smith', expertise: 'General Medicine' },
];

export default function DoctorList() {
  const vapiRef = useRef<any | null>(null);
  const [activeDoctor, setActiveDoctor] = useState<Doctor | null>(null);
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
          setActiveDoctor(null);
        });

        vapiRef.current.on('message', (msg: any) => {
          console.log('📨 Vapi message:', msg);
        });

        vapiRef.current.on('error', (err: any) => {
          console.error('❌ Vapi error details:', err);
          setInCall(false);
          setActiveDoctor(null);
          let errorMessage = 'An error occurred with the voice assistant';

          if (err.status === 400) errorMessage = 'Invalid request. Please check your configuration.';
          else if (err.status === 401) errorMessage = 'Authentication failed. Please check your Vapi token.';
          else if (err.status === 403) errorMessage = 'Access denied. Please check your permissions.';
          else if (err.message) errorMessage = err.message;

          setError(errorMessage);
        });
      } catch (err) {
        console.error('Failed to initialize Vapi:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize voice assistant');
      }
    }
  }, []);

  const startCall = (doctor: Doctor) => {
    if (!vapiRef.current || inCall) return;

    const webhookUrl = process.env.NEXT_PUBLIC_VAPI_WEBHOOK_URL;
    if (!webhookUrl) {
      setError('Webhook URL is not configured. Please check your environment variables.');
      return;
    }

    const config = {
      ...doctorVapiConfig,
      name: `${doctor.name}'s AI Assistant`,
      serverUrl: webhookUrl,
      model: {
        ...doctorVapiConfig.model,
        systemPrompt: doctorVapiConfig.model.systemPrompt
          .replace('[Doctor\'s Name]', doctor.name)
          .replace('[Name]', doctor.name)
          .replace('[Specialty]', doctor.expertise)
      },
      metadata: {
        ...doctorVapiConfig.metadata,
        doctor: doctor.name,
        expertise: doctor.expertise,
        doctorName: doctor.name,
        doctorExpertise: doctor.expertise
      }
    };

    setActiveDoctor(doctor);
    try {
      vapiRef.current.start(config);
    } catch (err) {
      console.error('Failed to start call:', err);
      setError(err instanceof Error ? err.message : 'Failed to start call');
    }
  };

  const stopCall = () => {
    if (vapiRef.current && inCall) {
      try {
        vapiRef.current.stop();
      } catch (err) {
        console.error('Failed to stop call:', err);
        setError(err instanceof Error ? err.message : 'Failed to stop call');
      }
    }
  };

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-4 text-center">Sunrise Hospital</h1>

        <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
          Welcome to our hospital portal. Here you can find expert doctors across various specialties. 
          Use the <span className="font-medium text-blue-400">Call Doctor</span> button to contact a doctor directly for information or consultation. 
          If the doctor is unavailable, you can connect with their <span className="font-medium text-green-400">AI Assistant</span> for instant support.
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-100 text-red-700 border border-red-300">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {doctors.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-lg font-semibold text-gray-900">{doc.name}</div>
                <div className="text-sm text-gray-500">{doc.expertise}</div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => alert(`Calling ${doc.name}...`)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-white bg-green-400 hover:bg-green-500 text-sm font-medium shadow"
                >
                  <FaMicrophoneAlt /> Call Doctor
                </button>

                <button
                  onClick={() => startCall(doc)}
                  disabled={inCall}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium shadow ${
                    inCall ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-400 hover:bg-blue-500'
                  }`}
                >
                  <FaMicrophoneAlt /> Call AI Assistant
                </button>
              </div>
            </div>
          ))}
        </div>

        {inCall && activeDoctor && (
          <div className="fixed bottom-6 right-6 bg-white border border-gray-300 shadow-xl rounded-lg p-4 flex items-center gap-4 z-50">
            <p className="text-sm font-medium text-gray-800">
              Active Call with {activeDoctor.name}'s AI Assistant
            </p>
            <button
              onClick={stopCall}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-white bg-red-600 hover:bg-red-700 text-sm font-medium"
            >
              <FaStop /> End Call
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
