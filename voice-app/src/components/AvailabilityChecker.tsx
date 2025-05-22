'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { addMinutes } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

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
    <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">📅 Check Calendar Availability</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => {
              setStartDate(date);
              if (date && (!endDate || endDate <= date)) {
                setEndDate(addMinutes(date, 60));
              }
            }}
            showTimeSelect
            timeFormat="p"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            placeholderText="Select start time"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-primary 
              dark:bg-gray-800 dark:text-white dark:border-gray-600"

          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            showTimeSelect
            timeFormat="p"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            placeholderText="Select end time"
            minDate={startDate || undefined}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-primary 
              dark:bg-gray-800 dark:text-white dark:border-gray-600"

          />
        </div>

        <button
          onClick={checkAvailability}
          disabled={loading}
          className={`w-full py-2 rounded-lg font-semibold transition 
            text-white bg-primary hover:bg-blue-700 
            disabled:bg-gray-400 disabled:cursor-not-allowed 
            dark:bg-blue-500 dark:hover:bg-blue-600`}
        >
          {loading ? 'Checking…' : 'Check Availability'}
        </button>

        <div className="pt-4 space-y-2 text-sm">
          {result.error && (
            <p className="text-red-600 font-medium">{result.error}</p>
          )}

          {result.message && (
            <div className={`rounded-lg px-4 py-2 border ${result.available ? 'border-green-300 bg-green-50 text-green-700' : 'border-yellow-300 bg-yellow-50 text-yellow-800'}`}>
              {result.message}
            </div>
          )}

          {result.busySlots && result.busySlots.length > 0 && (
            <div className="mt-2">
              <p className="text-gray-700 font-medium mb-1">Busy Slots:</p>
              <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                {result.busySlots.map((slot, i) => (
                  <li key={i}>
                    <strong>{new Date(slot.start).toLocaleString()}</strong> → <strong>{new Date(slot.end).toLocaleString()}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
