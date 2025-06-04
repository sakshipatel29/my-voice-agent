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
    <div className="availability-checker">
      <div className="header">
        <div className="icon-wrapper">
          <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="title">Check Availability</h2>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="label">Start Time</label>
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
            className="date-picker"
          />
        </div>

        <div className="form-group">
          <label className="label">End Time</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            showTimeSelect
            timeFormat="p"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            placeholderText="Select end time"
            minDate={startDate || undefined}
            className="date-picker"
          />
        </div>
      </div>

      <button
        onClick={checkAvailability}
        disabled={loading}
        className="button"
      >
        {loading ? (
          <span className="loading-spinner">
            <svg className="spinner" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Checking...
          </span>
        ) : 'Check Availability'}
      </button>

      <div className="results">
        {result.error && (
          <div className="result-card error-card">
            <p>{result.error}</p>
          </div>
        )}

        {result.message && (
          <div className={`result-card ${result.available ? 'success-card' : 'warning-card'}`}>
            <p>{result.message}</p>
          </div>
        )}

        {result.busySlots && result.busySlots.length > 0 && (
          <div className="busy-slots">
            <p className="busy-slots-title">Busy Slots:</p>
            <ul className="busy-slots-list">
              {result.busySlots.map((slot, i) => (
                <li key={i} className="busy-slot-item">
                  <span className="slot-indicator"></span>
                  <span>{new Date(slot.start).toLocaleString()}</span>
                  <span>→</span>
                  <span>{new Date(slot.end).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
