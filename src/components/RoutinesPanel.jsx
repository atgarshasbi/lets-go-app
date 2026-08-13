import { useState } from 'react';
import {
  DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTheme } from '../theme';
import { EMOJI_OPTIONS, DEFAULT_SECTIONS, TASK_LIBRARY } from '../data/defaultData';

function useDragSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );
}

function DragHandle({ attributes, listeners }) {
  return (
    <span
      {...attributes}
      {...listeners}
      onClick={e => e.stopPropagation()}
      className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 px-1 select-none touch-none"
      title="Drag to reorder"
    >
      ⠿
    </span>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
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

function TaskLibraryPicker({ existingLabels, onPick, theme }) {
  const [search, setSearch] = useState('');
  const available = TASK_LIBRARY.filter(item =>
    !existingLabels.has(item.label.toLowerCase()) &&
    item.label.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="mt-2 bg-gray-50 rounded-xl p-3">
      <input
        type="text"
        placeholder="Search common tasks..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border-2 border-gray-200 focus:border-purple-400 rounded-xl px-3 py-2 text-sm font-bold outline-none transition mb-2"
      />
      {available.length === 0 ? (
        <p className="text-xs text-gray-400 font-bold text-center py-2">
          No matches — add it as a custom task below
        </p>
      ) : (
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
          {available.map(item => (
            <button
              key={item.label}
              type="button"
              onClick={() => onPick(item)}
              className="flex items-center gap-1 text-xs font-bold px-2 py-1.5 rounded-full bg-white border-2 border-gray-200 hover:border-purple-400 transition"
              style={{ color: theme.primary }}
            >
              <span className="text-base">{item.emoji}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SortableTaskRow({ task, onDeleteTask }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2"
    >
      <DragHandle attributes={attributes} listeners={listeners} />
      <span className="text-lg">{task.emoji}</span>
      <span className="flex-1 text-sm font-bold text-gray-700">{task.label}</span>
      <button
        onClick={() => onDeleteTask(task.id)}
        className="text-gray-300 hover:text-red-400 transition font-black text-xl leading-none"
      >×</button>
    </li>
  );
}

function SectionCard({
  section, expanded, onToggleExpand, onToggleEnabled,
  onDeleteSection, onDeleteTask, onReorderTasks, taskDraft, onTaskDraftChange, onAddTask, onAddFromLibrary, theme,
  dragHandleProps,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const enabled = section.enabled !== false;
  const existingLabels = new Set(section.tasks.map(t => t.label.toLowerCase()));
  const taskSensors = useDragSensors();

  function handleTaskDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = section.tasks.findIndex(t => t.id === active.id);
    const newIndex = section.tasks.findIndex(t => t.id === over.id);
    onReorderTasks(arrayMove(section.tasks, oldIndex, newIndex));
  }

  return (
    <div className={`bg-white rounded-2xl shadow overflow-hidden transition-opacity ${!enabled ? 'opacity-55' : ''}`}>
      {/* Section header row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={onToggleExpand}
      >
        <DragHandle {...dragHandleProps} />
        <span className="text-2xl">{section.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-black text-gray-800 text-sm leading-tight">{section.title}</p>
          <p className="text-xs text-gray-400 font-bold">{section.tasks.length} task{section.tasks.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <Toggle
            checked={enabled}
            onChange={onToggleEnabled}
            label={`${enabled ? 'Disable' : 'Enable'} ${section.title}`}
          />
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
            <DndContext sensors={taskSensors} collisionDetection={closestCenter} onDragEnd={handleTaskDragEnd}>
              <SortableContext items={section.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <ul className="mt-3 space-y-2">
                  {section.tasks.map(task => (
                    <SortableTaskRow key={task.id} task={task} onDeleteTask={onDeleteTask} />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}

          {/* Add task row */}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowLibrary(p => !p)}
              className="text-xs font-bold px-3 py-1.5 rounded-full transition mb-2"
              style={showLibrary
                ? { backgroundColor: theme.light, color: theme.primary }
                : { backgroundColor: '#f3f4f6', color: '#6b7280' }
              }
            >
              📋 Choose from common tasks
            </button>
            {showLibrary && (
              <TaskLibraryPicker
                existingLabels={existingLabels}
                onPick={item => onAddFromLibrary(item)}
                theme={theme}
              />
            )}

            <div className="flex gap-2 items-center mt-2">
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

function SortableSectionCard(props) {
  const { section } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SectionCard {...props} dragHandleProps={{ attributes, listeners }} />
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
  const [confirmReset, setConfirmReset] = useState(false);
  const sectionSensors = useDragSensors();

  function resetToDefault() {
    setSections(DEFAULT_SECTIONS);
    setExpandedId(null);
    setTaskDrafts({});
    setNewSection(null);
    setConfirmReset(false);
  }

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

  function addFromLibrary(sectionId, item) {
    const task = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      emoji: item.emoji,
      label: item.label,
    };
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, tasks: [...s.tasks, task] } : s
    ));
  }

  function reorderTasks(sectionId, newTasks) {
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, tasks: newTasks } : s
    ));
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

  function handleSectionDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSections(prev => {
      const oldIndex = prev.findIndex(s => s.id === active.id);
      const newIndex = prev.findIndex(s => s.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  return (
    <div className="space-y-3">
      <DndContext sensors={sectionSensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
        <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {sections.map(section => (
            <SortableSectionCard
              key={section.id}
              section={section}
              expanded={expandedId === section.id}
              onToggleExpand={() => setExpandedId(expandedId === section.id ? null : section.id)}
              onToggleEnabled={() => toggleEnabled(section.id)}
              onDeleteSection={() => deleteSection(section.id)}
              onDeleteTask={taskId => deleteTask(section.id, taskId)}
              onReorderTasks={newTasks => reorderTasks(section.id, newTasks)}
              taskDraft={taskDrafts[section.id] || { emoji: '⭐', label: '' }}
              onTaskDraftChange={draft => setTaskDrafts(prev => ({ ...prev, [section.id]: draft }))}
              onAddTask={() => addTask(section.id)}
              onAddFromLibrary={item => addFromLibrary(section.id, item)}
              theme={theme}
            />
          ))}
        </SortableContext>
      </DndContext>

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

      {confirmReset ? (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center">
          <p className="text-sm font-bold text-red-600 mb-3">
            This replaces all your routines with the default set. Custom routines and edits will be lost. Are you sure?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmReset(false)}
              className="flex-1 py-2 border-2 border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={resetToDefault}
              className="flex-1 py-2 text-white font-black rounded-xl transition bg-red-500 hover:bg-red-600"
            >
              Reset to Default
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setConfirmReset(true)}
          className="w-full py-2 text-gray-400 hover:text-red-500 font-bold text-sm transition"
        >
          Reset to Default List
        </button>
      )}
    </div>
  );
}
