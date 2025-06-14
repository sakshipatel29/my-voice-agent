import Consultations from '@/components/Consultations';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Consultations',
};

export default function PatientPage({ params }: { params: { id: string } }) {
  const patientName = decodeURIComponent(params.id);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-blue-500">Your Consultations</h1>
      <Consultations userId={patientName} role="patient" />
    </div>
  );
}
