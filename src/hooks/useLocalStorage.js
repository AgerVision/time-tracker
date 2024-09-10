import { useEffect } from 'react';

export const useLocalStorage = (intervals, categories) => {
  useEffect(() => {
    localStorage.setItem('timeIntervals', JSON.stringify(intervals));
  }, [intervals]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);
};