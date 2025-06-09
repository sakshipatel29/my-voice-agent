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
          console.error('❌ Vapi error details:', {
            message: err.message,
            status: err.status,
            data: err.data,
            type: err.type,
            url: err.url
          });
          setInCall(false);
          setActiveDoctor(null);
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

  const startCall = (doctor: Doctor) => {
    if (!vapiRef.current || inCall) return;
    console.log('▶️ Start Call button clicked for', doctor.name);

    const webhookUrl = process.env.NEXT_PUBLIC_VAPI_WEBHOOK_URL;
    if (!webhookUrl) {
      setError('Webhook URL is not configured. Please check your environment variables.');
      return;
    }

    const config = {
      ...doctorVapiConfig,
      name: `${doctor.name}'s AI Assistant`,
      serverUrl: webhookUrl,
      metadata: {
        ...doctorVapiConfig.metadata,
        doctor: doctor.name,
        expertise: doctor.expertise
      }
    };

    console.log('Payload:', config);
    
    try {
      setActiveDoctor(doctor);
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
    <div className="doctor-list">
      <h1 className="doctor-list-title">Home Page</h1>

      <p className="doctor-list-description">
        Welcome to our hospital portal. Here you can find expert doctors across various specialties. 
        Use the <span className="font-medium text-blue-600">Call Doctor</span> button to contact a doctor directly for information or consultation. 
        If the doctor is unavailable, you can connect with their <span className="font-medium text-green-600">AI Assistant</span> for instant support.
      </p>

      {error && (
        <div className="error-card">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {doctors.map((doc) => (
          <div
            key={doc.id}
            className="doctor-card"
          >
            <div className="doctor-info">
              <div className="doctor-name">{doc.name}</div>
              <div className="doctor-expertise">{doc.expertise}</div>
            </div>

            <div className="doctor-actions">
              <button
                onClick={() => alert(`Calling ${doc.name}...`)}
                className="doctor-button button-call"
              >
                <FaMicrophoneAlt />
                Call Doctor
              </button>

              <button
                onClick={() => startCall(doc)}
                disabled={inCall}
                className={`doctor-button button-ai ${inCall ? 'button-disabled' : ''}`}
              >
                <FaMicrophoneAlt />
                Call AI Assistant
              </button>
            </div>
          </div>
        ))}
      </div>

      {inCall && activeDoctor && (
        <div className="active-call">
          <p className="active-call-title">Active Call with {activeDoctor.name}'s AI Assistant</p>
          <button
            onClick={stopCall}
            className="doctor-button button-call"
          >
            <FaStop />
            End Call
          </button>
        </div>
      )}
    </div>
  );
} 