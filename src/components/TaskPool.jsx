import { useState } from 'react';
import TaskEditor from './TaskEditor';

export default function TaskPool({ taskPool, setTaskPool, todayList, setTodayList }) {
  const [editing, setEditing] = useState(null); // null | 'new' | task

  function addToToday(id) {
    if (!todayList.includes(id)) {
      setTodayList(prev => [...prev, id]);
    }
  }

  function removeFromPool(id) {
    setTaskPool(prev => prev.filter(t => t.id !== id));
    setTodayList(prev => prev.filter(tid => tid !== id));
  }

  function handleSave(task) {
    if (editing === 'new') {
      setTaskPool(prev => [...prev, { ...task, id: Date.now().toString() }]);
    } else {
      setTaskPool(prev => prev.map(t => t.id === task.id ? task : t));
    }
    setEditing(null);
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-black text-purple-700">🗂️ Task Pool</h2>
        <button
          onClick={() => setEditing('new')}
          className="text-xs bg-purple-100 hover:bg-purple-200 active:scale-95 text-purple-700 font-bold px-3 py-1 rounded-full transition"
        >
          + New Task
        </button>
      </div>

      {taskPool.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">
          No tasks yet — create your first one!
        </p>
      ) : (
        <ul className="space-y-2">
          {taskPool.map(task => {
            const inToday = todayList.includes(task.id);
            return (
              <li key={task.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
                <span className="text-2xl">{task.emoji}</span>
                <span className="flex-1 font-bold text-sm text-gray-700">{task.label}</span>
                {inToday ? (
                  <span className="text-xs bg-green-100 text-green-600 font-bold px-2 py-1 rounded-full whitespace-nowrap">
                    Added ✓
                  </span>
                ) : (
                  <button
                    onClick={() => addToToday(task.id)}
                    className="text-xs bg-purple-500 hover:bg-purple-600 active:scale-95 text-white font-bold px-3 py-1 rounded-full transition whitespace-nowrap"
                  >
                    + Add
                  </button>
                )}
                <button
                  onClick={() => setEditing(task)}
                  className="text-gray-300 hover:text-blue-500 px-1 transition text-base"
                  title="Edit"
                >✏️</button>
                <button
                  onClick={() => removeFromPool(task.id)}
                  className="text-gray-300 hover:text-red-500 px-1 transition text-base"
                  title="Delete"
                >🗑️</button>
              </li>
            );
          })}
        </ul>
      )}

      {editing !== null && (
        <TaskEditor
          task={editing === 'new' ? null : editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}
