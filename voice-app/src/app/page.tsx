// import AvailabilityChecker from '@/components/AvailabilityChecker';
// import VoiceAssistant from '@/components/VoiceAssistant';
// import NoteAdder from '@/components/NoteAdder';
import DoctorList from '@/components/DoctorList';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container">
        <div className="components-grid">
          {/* <div className="component-wrapper">
            <AvailabilityChecker />
          </div>
          <div className="component-wrapper">
            <VoiceAssistant />
          </div>
          <div className="component-wrapper">
            <NoteAdder />
          </div> */}
          <div className="component-wrapper">
            <DoctorList />
          </div>
        </div>
      </div>
    </main>
  );
}
