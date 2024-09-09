import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const TimeTrackerApp = () => {
  const [intervals, setIntervals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newInterval, setNewInterval] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    category: '',
  });
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [currentCategory, setCurrentCategory] = useState('');
  const [view, setView] = useState('add'); // 'add', 'list', 'chart'
  const [filter, setFilter] = useState({ period: 'all', category: 'all' });

  useEffect(() => {
    const savedIntervals = JSON.parse(localStorage.getItem('timeIntervals')) || [];
    const savedCategories = JSON.parse(localStorage.getItem('categories')) || [];
    setIntervals(savedIntervals);
    setCategories(savedCategories);
  }, []);

  useEffect(() => {
    localStorage.setItem('timeIntervals', JSON.stringify(intervals));
  }, [intervals]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  const addInterval = (interval) => {
    if (isOverlapping(interval)) {
      alert('Intervalul se suprapune cu unul existent!');
      return;
    }
    setIntervals([...intervals, interval]);
    if (!categories.includes(interval.category)) {
      setCategories([...categories, interval.category]);
    }
  };

  const isOverlapping = (newInterval) => {
    return intervals.some(interval => {
      const newStart = new Date(`${newInterval.startDate}T${newInterval.startTime}`);
      const newEnd = new Date(`${newInterval.endDate}T${newInterval.endTime}`);
      const intStart = new Date(`${interval.startDate}T${interval.startTime}`);
      const intEnd = new Date(`${interval.endDate}T${interval.endTime}`);
      return (newStart < intEnd && newEnd > intStart);
    });
  };

  const deleteInterval = (index) => {
    const newIntervals = [...intervals];
    newIntervals.splice(index, 1);
    setIntervals(newIntervals);
  };

  const startTimer = () => {
    setIsRunning(true);
    setStartTime(new Date());
  };

  const stopTimer = () => {
    setIsRunning(false);
    const endTime = new Date();
    const newInt = {
      startDate: startTime.toISOString().split('T')[0],
      startTime: startTime.toTimeString().split(' ')[0].slice(0, 5),
      endDate: endTime.toISOString().split('T')[0],
      endTime: endTime.toTimeString().split(' ')[0].slice(0, 5),
      category: currentCategory,
    };
    addInterval(newInt);
    setCurrentCategory('');
  };

  const filteredIntervals = intervals.filter(interval => {
    if (filter.period === 'all' && filter.category === 'all') return true;
    const start = new Date(`${interval.startDate}T${interval.startTime}`);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return (
      (filter.period === 'all' || 
       (filter.period === 'day' && start.toDateString() === now.toDateString()) ||
       (filter.period === 'week' && start >= weekAgo) ||
       (filter.period === 'month' && start >= monthAgo)) &&
      (filter.category === 'all' || interval.category === filter.category)
    );
  });

  const groupedIntervals = filteredIntervals.reduce((acc, interval) => {
    const category = interval.category;
    if (!acc[category]) {
      acc[category] = { totalTime: 0, intervals: [] };
    }
    const start = new Date(`${interval.startDate}T${interval.startTime}`);
    const end = new Date(`${interval.endDate}T${interval.endTime}`);
    const duration = (end - start) / 1000 / 60; // in minutes
    acc[category].totalTime += duration;
    acc[category].intervals.push(interval);
    return acc;
  }, {});

  const formatDuration = (minutes) => {
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const mins = Math.round(minutes % 60);
    if (days > 0) return `${days}z:${hours}h:${mins}m`;
    return `${hours}h:${mins}m`;
  };

  const pieData = Object.entries(groupedIntervals).map(([category, data]) => ({
    name: category,
    value: data.totalTime
  })).sort((a, b) => b.value - a.value);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#A4DE6C'];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tracker de Timp</h1>

      <div className="mb-4">
        <button onClick={() => setView('add')} className="mr-2 px-4 py-2 bg-blue-500 text-white rounded">Adaugă interval</button>
        <button onClick={() => setView('list')} className="mr-2 px-4 py-2 bg-green-500 text-white rounded">Listă intervale</button>
        <button onClick={() => setView('chart')} className="px-4 py-2 bg-purple-500 text-white rounded">Grafic</button>
      </div>

      {view === 'add' && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Adaugă interval nou</h2>
          <input
            type="date"
            value={newInterval.startDate}
            onChange={(e) => setNewInterval({...newInterval, startDate: e.target.value, endDate: e.target.value})}
            className="mr-2 p-2 border rounded"
          />
          <input
            type="time"
            value={newInterval.startTime}
            onChange={(e) => setNewInterval({...newInterval, startTime: e.target.value})}
            className="mr-2 p-2 border rounded"
          />
          <input
            type="time"
            value={newInterval.endTime}
            onChange={(e) => setNewInterval({...newInterval, endTime: e.target.value})}
            className="mr-2 p-2 border rounded"
          />
          <select
            value={newInterval.category}
            onChange={(e) => setNewInterval({...newInterval, category: e.target.value})}
            className="mr-2 p-2 border rounded"
          >
            <option value="">Alege categoria</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Sau adaugă categorie nouă"
            onChange={(e) => setNewInterval({...newInterval, category: e.target.value})}
            className="mr-2 p-2 border rounded"
          />
          <button onClick={() => addInterval(newInterval)} className="px-4 py-2 bg-blue-500 text-white rounded">Adaugă</button>
        </div>
      )}

      {view === 'add' && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Cronometru</h2>
          {!isRunning ? (
            <>
              <select
                value={currentCategory}
                onChange={(e) => setCurrentCategory(e.target.value)}
                className="mr-2 p-2 border rounded"
              >
                <option value="">Alege categoria</option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>{cat}</option>
                ))}
              </select>
              <button onClick={startTimer} className="px-4 py-2 bg-green-500 text-white rounded">Start</button>
            </>
          ) : (
            <button onClick={stopTimer} className="px-4 py-2 bg-red-500 text-white rounded">Stop</button>
          )}
        </div>
      )}

      {view === 'list' && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Listă intervale</h2>
          <div className="mb-2">
            <select
              value={filter.period}
              onChange={(e) => setFilter({...filter, period: e.target.value})}
              className="mr-2 p-2 border rounded"
            >
              <option value="all">Toate</option>
              <option value="day">Azi</option>
              <option value="week">Această săptămână</option>
              <option value="month">Această lună</option>
            </select>
            <select
              value={filter.category}
              onChange={(e) => setFilter({...filter, category: e.target.value})}
              className="p-2 border rounded"
            >
              <option value="all">Toate categoriile</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <table className="w-full border-collapse border">
            <thead>
              <tr>
                <th className="border p-2">Data Start</th>
                <th className="border p-2">Ora Start</th>
                <th className="border p-2">Data Sfârșit</th>
                <th className="border p-2">Ora Sfârșit</th>
                <th className="border p-2">Categorie</th>
                <th className="border p-2">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filteredIntervals.map((interval, index) => (
                <tr key={index}>
                  <td className="border p-2">{interval.startDate}</td>
                  <td className="border p-2">{interval.startTime}</td>
                  <td className="border p-2">{interval.endDate}</td>
                  <td className="border p-2">{interval.endTime}</td>
                  <td className="border p-2">{interval.category}</td>
                  <td className="border p-2">
                    <button onClick={() => deleteInterval(index)} className="px-2 py-1 bg-red-500 text-white rounded">Șterge</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'chart' && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Rezumat pe categorii</h2>
          <table className="w-full border-collapse border mb-4">
            <thead>
              <tr>
                <th className="border p-2">Categorie</th>
                <th className="border p-2">Timp Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedIntervals).sort((a, b) => b[1].totalTime - a[1].totalTime).map(([category, data], index) => (
                <tr key={index}>
                  <td className="border p-2">{category}</td>
                  <td className="border p-2">{formatDuration(data.totalTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTrackerApp;