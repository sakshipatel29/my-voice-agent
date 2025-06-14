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
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this consultation?')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/consultations/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete consultation');
      }

      // Remove the deleted consultation from the state
      setData(data.filter(entry => entry.id !== id));
    } catch (err) {
      console.error('Failed to delete consultation:', err);
      alert('Failed to delete consultation. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

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
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Consultation {role === 'doctor' ? `with ${entry.patientName}` : `with Dr. ${entry.doctorName}`}
              </h2>
              <p className="text-sm text-gray-500">
                {new Date(entry.createdAt).toLocaleString()} | Specialty: {entry.doctorExpertise}
              </p>
            </div>
            <button
              onClick={() => handleDelete(entry.id)}
              disabled={deletingId === entry.id}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deletingId === entry.id ? 'Deleting...' : 'Delete'}
            </button>
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
