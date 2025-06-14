'use client';

import { useRef, useEffect, useState } from 'react';
import { getVapi } from '@/lib/vapi.client';
import { FaMicrophoneAlt, FaStop, FaCalendarAlt } from 'react-icons/fa';
import { doctorVapiConfig } from '@/lib/doctor-vapi';
import { Button } from './ui/button';
import AvailabilityChecker from './AvailabilityChecker';

interface Doctor {
  id: string;
  name: string;
  expertise: string;
}

interface Message {
  role: 'assistant' | 'patient';
  content: string;
  timestamp: string;
}

interface User {
  name: string;
}

const doctors: Doctor[] = [
  { id: '1', name: 'Dr. Sara Johnson', expertise: 'Cardiology' },
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showAvailability, setShowAvailability] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Fetch current user data
    fetch('/api/current-user')
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((error) => console.error('Failed to fetch user:', error));

    const token = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
    if (!token) {
      setError('Vapi token is not configured.');
      return;
    }

    vapiRef.current = getVapi();

    vapiRef.current.on('ready', () => {
      console.log('✅ Vapi ready');
    });

    vapiRef.current.on('start', () => {
      console.log('✅ Call started');
      setInCall(true);
    });

    vapiRef.current.on('call-end', () => {
      console.log('📞 Call ended');
      setInCall(false);
    });

    vapiRef.current.on('message', (msg: any) => {
      if (msg.type === 'transcript' && msg.transcriptType === 'final') {
        console.log('📝 Transcript:', msg.transcript);
        setMessages((prev) => [...prev, { role: msg.role, content: msg.transcript, timestamp: new Date().toISOString() }]);
      }
    });

    vapiRef.current.on('function-call', async (event: any) => {
      console.log("📞 Function call received from assistant:", event.name, event.args);

      const payload = {
        doctorName: activeDoctor?.name,
        doctorExpertise: activeDoctor?.expertise,
      };

      if (event.name === 'saveConsultation') {
        console.log("📝 Attempting to save consultation:", { ...payload, consultation: event.args });
        try {
          const response = await fetch('/api/save-consultation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, consultation: event.args }),
          });
          const result = await response.json();
          console.log("✅ Save consultation response:", result);
        } catch (error) {
          console.error("❌ Failed to save consultation:", error);
        }
      }

      if (event.name === 'saveConversationNote') {
        console.log("📝 Attempting to save conversation note:", {
          ...payload,
          patientName: event.args.patientName ?? 'Unknown',
          transcript: event.args.conversation,
          summary: event.args.summary,
        });
        try {
          const response = await fetch('/api/save-consultation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...payload,
              patientName: event.args.patientName ?? 'Unknown',
              transcript: event.args.conversation,
              summary: event.args.summary,
            }),
          });
          const result = await response.json();
          console.log("✅ Save conversation note response:", result);
        } catch (error) {
          console.error("❌ Failed to save conversation note:", error);
        }
      }
    });

    vapiRef.current.on('error', (err: any) => {
      console.error('❌ Vapi error:', err);
      setError('Something went wrong with the voice assistant.');
      setInCall(false);
      setActiveDoctor(null);
    });
  }, [activeDoctor]);

  const startCall = (doctor: Doctor) => {
    if (!vapiRef.current || inCall) return;

    const webhookUrl = process.env.NEXT_PUBLIC_VAPI_WEBHOOK_URL;
    if (!webhookUrl) {
      setError('Webhook URL is not configured.');
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
          .replace('[Specialty]', doctor.expertise),
      },
      metadata: {
        ...doctorVapiConfig.metadata,
        doctorName: doctor.name,
        doctorExpertise: doctor.expertise,
      },
    };

    setActiveDoctor(doctor);
    setInCall(true);

    try {
      vapiRef.current.start(config);
    } catch (err) {
      console.error('❌ Failed to start call:', err);
      setError('Failed to start the call.');
    }
  };

  const stopCall = () => {
    if (!vapiRef.current || !inCall) return;
    console.log("🛑 Stopping call...");
    try {
      vapiRef.current.stop();
    } catch (err) {
      console.error('❌ Failed to stop call:', err);
    }
  };

  const extractPatientName = (messages: Message[]): string => {
    // Look for patterns where the patient introduces themselves
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (msg.role === 'patient') {
        const content = msg.content.toLowerCase();
        
        // Check for common introduction patterns
        if (content.includes("i'm") || content.includes("i am") || content.includes("my name is")) {
          // Extract the name after the introduction phrase
          const nameMatch = msg.content.match(/(?:i'm|i am|my name is)\s+([^,.!?]+)/i);
          if (nameMatch && nameMatch[1]) {
            // Clean up the name (remove extra spaces, capitalize)
            const name = nameMatch[1].trim().split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
            return name;
          }
        }
      }
    }
    return 'Unknown';
  };

  const extractDisease = (messages: Message[]): string => {
    for (const msg of messages) {
      if (msg.role === 'patient') {
        const content = msg.content.toLowerCase();
        // Look for common disease/condition indicators
        if (content.includes('pain') || 
            content.includes('problem') || 
            content.includes('condition') || 
            content.includes('issue') || 
            content.includes('suffering from') ||
            content.includes('diagnosed with')) {
          return msg.content;
        }
      }
    }
    return 'Not specified';
  };

  const extractAge = (messages: Message[]): string => {
    for (const msg of messages) {
      if (msg.role === 'patient') {
        // Look for age patterns like "I am X years old" or "I'm X"
        const ageMatch = msg.content.match(/(?:i am|i'm|age is|my age is)\s+(\d+)(?:\s+years?)?/i);
        if (ageMatch) {
          return ageMatch[1];
        }
        // Also look for direct number mentions
        const directAgeMatch = msg.content.match(/\b(\d{1,2})\b/);
        if (directAgeMatch) {
          return directAgeMatch[1];
        }
      }
    }
    return 'Not specified';
  };

  const extractSymptoms = (messages: Message[]): string => {
    const symptoms: string[] = [];
    for (const msg of messages) {
      if (msg.role === 'patient') {
        const content = msg.content.toLowerCase();
        // Look for symptom indicators
        if (content.includes('symptom') || 
            content.includes('feeling') || 
            content.includes('experiencing') || 
            content.includes('having') ||
            content.includes('suffering from') ||
            content.includes('pain') ||
            content.includes('ache') ||
            content.includes('discomfort')) {
          symptoms.push(msg.content);
        }
      }
    }
    return symptoms.length > 0 ? symptoms.join(', ') : 'Not specified';
  };

  const extractAdvice = (messages: Message[]): string => {
    const advice: string[] = [];
    for (const msg of messages) {
      if (msg.role === 'assistant') {
        const content = msg.content.toLowerCase();
        // Look for advice indicators
        if (content.includes('recommend') || 
            content.includes('advise') || 
            content.includes('suggest') || 
            content.includes('should') ||
            content.includes('would suggest') ||
            content.includes('would recommend')) {
          // Remove the indicator words to get cleaner advice
          const cleanAdvice = msg.content
            .replace(/^(i would suggest|i would recommend|i recommend|i suggest|you should|i advise)/i, '')
            .trim();
          if (cleanAdvice && !advice.includes(cleanAdvice)) {
            advice.push(cleanAdvice);
          }
        }
      }
    }
    return advice.length > 0 ? advice.join(', ') : 'Not specified';
  };

  const extractNextSteps = (messages: Message[]): string => {
    const steps: string[] = [];
    for (const msg of messages) {
      if (msg.role === 'assistant') {
        const content = msg.content.toLowerCase();
        // Look for next steps indicators
        if (content.includes('next step') || 
            content.includes('follow up') || 
            content.includes('schedule') || 
            content.includes('appointment') ||
            content.includes('visit') ||
            content.includes('see a doctor') ||
            content.includes('make an appointment')) {
          steps.push(msg.content);
        }
      }
    }
    return steps.length > 0 ? steps.join(', ') : 'Not specified';
  };

  const extractSeverity = (messages: Message[]): string => {
    for (const msg of messages) {
      if (msg.role === 'patient') {
        const content = msg.content.toLowerCase();
        if (content.includes('severe') || content.includes('very bad') || content.includes('extreme')) {
          return 'Severe';
        } else if (content.includes('mild') || content.includes('slight') || content.includes('minor')) {
          return 'Mild';
        }
      }
    }
    return 'Moderate'; // Default to moderate if not specified
  };

  const saveConsultation = async () => {
    if (!activeDoctor || messages.length === 0 || !user) return;
    
    setIsSaving(true);
    try {
      const patientName = user.name;
      
      // Extract consultation details from the conversation
      const consultation = {
        disease: extractDisease(messages),
        age: extractAge(messages),
        symptoms: extractSymptoms(messages),
        severity: extractSeverity(messages),
        advice: extractAdvice(messages),
        nextSteps: extractNextSteps(messages),
      };
      
      // Create a summary from the conversation
      const summary = `Consultation with ${activeDoctor.name} (${activeDoctor.expertise}). Patient ${patientName} discussed their condition and received medical advice.`;
      
      const response = await fetch('/api/save-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorName: activeDoctor.name,
          doctorExpertise: activeDoctor.expertise,
          patientName: patientName,
          consultation: consultation,
          transcript: messages,
          summary: summary,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert(`Consultation saved successfully for ${patientName}!`);
      } else {
        throw new Error('Failed to save consultation');
      }
    } catch (error) {
      console.error('Failed to save consultation:', error);
      alert('Failed to save consultation. Please try again.');
    } finally {
      setIsSaving(false);
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
          Check their <span className="font-medium text-purple-400">availability</span> to schedule an appointment.
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

                <button
                  onClick={() => {
                    setSelectedDoctor(doc);
                    setShowAvailability(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-white bg-purple-400 hover:bg-purple-500 text-sm font-medium shadow"
                >
                  <FaCalendarAlt /> Check Availability
                </button>
              </div>
            </div>
          ))}
        </div>

        {showAvailability && selectedDoctor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Check {selectedDoctor.name}'s Availability
                </h2>
                <button
                  onClick={() => setShowAvailability(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <AvailabilityChecker doctorName={selectedDoctor.name} />
            </div>
          </div>
        )}

        {inCall && activeDoctor && (
          <div className="fixed bottom-6 right-6 bg-white border border-gray-300 shadow-xl rounded-lg p-4 flex items-center gap-4 z-50">
            <p className="text-sm font-medium text-gray-800">
              Active Call with {activeDoctor.name}'s AI Assistant
            </p>
            <Button
              onClick={stopCall}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-white bg-red-600 hover:bg-red-700 text-sm font-medium"
            >
              <FaStop /> End Call
            </Button>
          </div>
        )}

        {!inCall && messages.length > 0 && (
          <div className="fixed bottom-6 right-6 bg-white border border-gray-300 shadow-xl rounded-lg p-4 flex items-center gap-4 z-50">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setMessages([]);
                  setActiveDoctor(null);
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Cancel and clear conversation"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <Button
                onClick={saveConsultation}
                disabled={isSaving}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium ${
                  isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save Consultation'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
