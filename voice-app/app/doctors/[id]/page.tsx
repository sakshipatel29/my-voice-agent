import Consultations from '@/components/Consultations';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Doctor Consultation History',
};

// ✅ Correct way to define props for dynamic route in App Router
type Props = {
  params: {
    id: string;
  };
};

export default async function DoctorPage({ params }: Props) {
  const doctorName = decodeURIComponent(params.id);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-blue-500">
        Consultations by {doctorName}
      </h1>
      <Consultations userId={doctorName} role="doctor" />
    </div>
  );
}

