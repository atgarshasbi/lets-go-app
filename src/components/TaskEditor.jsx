import { useState } from 'react';
import { EMOJI_OPTIONS } from '../data/defaultData';

export default function TaskEditor({ task, onSave, onCancel }) {
  const [emoji, setEmoji] = useState(task?.emoji || '⭐');
  const [label, setLabel] = useState(task?.label || '');

  function handleSave() {
    const trimmed = label.trim();
    if (!trimmed) return;
    onSave({ ...(task || {}), emoji, label: trimmed });
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      onClick={e => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm">
        <h3 className="text-xl font-black text-purple-700 mb-4">
          {task ? '✏️ Edit Task' : '✨ New Task'}
        </h3>

        <p className="text-sm font-bold text-gray-500 mb-2">Pick an emoji:</p>
        <div className="grid grid-cols-8 gap-1 mb-4 max-h-36 overflow-y-auto border-2 border-purple-100 rounded-xl p-2 bg-gray-50">
          {EMOJI_OPTIONS.map(e => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={[
                'text-2xl p-1 rounded-lg transition active:scale-90',
                emoji === e ? 'bg-purple-200 scale-110' : 'hover:bg-gray-200',
              ].join(' ')}
            >
              {e}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{emoji}</span>
          <input
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="e.g. Brush Teeth"
            autoFocus
            className="flex-1 border-2 border-purple-200 focus:border-purple-500 rounded-xl px-4 py-2 text-lg font-bold outline-none transition"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!label.trim()}
            className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition active:scale-95 disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
