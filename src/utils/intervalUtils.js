export const filterIntervals = (intervals, filter, splitOverMidnight = false) => {
  if (!filter) return { filteredIntervals: intervals, totalPeriodTime: 0 };

  const applyDateFilter = (interval, fromDate, toDate) => {
    const start = new Date(`${interval.startDate}T${interval.startTime}`);
    const end = new Date(`${interval.endDate}T${interval.endTime}`);
    const filterFromDate = new Date(fromDate);
    const filterToDate = new Date(toDate);
    filterToDate.setHours(23, 59, 59, 999);  // Set to end of day

    return (start <= filterToDate && end >= filterFromDate);
  };

  const splitIntervalsByDay = (interval) => {
    let start = new Date(`${interval.startDate}T${interval.startTime}Z`);
    const end = new Date(`${interval.endDate}T${interval.endTime}Z`);

    // Check if the interval ends on the same day
    if (start.toUTCString().split('T')[0] === end.toUTCString().split('T')[0]) {
      return [interval]; // Return the original interval
    }

    const result = [];
    let currentStartDate = new Date(start);
    let currentEndDate = new Date(start);
    currentEndDate.setUTCDate(currentStartDate.getUTCDate() + 1);
    currentEndDate.setUTCHours(0, 0, 0, 0);

    const calculateDuration = (start, end) => {
      return Math.round((end - start) / (1000 * 60)); // Duration in minutes
    };

    while (currentEndDate < end) {
      result.push({
        ...interval,
        startDate: currentStartDate.toISOString().split('T')[0],
        startTime: currentStartDate.toISOString().split('T')[1].slice(0, 8),
        endDate: currentEndDate.toISOString().split('T')[0],
        endTime: '00:00:00',
        duration: calculateDuration(currentStartDate, currentEndDate)
      });

      currentStartDate = new Date(currentEndDate);
      currentEndDate.setUTCDate(currentEndDate.getUTCDate() + 1);
    }

    // Add the last interval
    if (currentEndDate > end) {
      currentEndDate = end;
      result.push({
        ...interval,
        startDate: currentStartDate.toISOString().split('T')[0],
        startTime: currentStartDate.toISOString().split('T')[1].slice(0, 8),
        endDate: currentEndDate.toISOString().split('T')[0],
        endTime: currentEndDate.toISOString().split('T')[1].slice(0, 8),
        duration: calculateDuration(currentStartDate, currentEndDate)
      });
    }

    return result;
  };

  let filteredIntervals = intervals.filter(interval => {
    const dateFilter = applyDateFilter(interval, filter.fromDate, filter.toDate);
    const categoryFilter = filter.category === 'all' || interval.category === filter.category;
    return dateFilter && categoryFilter;
  });

  if (splitOverMidnight) {
    const filterFromDate = new Date(filter.fromDate);
    filterFromDate.setHours(0, 0, 0, 0);
    const filterToDate = new Date(filter.toDate);
    filterToDate.setHours(23, 59, 59, 999);

    filteredIntervals = filteredIntervals.flatMap(interval => {
      const splitIntervals = splitIntervalsByDay(interval);
      return splitIntervals.filter(splitInterval => {
        const start = new Date(`${splitInterval.startDate}T${splitInterval.startTime}`);
        const end = new Date(`${splitInterval.endDate}T${splitInterval.endTime}`);
        return applyDateFilter(splitInterval, filterFromDate, filterToDate) &&
               (filter.category === 'all' || splitInterval.category === filter.category);
      });
    });
  }

  // Sortează intervalele descrescător cronologic
  filteredIntervals.sort((a, b) => {
    const dateB = new Date(`${b.startDate}T${b.startTime}`);
    const dateA = new Date(`${a.startDate}T${a.startTime}`);
    return dateB - dateA; // Ordinea inversată pentru sortare descrescătoare
  });

  // Add unallocated time intervals
  const result = [];
  let lastEnd = null;

  filteredIntervals.forEach(interval => {
    const start = new Date(`${interval.startDate}T${interval.startTime}`);
    if (lastEnd && start > lastEnd) {
      result.push({
        startDate: lastEnd.toISOString().split('T')[0],
        startTime: lastEnd.toTimeString().slice(0, 8),
        endDate: start.toISOString().split('T')[0],
        endTime: start.toTimeString().slice(0, 8),
        category: 'Unallocated'
      });
    }
    result.push(interval);
    lastEnd = new Date(`${interval.endDate}T${interval.endTime}`);
  });

  let totalPeriodTime = 24 * 60; // 24 hours in minutes

  if (filter.fromDate && filter.toDate) {
    const fromDate = new Date(filter.fromDate);
    const toDate = new Date(filter.toDate);
    toDate.setHours(23, 59, 59, 999); // Set to end of day
    const daysDiff = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));
    totalPeriodTime = daysDiff * 24 * 60; // Total minutes for all days
  }

  return { filteredIntervals: result, totalPeriodTime };
};

export const groupIntervals = (intervals, calculateDuration) => {
  if (!Array.isArray(intervals)) {
    console.error('groupIntervals received non-array input:', intervals);
    return {};
  }
  
  return intervals.reduce((groups, interval) => {
    const category = interval.category || 'Uncategorized';
    if (!groups[category]) {
      groups[category] = { totalTime: 0, intervals: [] };
    }
    const duration = calculateDuration(interval);
    groups[category].totalTime += duration;
    groups[category].intervals.push(interval);
    return groups;
  }, {});
};

export const formatDuration = (minutes) => {
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = Math.round(minutes % 60);
  if (days > 0) return `${days}z:${hours}h:${mins}m`;
  return `${hours}h:${mins}m`;
};

export const addInterval = (interval, intervals, categories, setIntervals, setCategories) => {
  const start = new Date(`${interval.startDate}T${interval.startTime}`);
  const end = new Date(`${interval.endDate}T${interval.endTime}`);
  
  const durationMinutes = (end - start) / 1000 / 60;
  const roundedDuration = Math.round(durationMinutes / 5) * 5;
  const roundedEnd = new Date(start.getTime() + roundedDuration * 60 * 1000);
  
  const roundedInterval = {
    ...interval,
    endDate: roundedEnd.toISOString().split('T')[0],
    endTime: roundedEnd.toTimeString().split(' ')[0].slice(0, 5),
  };
  
  setIntervals(prevIntervals => [...prevIntervals, roundedInterval]);
  
  if (!categories.some(cat => cat.name === interval.category)) {
    setCategories(prevCategories => [...prevCategories, { name: interval.category, active: true }]);
  }
  return true;
};

export const deleteInterval = (index, intervals, setIntervals) => {
  setIntervals(prevIntervals => prevIntervals.filter((_, i) => i !== index));
};

export const saveEditedInterval = (editingInterval, intervals, setIntervals) => {
  setIntervals(prevIntervals => prevIntervals.map(interval => 
    interval.id === editingInterval.id ? {
      ...editingInterval,
      id: interval.id // Păstrăm ID-ul original
    } : interval
  ));
};

export const formatTimeWithoutSeconds = (time) => {
  return time.slice(0, 5);
};