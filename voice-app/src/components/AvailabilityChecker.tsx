'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { addMinutes } from 'date-fns';

export default function AvailabilityChecker() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    available?: boolean;
    message?: string;
    busySlots?: { start: string; end: string }[];
    error?: string;
  }>({});

  const checkAvailability = async () => {
    if (!startDate || !endDate) {
      setResult({ error: 'Please select both start and end times.' });
      return;
    }

    setLoading(true);
    setResult({});

    try {
      const res = await fetch('/api/calendar-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: 'Failed to fetch availability.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Check Calendar Availability</h2>

      <div className="grid grid-cols-1 gap-4 mb-4">
        <div>
          <label className="block mb-1 font-medium">Start Time</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => {
              setStartDate(date);
              // if endDate is before new startDate, bump it 1h ahead
              if (date && (!endDate || endDate <= date)) {
                setEndDate(addMinutes(date, 60));
              }
            }}
            showTimeSelect
            timeFormat="p"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            placeholderText="Select start..."
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">End Time</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            showTimeSelect
            timeFormat="p"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            placeholderText="Select end..."
            minDate={startDate || undefined}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <button
        onClick={checkAvailability}
        disabled={loading}
        className="w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {loading ? 'Checking…' : 'Check Availability'}
      </button>

      <div className="mt-6 space-y-2">
        {result.error && (
          <p className="text-red-500">{result.error}</p>
        )}
        {result.message && (
          <p className={`font-medium ${result.available ? 'text-green-600' : 'text-yellow-700'}`}>
            {result.message}
          </p>
        )}
        {result.busySlots && result.busySlots.length > 0 && (
          <ul className="list-disc list-inside text-sm text-gray-600">
            {result.busySlots.map((slot, i) => (
              <li key={i}>
                Busy from{' '}
                <strong>{new Date(slot.start).toLocaleString()}</strong> to{' '}
                <strong>{new Date(slot.end).toLocaleString()}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
