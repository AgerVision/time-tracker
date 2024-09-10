import { useState } from 'react';

export const useInitialState = () => {
  const [intervals, setIntervals] = useState(() => {
    const savedIntervals = localStorage.getItem('timeIntervals');
    return savedIntervals ? JSON.parse(savedIntervals) : [];
  });

  const [categories, setCategories] = useState(() => {
    const savedCategories = localStorage.getItem('categories');
    return savedCategories ? JSON.parse(savedCategories).map(cat => 
      typeof cat === 'string' ? { name: cat, active: true } : cat
    ) : [];
  });

  const [newInterval, setNewInterval] = useState(() => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    return {
      startDate: currentDate,
      startTime: currentTime,
      endDate: currentDate,
      endTime: currentTime,
      category: ''
    };
  });

  const today = new Date().toISOString().split('T')[0];
  const [filter, setFilter] = useState({ fromDate: today, toDate: today, category: 'all' });
  const [listView, setListView] = useState('table');

  return { 
    intervals, 
    setIntervals, 
    categories, 
    setCategories, 
    newInterval, 
    setNewInterval,
    filter,
    setFilter,
    listView,
    setListView
  };
};