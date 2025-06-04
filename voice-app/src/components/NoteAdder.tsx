'use client';

import { useState } from 'react';

export default function NoteAdder() {
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'idle';
    message: string;
  }>({ type: 'idle', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) {
      setStatus({ type: 'error', message: 'Please enter a note' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const response = await fetch('/api/add-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save note');
      }

      setStatus({ type: 'success', message: 'Note saved successfully!' });
      setNote('');
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Failed to save note' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="note-adder">
      <h2 className="note-adder-title">📝 Add Note</h2>
      <p className="note-adder-description">
        Type your note below and it will be saved for future reference.
      </p>

      <form onSubmit={handleSubmit} className="note-adder-form">
        <div className="form-group">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Type your note here..."
            className="note-input"
            rows={4}
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`note-submit-button ${isSubmitting ? 'button-disabled' : ''}`}
        >
          {isSubmitting ? (
            <span className="loading-spinner">
              <svg className="spinner" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </span>
          ) : (
            'Save Note'
          )}
        </button>

        {status.type !== 'idle' && (
          <div className={`note-status ${status.type}`}>
            {status.message}
          </div>
        )}
      </form>
    </div>
  );
} 