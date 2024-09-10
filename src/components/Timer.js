import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import CategoryDropdown from './CategoryDropdown';

const Timer = ({ categories, addInterval, openEditModal }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [currentCategory, setCurrentCategory] = useState('');
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (!initialLoadDone.current) {
      const savedTimerState = JSON.parse(localStorage.getItem('timerState'));
      console.log('Loaded timer state:', savedTimerState);
      if (savedTimerState) {
        setIsRunning(savedTimerState.isRunning);
        setStartTime(savedTimerState.startTime ? new Date(savedTimerState.startTime) : null);
        setCurrentCategory(savedTimerState.currentCategory);
      }
      initialLoadDone.current = true;
    }
  }, []);

  useEffect(() => {
    if (initialLoadDone.current) {
      const timerState = {
        isRunning,
        startTime: startTime ? startTime.toISOString() : null,
        currentCategory
      };
      console.log('Saving timer state:', timerState);
      localStorage.setItem('timerState', JSON.stringify(timerState));
    }
  }, [isRunning, startTime, currentCategory]);

  const startTimer = () => {
    if (!currentCategory) {
      toast.error('Vă rugăm să selectați sau să introduceți o categorie!');
      return;
    }
    setIsRunning(true);
    setStartTime(new Date());
  };

  const stopTimer = () => {
    setIsRunning(false);
    const endTime = new Date();
    const durationMinutes = (endTime - startTime) / 1000 / 60;
    const roundedDuration = Math.max(5, Math.round(durationMinutes / 5) * 5);
    
    const roundedEndTime = new Date(startTime.getTime() + roundedDuration * 60 * 1000);
    
    const newInt = {
      startDate: startTime.toISOString().split('T')[0],
      startTime: startTime.toTimeString().split(' ')[0].slice(0, 5),
      endDate: roundedEndTime.toISOString().split('T')[0],
      endTime: roundedEndTime.toTimeString().split(' ')[0].slice(0, 5),
      category: currentCategory,
    };
    
    openEditModal(newInt);
    resetTimer();
  };

  const resetTimer = () => {
    setIsRunning(false);
    setStartTime(null);
    setCurrentCategory('');
    localStorage.removeItem('timerState');
    console.log('Timer reset, localStorage cleared');
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === 'add_new') {
      // This should be handled in the parent component
    } else {
      setCurrentCategory(value);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-4">
      <h2 className="text-xl font-semibold mb-2">Cronometru</h2>
      {!isRunning ? (
        <>
          <CategoryDropdown
            value={currentCategory}
            onChange={handleCategoryChange}
            categories={categories}
          />
          <button onClick={startTimer} className="w-full px-4 py-2 bg-green-500 text-white rounded">Start</button>
        </>
      ) : (
        <>
          <div className="mb-4">
            <p className="font-semibold">Categorie curentă: {currentCategory}</p>
            <p>Început la: {startTime.toLocaleTimeString()}</p>
          </div>
          <button onClick={stopTimer} className="w-full px-4 py-2 bg-red-500 text-white rounded">Stop</button>
        </>
      )}
      <p className="mt-4 text-sm text-gray-600">
        Da drumul la cronometru când începi o activitate nouă, ca apoi să pui stop când o termini sau când treci la altceva.
      </p>
    </div>
  );
};

export default Timer;