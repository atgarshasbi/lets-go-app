function swapped(arr, i, j) {
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

export default function TodayList({ taskPool, todayList, setTodayList, completedToday, handleResetToday }) {
  function remove(id) {
    setTodayList(prev => prev.filter(tid => tid !== id));
  }

  function move(index, dir) {
    setTodayList(prev => swapped(prev, index, index + dir));
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-black text-purple-700">📋 Today&apos;s List</h2>
        <button
          onClick={handleResetToday}
          className="text-xs bg-red-100 hover:bg-red-200 active:scale-95 text-red-600 font-bold px-3 py-1 rounded-full transition"
        >
          🔄 Reset Progress
        </button>
      </div>

      {todayList.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">
          No tasks yet — add some from the pool below!
        </p>
      ) : (
        <ul className="space-y-2">
          {todayList.map((id, i) => {
            const task = taskPool.find(t => t.id === id);
            if (!task) return null;
            const done = completedToday.includes(id);
            return (
              <li
                key={id}
                className={`flex items-center gap-2 p-2 rounded-xl ${done ? 'bg-green-50' : 'bg-purple-50'}`}
              >
                <span className="text-2xl">{task.emoji}</span>
                <span className={`flex-1 font-bold text-sm ${done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {task.label}
                </span>
                {done && <span className="text-green-500 text-xs font-bold">✓</span>}
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="text-gray-400 hover:text-gray-700 disabled:opacity-25 px-1 text-lg leading-none"
                  title="Move up"
                >↑</button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === todayList.length - 1}
                  className="text-gray-400 hover:text-gray-700 disabled:opacity-25 px-1 text-lg leading-none"
                  title="Move down"
                >↓</button>
                <button
                  onClick={() => remove(id)}
                  className="text-gray-300 hover:text-red-500 px-1 text-lg leading-none transition"
                  title="Remove"
                >✕</button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
