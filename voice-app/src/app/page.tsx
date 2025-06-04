import AvailabilityChecker from '@/components/AvailabilityChecker';
import VoiceAssistant from '@/components/VoiceAssistant';
import NoteAdder from '@/components/NoteAdder';

export default function Home() {
  return (
    <main className="main-content">
      <div className="container">
        <div className="components-grid">
          <div className="component-wrapper">
            <AvailabilityChecker />
          </div>
          <div className="component-wrapper">
            <VoiceAssistant />
          </div>
          <div className="component-wrapper">
            <NoteAdder />
          </div>
        </div>
      </div>
    </main>
  );
}
