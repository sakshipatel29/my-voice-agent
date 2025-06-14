import Consultations from '@/components/Consultations';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Doctor Consultation History',
};

type PageProps = {
  params: {
    id: string;
  };
};

export default function DoctorPage({ params }: PageProps) {
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
