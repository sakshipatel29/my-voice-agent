'use client';

import { useEffect, useState } from 'react';

interface ConsultationEntry {
  id: string;
  doctorName: string;
  doctorExpertise: string;
  patientName: string;
  createdAt: string;
  summary: string;
  consultation: {
    disease: string;
    age: string;
    symptoms: string;
    severity: string;
    advice: string;
    nextSteps: string;
    recommendedSpecialist?: string;
  };
  transcript: {
    role: 'assistant' | 'patient';
    content: string;
    timestamp: string;
  }[];
}

interface Props {
  userId: string;
  role: 'doctor' | 'patient';
}

export default function Consultations({ userId, role }: Props) {
  const [data, setData] = useState<ConsultationEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const res = await fetch(`/api/${role}/${userId}/consultations`);
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error('Failed to fetch consultations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, [userId, role]);

  if (loading) {
    return <p className="text-center text-gray-500">Loading consultations...</p>;
  }

  if (!data.length) {
    return <p className="text-center text-gray-400">No consultations found.</p>;
  }

  return (
    <div className="space-y-6">
      {data.map((entry) => (
        <div
          key={entry.id}
          className="bg-white shadow-md border border-gray-200 rounded-lg p-6"
        >
          <div className="mb-2">
            <h2 className="text-xl font-semibold text-gray-800">
              Consultation {role === 'doctor' ? `with ${entry.patientName}` : `with Dr. ${entry.doctorName}`}
            </h2>
            <p className="text-sm text-gray-500">
              {new Date(entry.createdAt).toLocaleString()} | Specialty: {entry.doctorExpertise}
            </p>
          </div>

          <div className="grid gap-2 text-sm text-gray-700">
            <p><strong>Disease:</strong> {entry.consultation?.disease || 'Not specified'}</p>
            <p><strong>Age:</strong> {entry.consultation?.age || 'Not specified'}</p>
            <p><strong>Symptoms:</strong> {entry.consultation?.symptoms || 'Not specified'}</p>
            <p><strong>Severity:</strong> {entry.consultation?.severity || 'Not specified'}</p>
            <p><strong>Advice:</strong> {entry.consultation?.advice || 'Not specified'}</p>
            <p><strong>Next Steps:</strong> {entry.consultation?.nextSteps || 'Not specified'}</p>
            {entry.consultation?.recommendedSpecialist && (
              <p><strong>Recommended Specialist:</strong> {entry.consultation.recommendedSpecialist}</p>
            )}
          </div>

          <div className="mt-4">
            <details className="text-sm text-blue-600">
              <summary className="cursor-pointer">View Full Transcript</summary>
              <div className="mt-2 border-l-2 border-blue-200 pl-4 space-y-1">
                {entry.transcript.map((msg, idx) => (
                  <div key={idx}>
                    <span className="font-medium">
                      {msg.role === 'assistant' ? 'AI Assistant' : 'Patient'}:
                    </span>{' '}
                    {msg.content}
                  </div>
                ))}
              </div>
            </details>
          </div>

          <div className="mt-2 text-sm text-gray-600 italic">
            <strong>Summary:</strong> {entry.summary}
          </div>
        </div>
      ))}
    </div>
  );
}
