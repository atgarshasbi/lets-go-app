import { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useSessionStorage } from './hooks/useSessionStorage';
import { DEFAULT_POOL, DEFAULT_TODAY, DEFAULT_SECTIONS } from './data/defaultData';
import { ThemeContext, SoundContext, DarkModeContext, THEMES } from './theme';
import ChildView from './components/ChildView';
import PinEntry from './components/PinEntry';
import ParentView from './components/ParentView';
import LandingSplash from './components/LandingSplash';

export default function App() {
  const [view, setView] = useSessionStorage('view', 'child');
  const [timerResetToken, setTimerResetToken] = useState(0);
  const [timerPaused, setTimerPaused] = useState(false);

  const [hasVisited, setHasVisited] = useLocalStorage('hasVisited', false);
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
  const [soundEnabled, setSoundEnabled] = useLocalStorage('soundEnabled', true);
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const theme = THEMES[themeKey] || THEMES.purple;

  function handleTaskToggle(taskId) {
    setTimerPaused(false);
    setCompletedToday(prev => {
      if (prev.includes(taskId)) {
        setTotalStars(s => Math.max(0, s - 1));
        return prev.filter(id => id !== taskId);
      }
      setTotalStars(s => s + 1);
      return [...prev, taskId];
    });
  }

  function handleBonusStar() {
    setTotalStars(s => s + 1);
  }

  function handleResetToday() {
    setTotalStars(0);
    setCompletedToday([]);
    setTimerResetToken(t => t + 1);
    setTimerPaused(true);
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
    timerPaused,
    onTimerPause: () => setTimerPaused(true),
    onTimerResume: () => setTimerPaused(false),
    soundEnabled, setSoundEnabled,
    handleTaskToggle,
    handleResetToday,
    handleBonusStar,
  };

  return (
    <ThemeContext.Provider value={theme}>
    <SoundContext.Provider value={soundEnabled}>
    <DarkModeContext.Provider value={[darkMode, setDarkMode]}>
      {!hasVisited && (
        <LandingSplash onStart={() => setHasVisited(true)} />
      )}

      {hasVisited && view === 'pin' && (
        <PinEntry
          correctPin={pin}
          onSuccess={() => setView('parent')}
          onCancel={() => setView('child')}
        />
      )}

      {hasVisited && view === 'parent' && (
        <ParentView
          {...sharedState}
          onBack={() => setView('child')}
        />
      )}

      {hasVisited && view === 'child' && (
        <ChildView
          {...sharedState}
          timerResetToken={timerResetToken}
          onParentPress={() => setView('pin')}
        />
      )}
    </DarkModeContext.Provider>
    </SoundContext.Provider>
    </ThemeContext.Provider>
  );
}
