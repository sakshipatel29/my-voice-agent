'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { addMinutes } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

// Add custom styles for the date picker
const customDatePickerStyles = `
  .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item {
    color: black !important;
  }
  .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected {
    background-color: #60A5FA !important;
    color: white !important;
  }
  .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item:hover {
    background-color: #E5E7EB !important;
  }
`;

interface AvailabilityCheckerProps {
  doctorName?: string;
}

export default function AvailabilityChecker({ doctorName }: AvailabilityCheckerProps) {
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
          doctorName: doctorName,
        }),
      });
      const data = await res.json();
      
      if (data.needsReauth) {
        window.location.href = '/api/auth/google-calendar';
        return;
      }
      
      setResult(data);
    } catch (err) {
      setResult({ error: 'Failed to fetch availability.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <style>{customDatePickerStyles}</style>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Start Time</label>
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition text-black"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">End Time</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            showTimeSelect
            timeFormat="p"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            placeholderText="Select end time"
            minDate={startDate || undefined}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition text-black"
          />
        </div>
      </div>

      <button
        onClick={checkAvailability}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition ${
          loading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-400 hover:bg-blue-500 shadow-sm'
        }`}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Checking...
          </span>
        ) : 'Check Availability'}
      </button>

      <div className="space-y-4">
        {result.error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{result.error}</p>
          </div>
        )}

        {result.message && (
          <div className={`p-4 rounded-lg border ${
            result.available 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <p className={`text-sm ${
              result.available ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {result.message}
            </p>
          </div>
        )}

        {result.busySlots && result.busySlots.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Busy Time Slots:</h3>
            <div className="space-y-2">
              {result.busySlots.map((slot, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="h-2 w-2 rounded-full bg-red-400"></div>
                  <div className="flex-1 text-sm text-gray-600">
                    <span>{new Date(slot.start).toLocaleString()}</span>
                    <span className="mx-2 text-gray-400">→</span>
                    <span>{new Date(slot.end).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
