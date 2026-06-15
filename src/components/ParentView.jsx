import { useState } from 'react';
import TodayList from './TodayList';
import TaskPool from './TaskPool';
import Settings from './Settings';

export default function ParentView({
  childName, setChildName,
  pin, setPin,
  timerMinutes, setTimerMinutes,
  taskPool, setTaskPool,
  todayList, setTodayList,
  completedToday, handleResetToday,
  onBack,
}) {
  const [tab, setTab] = useState('tasks');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-purple-700 text-white px-4 py-3 flex items-center justify-between shadow-lg sticky top-0 z-10">
        <h1 className="text-lg font-black">🔒 Parent Mode</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('tasks')}
            className={`px-3 py-1 rounded-full text-sm font-bold transition ${
              tab === 'tasks' ? 'bg-white text-purple-700' : 'bg-purple-600 hover:bg-purple-500'
            }`}
          >
            📋 Tasks
          </button>
          <button
            onClick={() => setTab('settings')}
            className={`px-3 py-1 rounded-full text-sm font-bold transition ${
              tab === 'settings' ? 'bg-white text-purple-700' : 'bg-purple-600 hover:bg-purple-500'
            }`}
          >
            ⚙️ Settings
          </button>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto pb-8">
        {tab === 'tasks' ? (
          <>
            <TodayList
              taskPool={taskPool}
              todayList={todayList}
              setTodayList={setTodayList}
              completedToday={completedToday}
              handleResetToday={handleResetToday}
            />
            <TaskPool
              taskPool={taskPool}
              setTaskPool={setTaskPool}
              todayList={todayList}
              setTodayList={setTodayList}
            />
          </>
        ) : (
          <Settings
            childName={childName}
            setChildName={setChildName}
            pin={pin}
            setPin={setPin}
            timerMinutes={timerMinutes}
            setTimerMinutes={setTimerMinutes}
          />
        )}

        <button
          onClick={onBack}
          className="w-full mt-6 py-3 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black rounded-2xl shadow transition"
        >
          ← Back to Kids View
        </button>
      </div>
    </div>
  );
}
