
import React, { useState, useEffect, useMemo } from 'react';
import { Habit } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import ActiveHabitDisplay from './components/ActiveHabitDisplay';
import PomodoroTimer from './components/PomodoroTimer';
import HabitList from './components/HabitList';
import HabitForm from './components/HabitForm';

const App: React.FC = () => {
  const [habits, setHabits] = useLocalStorage<Habit[]>('habits', []);
  const [activeHabitId, setActiveHabitId] = useState<string | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);

  const activeHabit = useMemo(() => habits.find(h => h.id === activeHabitId) || null, [habits, activeHabitId]);

  useEffect(() => {
    let interval: number | null = null;
    if (isTimerRunning && activeHabitId) {
      interval = setInterval(() => {
        setSessionSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, activeHabitId]);

  const saveSession = () => {
    if (activeHabitId && sessionSeconds > 0) {
      setHabits(prevHabits =>
        prevHabits.map(h =>
          h.id === activeHabitId ? { ...h, timeSpent: h.timeSpent + sessionSeconds } : h
        )
      );
    }
    setSessionSeconds(0);
  };
  
  const handleTrack = (id: string) => {
    if (activeHabitId) {
        saveSession();
    }
    setActiveHabitId(id);
    setIsTimerRunning(true);
    setSessionSeconds(0);
  };

  const handlePause = () => {
    setIsTimerRunning(false);
  };

  const handleResume = () => {
    if (activeHabitId) {
      setIsTimerRunning(true);
    }
  };

  const handleStop = () => {
    saveSession();
    setIsTimerRunning(false);
    setActiveHabitId(null);
  };

  const handleOpenForm = (habit: Habit | null = null) => {
    setHabitToEdit(habit);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setHabitToEdit(null);
  };

  const handleSaveHabit = (habitData: Omit<Habit, 'id' | 'timeSpent'> & { id?: string }) => {
    if (habitData.id) {
      // Edit
      setHabits(prev => prev.map(h => h.id === habitData.id ? { ...h, name: habitData.name, dailyGoal: habitData.dailyGoal } : h));
    } else {
      // Add
      const newHabit: Habit = {
        id: new Date().toISOString(),
        name: habitData.name,
        dailyGoal: habitData.dailyGoal,
        timeSpent: 0,
      };
      setHabits(prev => [...prev, newHabit]);
    }
  };

  const handleDeleteHabit = (id: string) => {
    if(window.confirm('Are you sure you want to delete this habit?')){
      if (id === activeHabitId) {
        handleStop();
      }
      setHabits(prev => prev.filter(h => h.id !== id));
    }
  };
  
  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-fixed text-white" 
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1494522350611-3458e6552074?q=80&w=2574&auto=format&fit=crop')" }}>
      <div className="min-h-screen w-full bg-black/40 backdrop-blur-sm flex flex-col items-center p-4 sm:p-8">
        <header className="w-full max-w-6xl mx-auto mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">LilyPad Focus</h1>
          <p className="text-lg text-white/80 mt-2">Your daily sanctuary for focus and growth.</p>
        </header>

        <main className="w-full max-w-6xl mx-auto flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="bg-black/20 backdrop-blur-md rounded-2xl h-96 shadow-lg">
                <ActiveHabitDisplay habit={activeHabit} sessionSeconds={sessionSeconds} />
            </div>
            <div className="bg-black/20 backdrop-blur-md rounded-2xl h-96 shadow-lg">
                <PomodoroTimer 
                    isHabitActive={!!activeHabitId}
                    isTimerRunning={isTimerRunning}
                    sessionSeconds={sessionSeconds}
                    onPause={handlePause}
                    onResume={handleResume}
                    onStop={handleStop}
                />
            </div>
        </main>

        <section className="w-full max-w-6xl mx-auto mt-12">
            <HabitList 
                habits={habits}
                activeHabitId={activeHabitId}
                onTrack={handleTrack}
                onOpenForm={() => handleOpenForm(null)}
                onEdit={handleOpenForm}
                onDelete={handleDeleteHabit}
            />
        </section>

        <HabitForm 
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSave={handleSaveHabit}
          initialData={habitToEdit}
        />
      </div>
    </div>
  );
};

export default App;
