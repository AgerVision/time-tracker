import { useState } from 'react';

// Add this function at the top of the file
const generateId = () => {
  const now = new Date();
  const datePart = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const randomPart = Math.random().toString(36).substr(2, 6);
  return `${datePart}${randomPart}`;
};

export const useInitialState = () => {
  const [intervals, setIntervals] = useState(() => {
    const savedIntervals = localStorage.getItem('timeIntervals');
    return savedIntervals ? JSON.parse(savedIntervals) : [];
  });

  const [categories, setCategories] = useState(() => {
    const savedCategories = localStorage.getItem('categories');
    return savedCategories ? JSON.parse(savedCategories).map(cat => {
      if (typeof cat === 'string') {
        return { name: cat, active: true, id: generateId() };
      }
      return cat.id ? cat : { ...cat, id: generateId() };
    }) : [];
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