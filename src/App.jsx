import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { DEFAULT_POOL, DEFAULT_TODAY, DEFAULT_SECTIONS } from './data/defaultData';
import { ThemeContext, THEMES } from './theme';
import ChildView from './components/ChildView';
import PinEntry from './components/PinEntry';
import ParentView from './components/ParentView';

export default function App() {
  const [view, setView] = useState('child');
  const [timerResetToken, setTimerResetToken] = useState(0);

  const [childName, setChildName] = useLocalStorage('childName', 'Superstar');
  const [pin, setPin] = useLocalStorage('pin', '1234');
  const [totalStars, setTotalStars] = useLocalStorage('totalStars', 0);
  const [timerMinutes, setTimerMinutes] = useLocalStorage('timerMinutes', 1);
  const [timerMaxMinutes, setTimerMaxMinutes] = useLocalStorage('timerMaxMinutes', 3);
  const [taskPool, setTaskPool] = useLocalStorage('taskPool', DEFAULT_POOL);
  const [todayList, setTodayList] = useLocalStorage('todayList', DEFAULT_TODAY);
  const [sections, setSections] = useLocalStorage('sections', DEFAULT_SECTIONS);
  const [completedToday, setCompletedToday] = useLocalStorage('completedToday', []);
  const [themeKey, setThemeKey] = useLocalStorage('theme', 'purple');
  const [celebrationCharacter, setCelebrationCharacter] = useLocalStorage('celebrationCharacter', 'trophy');

  const theme = THEMES[themeKey] || THEMES.purple;

  function handleTaskToggle(taskId) {
    setCompletedToday(prev => {
      if (prev.includes(taskId)) {
        setTotalStars(s => Math.max(0, s - 1));
        return prev.filter(id => id !== taskId);
      }
      setTotalStars(s => s + 1);
      return [...prev, taskId];
    });
  }

  function handleResetToday() {
    setTotalStars(s => Math.max(0, s - completedToday.length));
    setCompletedToday([]);
    setTimerResetToken(t => t + 1);
  }

  const sharedState = {
    childName, setChildName,
    pin, setPin,
    totalStars,
    timerMinutes, setTimerMinutes,
    timerMaxMinutes, setTimerMaxMinutes,
    themeKey, setThemeKey,
    celebrationCharacter, setCelebrationCharacter,
    taskPool, setTaskPool,
    todayList, setTodayList,
    sections, setSections,
    completedToday,
    handleTaskToggle,
    handleResetToday,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {view === 'pin' && (
        <PinEntry
          correctPin={pin}
          onSuccess={() => setView('parent')}
          onCancel={() => setView('child')}
        />
      )}

      {view === 'parent' && (
        <ParentView
          {...sharedState}
          onBack={() => setView('child')}
        />
      )}

      {view === 'child' && (
        <ChildView
          {...sharedState}
          timerResetToken={timerResetToken}
          onParentPress={() => setView('pin')}
        />
      )}
    </ThemeContext.Provider>
  );
}
