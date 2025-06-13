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
          
            <DoctorList />
        </div>
    </main>
  );
}
