import { useState } from 'react';
import { useTheme } from '../theme';

// Our own Function relays this to our inbox via SendGrid — no email address ever ships in the app.
const CONTACT_ENDPOINT = 'https://lets-go-license-api-bhfjcdapdvaph5dv.centralus-01.azurewebsites.net/api/contact';
const SUBJECT_MAX = 100;
const MESSAGE_MAX = 1000;

export default function ContactModal({ onClose }) {
  const theme = useTheme();
  const [subject, setSubject] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [hp, setHp] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | ok | err

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, email, message, hp }),
      });
      setStatus(res.ok ? 'ok' : 'err');
    } catch {
      setStatus('err');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl p-5 w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black" style={{ color: theme.primary }}>✉️ Contact Us</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {status === 'ok' ? (
          <p className="text-center text-green-600 font-bold py-6">
            ✅ Thanks! We&apos;ll get back to you soon.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-bold text-gray-600 mb-1">Subject</label>
            <input
              name="subject"
              type="text"
              maxLength={SUBJECT_MAX}
              required
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full border-2 border-gray-200 focus:outline-none rounded-xl px-3 py-2 font-bold mb-1 transition"
              onFocus={e => (e.target.style.borderColor = theme.primary)}
              onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
            />
            <p className="text-xs text-gray-400 text-right mb-3">{subject.length}/{SUBJECT_MAX}</p>

            <label className="block text-sm font-bold text-gray-600 mb-1">Your email (so we can reply)</label>
            <input
              name="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border-2 border-gray-200 focus:outline-none rounded-xl px-3 py-2 font-bold mb-3 transition"
              onFocus={e => (e.target.style.borderColor = theme.primary)}
              onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
            />

            <label className="block text-sm font-bold text-gray-600 mb-1">Message</label>
            <textarea
              name="message"
              maxLength={MESSAGE_MAX}
              required
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full border-2 border-gray-200 focus:outline-none rounded-xl px-3 py-2 font-bold mb-1 transition resize-none"
              onFocus={e => (e.target.style.borderColor = theme.primary)}
              onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
            />
            <p className="text-xs text-gray-400 text-right mb-3">{message.length}/{MESSAGE_MAX}</p>

            <input
              type="text"
              name="hp"
              value={hp}
              onChange={e => setHp(e.target.value)}
              tabIndex="-1"
              autoComplete="off"
              style={{ display: 'none' }}
            />

            {status === 'err' && (
              <p className="text-sm font-bold text-red-500 mb-3">❌ Something went wrong. Please try again.</p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-3 text-white font-bold rounded-xl transition active:scale-95 disabled:opacity-60"
              style={{ backgroundColor: theme.primary }}
            >
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
