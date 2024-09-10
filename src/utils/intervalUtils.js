export const filterIntervals = (intervals, filter, splitOverMidnight = false) => {
  if (!filter) return { filteredIntervals: intervals, totalPeriodTime: 0 };

  const applyDateFilter = (interval, fromDate, toDate) => {
    const start = new Date(`${interval.startDate}T${interval.startTime}Z`);
    const end = new Date(`${interval.endDate}T${interval.endTime}Z`);
    const filterFromDate = new Date(`${fromDate}T00:00:00Z`);
    const filterToDate = new Date(`${toDate}T23:59:59.999Z`);

    // Modificăm condiția pentru a exclude intervalele care se termină exact la miezul nopții zilei de început
    return (start < filterToDate && end > filterFromDate);
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
    const categoryFilter = filter.category === 'all' || interval.categoryId === filter.category;
    return dateFilter && categoryFilter;
  });

  if (splitOverMidnight) {
    const filterFromDate = new Date(`${filter.fromDate}T00:00:00Z`);
    const filterToDate = new Date(`${filter.toDate}T23:59:59.999Z`);

    filteredIntervals = filteredIntervals.flatMap(interval => {
      const splitIntervals = splitIntervalsByDay(interval);
      return splitIntervals.filter(splitInterval => {
        const start = new Date(`${splitInterval.startDate}T${splitInterval.startTime}Z`);
        const end = new Date(`${splitInterval.endDate}T${splitInterval.endTime}Z`);
        // Folosim aceeași logică de filtrare și pentru intervalele splituite
        return (start < filterToDate && end > filterFromDate) &&
               (filter.category === 'all' || splitInterval.categoryId === filter.category);
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

export const groupIntervals = (intervals, calculateDuration, getCategoryName = (id) => id) => {
  if (!Array.isArray(intervals)) {
    console.error('groupIntervals received non-array input:', intervals);
    return {};
  }
  
  return intervals.reduce((groups, interval) => {
    const categoryName = getCategoryName(interval.categoryId) || 'Uncategorized';
    if (!groups[categoryName]) {
      groups[categoryName] = { totalTime: 0, intervals: [] };
    }
    const duration = calculateDuration(interval);
    groups[categoryName].totalTime += duration;
    groups[categoryName].intervals.push(interval);
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
  const parseDateTime = (date, time) => {
    return new Date(`${date}T${time}Z`);
  };

  const start = parseDateTime(interval.startDate, interval.startTime);
  const end = parseDateTime(interval.endDate, interval.endTime);
  
  const durationMinutes = (end - start) / (1000 * 60);
  const roundedDuration = Math.round(durationMinutes / 5) * 5;
  const roundedEnd = new Date(start.getTime() + roundedDuration * 60 * 1000);
  
  const formatDate = (date) => date.toISOString().split('T')[0];
  const formatTime = (date) => date.toISOString().split('T')[1].slice(0, 5);

  const roundedInterval = {
    ...interval,
    endDate: formatDate(roundedEnd),
    endTime: formatTime(roundedEnd),
  };
  
  setIntervals(prevIntervals => [...prevIntervals, roundedInterval]);
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