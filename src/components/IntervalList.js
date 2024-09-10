import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { filterIntervals, groupIntervals, formatDuration } from '../utils/intervalUtils';
import { differenceInMinutes } from 'date-fns';
import { formatTimeWithoutSeconds } from '../utils/intervalUtils';
import { format } from 'date-fns';

const IntervalList = ({ intervals, filter, setFilter, listView, setListView, categories, openEditModal, openDeleteModal }) => {
  const { filteredIntervals, totalPeriodTime } = filterIntervals(intervals, filter, listView === 'graph');

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prevFilter => {
      const newFilter = { ...prevFilter, [name]: value };
      
      // Dacă 'De la' devine mai mare decât 'Până la', actualizăm 'Până la'
      if (name === 'fromDate' && value > newFilter.toDate) {
        newFilter.toDate = value;
      }
      
      return newFilter;
    });
  };

  const today = new Date().toISOString().split('T')[0];

  const calculateDuration = (interval) => {
    const start = new Date(`${interval.startDate}T${interval.startTime}`);
    const end = new Date(`${interval.endDate}T${interval.endTime}`);
    return differenceInMinutes(end, start);
  };

  const groupedIntervals = Array.isArray(filteredIntervals) 
    ? groupIntervals(filteredIntervals, calculateDuration)
    : {};

  const totalAllocatedTime = Object.values(groupedIntervals).reduce((sum, { totalTime }) => sum + totalTime, 0);
  const unallocatedTime = Math.max(0, totalPeriodTime - totalAllocatedTime);

  const chartData = Object.entries(groupedIntervals)
    .map(([category, data]) => ({
      name: category,
      value: data.totalTime,
      percentage: (data.totalTime / totalPeriodTime) * 100  // Înmulțim cu 100 aici
    }));

  if (unallocatedTime > 0) {
    chartData.push({
      name: 'Nealocat',
      value: unallocatedTime,
      percentage: (unallocatedTime / totalPeriodTime) * 100  // Înmulțim cu 100 aici
    });
  }

  // Sort chart data by value in descending order
  chartData.sort((a, b) => b.value - a.value);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#a4de6c', '#d0ed57', '#cccccc'];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Folosim direct procentul calculat din chartData
    const displayPercent = `${chartData[index].percentage.toFixed(1)}%`;

    return (
      <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${name} ${displayPercent}`}
      </text>
    );
  };

  const renderLegend = (props) => {
    const { payload } = props;

    return (
      <ul className="list-none p-0 mt-4">
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="inline-block mr-4 mb-2">
            <span className="inline-block w-3 h-3 mr-1" style={{ backgroundColor: entry.color }}></span>
            <span>
              {entry.value}: {formatDuration(entry.payload.value)} 
              ({entry.payload.percentage.toFixed(1)}%)
            </span>
          </li>
        ))}
      </ul>
    );
  };

  // Sort categories alphabetically
  const sortedCategories = [...categories].sort((a, b) => 
    a.name.localeCompare(b.name, 'ro', { sensitivity: 'base' })
  );

  return (
    <div>
      <div className="mb-4 flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <label htmlFor="fromDate" className="text-sm">De la:</label>
          <input
            id="fromDate"
            type="date"
            name="fromDate"
            value={filter.fromDate || today}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          />
        </div>
        <div className="flex items-center space-x-1">
          <label htmlFor="toDate" className="text-sm">Până la:</label>
          <input
            id="toDate"
            type="date"
            name="toDate"
            value={filter.toDate || today}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          />
        </div>
        {listView === 'table' && (
          <div className="flex items-center space-x-1">
            <label htmlFor="category" className="text-sm">Categorie:</label>
            <select
              id="category"
              name="category"
              value={filter.category}
              onChange={handleFilterChange}
              className="p-2 border rounded"
            >
              <option value="all">Toate categoriile</option>
              {sortedCategories.map((category, index) => (
                <option key={index} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>
        )}
        <button
          onClick={() => {
            setListView(listView === 'table' ? 'graph' : 'table');
            if (listView === 'table') {
              // Reset category filter when switching to graph view
              setFilter(prevFilter => ({ ...prevFilter, category: 'all' }));
            }
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded ml-auto"
        >
          {listView === 'table' ? 'Vizualizare grafic' : 'Vizualizare tabel'}
        </button>
      </div>
      
      {listView === 'graph' && chartData.length > 0 && (
        <div className="mt-4 mb-8">
          <ResponsiveContainer width="100%" height={500}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={renderCustomizedLabel}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === 'Nealocat' ? '#cccccc' : COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => [
                  `${formatDuration(value)} (${props.payload.percentage.toFixed(1)}%)`,
                  name
                ]}
              />
              <Legend content={renderLegend} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
      <table className="w-full border-collapse border">
        <thead>
          <tr>
            <th className="border p-2">Data Start</th>
            <th className="border p-2">Ora Start</th>
            <th className="border p-2">Data Sfârșit</th>
            <th className="border p-2">Ora Sfârșit</th>
            <th className="border p-2">Categorie</th>
            <th className="border p-2">Durat</th>
            {listView === 'table' && <th className="border p-2">Acțiuni</th>}
          </tr>
        </thead>
        <tbody>
          {filteredIntervals.map((interval, index) => (
            <tr key={index} className={interval.category === 'Unallocated' ? 'bg-gray-100' : ''}>
              <td className="border p-2">{interval.startDate}</td>
              <td className="border p-2">{formatTimeWithoutSeconds(interval.startTime)}</td>
              <td className="border p-2">{interval.endDate}</td>
              <td className="border p-2">{formatTimeWithoutSeconds(interval.endTime)}</td>
              <td className="border p-2">{interval.category}</td>
              <td className="border p-2">{formatDuration(calculateDuration(interval))}</td>
              {listView === 'table' && (
                <td className="border p-2">
                  {interval.category !== 'Unallocated' && (
                    <>
                      <button onClick={() => openEditModal(interval)} className="mr-2 px-2 py-1 bg-blue-500 text-white rounded">Editează</button>
                      <button onClick={() => openDeleteModal(interval)} className="px-2 py-1 bg-red-500 text-white rounded">Șterge</button>
                    </>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IntervalList;