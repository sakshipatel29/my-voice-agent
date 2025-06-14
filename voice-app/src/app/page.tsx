import Image from 'next/image';
// import AvailabilityChecker from '@/components/AvailabilityChecker';
// import VoiceAssistant from '@/components/VoiceAssistant';
// import NoteAdder from '@/components/NoteAdder';
import DoctorList from '@/components/DoctorList';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div >
          {/* <div className="component-wrapper">
            <AvailabilityChecker />
          </div>
          <div className="component-wrapper">
            <VoiceAssistant />
          </div>
          <div className="component-wrapper">
            <NoteAdder />
          </div> */}
            <>
            <Image
              src="/images/hospital-2.jpg"
              alt="Animated Hospital"
              width={900}
              height={300}
              className="mx-auto my-8 shadow-lg"
            />
            <DoctorList />
            </>
        </div>
    </main>
  );
}
