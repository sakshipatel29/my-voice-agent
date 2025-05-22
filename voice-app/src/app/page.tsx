import AvailabilityChecker from '@/components/AvailabilityChecker';
import VoiceAssistant from '@/components/VoiceAssistant';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-row gap-12 items-center justify-center">
        <div className="w-full max-w-md">
          <AvailabilityChecker />
        </div>
        <div className="w-full max-w-md">
          <VoiceAssistant />
        </div>
      </div>
    </main>
  );
}
