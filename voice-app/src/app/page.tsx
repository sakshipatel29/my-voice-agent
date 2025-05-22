import AvailabilityChecker from '@/components/AvailabilityChecker';
import VoiceAssistant from '@/components/VoiceAssistant';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <AvailabilityChecker />
      <VoiceAssistant />
    </main>
  );
}
