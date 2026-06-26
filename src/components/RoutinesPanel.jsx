import { useState } from 'react';
import { useTheme } from '../theme';
import { EMOJI_OPTIONS } from '../data/defaultData';

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); onChange(); }}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${
        checked ? 'bg-green-400' : 'bg-gray-300'
      }`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`} />
    </button>
  );
}

function EmojiStrip({ selected, onSelect }) {
  return (
    <div className="flex gap-1 overflow-x-auto py-2 mt-1">
      {EMOJI_OPTIONS.map(e => (
        <button
          key={e}
          type="button"
          onClick={() => onSelect(e)}
          className={`text-xl flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg transition ${
            selected === e ? 'bg-purple-100 ring-2 ring-purple-400' : 'hover:bg-gray-100'
          }`}
        >
          {e}
        </button>
      ))}
    </div>
  );
}

function SectionCard({
  section, expanded, onToggleExpand, onToggleEnabled,
  onDeleteSection, onDeleteTask, taskDraft, onTaskDraftChange, onAddTask, theme,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const enabled = section.enabled !== false;

  return (
    <div className={`bg-white rounded-2xl shadow overflow-hidden transition-opacity ${!enabled ? 'opacity-55' : ''}`}>
      {/* Section header row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={onToggleExpand}
      >
        <span className="text-2xl">{section.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-black text-gray-800 text-sm leading-tight">{section.title}</p>
          <p className="text-xs text-gray-400 font-bold">{section.tasks.length} task{section.tasks.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <Toggle checked={enabled} onChange={onToggleEnabled} />
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-gray-500 font-bold px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
              >No</button>
              <button
                onClick={onDeleteSection}
                className="text-xs text-white font-bold px-2 py-1 rounded-lg bg-red-500 hover:bg-red-600 transition"
              >Delete</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-gray-300 hover:text-red-400 transition px-1 text-lg"
            >🗑</button>
          )}
        </div>

        <span className={`text-gray-400 text-sm transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </div>

      {/* Expanded task list + add row */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4">
          {section.tasks.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-3 font-bold">No tasks yet — add one below</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {section.tasks.map(task => (
                <li key={task.id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                  <span className="text-lg">{task.emoji}</span>
                  <span className="flex-1 text-sm font-bold text-gray-700">{task.label}</span>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="text-gray-300 hover:text-red-400 transition font-black text-xl leading-none"
                  >×</button>
                </li>
              ))}
            </ul>
          )}

          {/* Add task row */}
          <div className="mt-3">
            <div className="flex gap-2 items-center">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(p => !p)}
                className="w-10 h-10 text-xl flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-xl transition flex-shrink-0"
                title="Pick emoji"
              >
                {taskDraft.emoji || '⭐'}
              </button>
              <input
                type="text"
                placeholder="Add a task..."
                value={taskDraft.label || ''}
                onChange={e => onTaskDraftChange({ ...taskDraft, label: e.target.value })}
                onKeyDown={e => { if (e.key === 'Enter') { onAddTask(); setShowEmojiPicker(false); } }}
                className="flex-1 border-2 border-gray-200 focus:border-purple-400 rounded-xl px-3 py-2 text-sm font-bold outline-none transition"
              />
              <button
                onClick={() => { onAddTask(); setShowEmojiPicker(false); }}
                disabled={!taskDraft.label?.trim()}
                className="font-black text-white text-sm px-3 py-2 rounded-xl transition disabled:opacity-40 flex-shrink-0"
                style={{ backgroundColor: theme.primary }}
              >
                Add
              </button>
            </div>
            {showEmojiPicker && (
              <EmojiStrip
                selected={taskDraft.emoji}
                onSelect={e => { onTaskDraftChange({ ...taskDraft, emoji: e }); setShowEmojiPicker(false); }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NewSectionForm({ draft, onChange, onCreate, onCancel, theme }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <p className="text-sm font-black text-gray-600 mb-3">New Routine</p>
      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={() => setShowEmojiPicker(p => !p)}
          className="w-10 h-10 text-xl flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-xl transition flex-shrink-0"
          title="Pick emoji"
        >
          {draft.emoji || '📋'}
        </button>
        <input
          type="text"
          placeholder="Routine name (e.g. Meal Time)"
          value={draft.label || ''}
          onChange={e => onChange({ ...draft, label: e.target.value })}
          onKeyDown={e => { if (e.key === 'Enter') onCreate(); }}
          className="flex-1 border-2 border-gray-200 focus:border-purple-400 rounded-xl px-3 py-2 text-sm font-bold outline-none transition"
          autoFocus
        />
      </div>
      {showEmojiPicker && (
        <EmojiStrip
          selected={draft.emoji}
          onSelect={e => { onChange({ ...draft, emoji: e }); setShowEmojiPicker(false); }}
        />
      )}
      <div className="flex gap-2 mt-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2 border-2 border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          onClick={onCreate}
          disabled={!draft.label?.trim()}
          className="flex-1 py-2 text-white font-black rounded-xl transition disabled:opacity-40"
          style={{ backgroundColor: theme.primary }}
        >
          Create
        </button>
      </div>
    </div>
  );
}

export default function RoutinesPanel({ sections, setSections }) {
  const theme = useTheme();
  const [expandedId, setExpandedId] = useState(null);
  const [taskDrafts, setTaskDrafts] = useState({});
  const [newSection, setNewSection] = useState(null);

  function toggleEnabled(id) {
    setSections(prev => prev.map(s =>
      s.id === id ? { ...s, enabled: !(s.enabled !== false) } : s
    ));
  }

  function deleteSection(id) {
    setSections(prev => prev.filter(s => s.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  function deleteTask(sectionId, taskId) {
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, tasks: s.tasks.filter(t => t.id !== taskId) } : s
    ));
  }

  function addTask(sectionId) {
    const draft = taskDrafts[sectionId] || {};
    if (!draft.label?.trim()) return;
    const task = {
      id: `task-${Date.now()}`,
      emoji: draft.emoji || '⭐',
      label: draft.label.trim(),
    };
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, tasks: [...s.tasks, task] } : s
    ));
    setTaskDrafts(prev => ({ ...prev, [sectionId]: { emoji: '⭐', label: '' } }));
  }

  function createSection() {
    if (!newSection?.label?.trim()) return;
    const s = {
      id: `section-${Date.now()}`,
      title: newSection.label.trim(),
      emoji: newSection.emoji || '📋',
      enabled: true,
      tasks: [],
    };
    setSections(prev => [...prev, s]);
    setExpandedId(s.id);
    setNewSection(null);
  }

  return (
    <div className="space-y-3">
      {sections.map(section => (
        <SectionCard
          key={section.id}
          section={section}
          expanded={expandedId === section.id}
          onToggleExpand={() => setExpandedId(expandedId === section.id ? null : section.id)}
          onToggleEnabled={() => toggleEnabled(section.id)}
          onDeleteSection={() => deleteSection(section.id)}
          onDeleteTask={taskId => deleteTask(section.id, taskId)}
          taskDraft={taskDrafts[section.id] || { emoji: '⭐', label: '' }}
          onTaskDraftChange={draft => setTaskDrafts(prev => ({ ...prev, [section.id]: draft }))}
          onAddTask={() => addTask(section.id)}
          theme={theme}
        />
      ))}

      {newSection === null ? (
        <button
          onClick={() => setNewSection({ emoji: '📋', label: '' })}
          className="w-full py-3 border-2 border-dashed border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700 font-bold rounded-2xl transition"
        >
          + New Routine
        </button>
      ) : (
        <NewSectionForm
          draft={newSection}
          onChange={setNewSection}
          onCreate={createSection}
          onCancel={() => setNewSection(null)}
          theme={theme}
        />
      )}
    </div>
  );
}
