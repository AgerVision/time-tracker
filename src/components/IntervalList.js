import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, LabelList } from 'recharts';
import { filterIntervals, groupIntervals, formatDuration } from '../utils/intervalUtils';
import { differenceInMinutes, differenceInDays, parseISO } from 'date-fns';
import { formatTimeWithoutSeconds } from '../utils/intervalUtils';
import { format, isSameDay } from 'date-fns';
import { useLocation } from 'react-router-dom';

const IntervalList = ({ 
  intervals, 
  filter, 
  setFilter, 
  listView, 
  setListView, 
  categories, 
  openEditModal, 
  openDeleteModal,
}) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const forceTable = searchParams.get('table') === 'force';

  const { filteredIntervals, totalPeriodTime } = filterIntervals(intervals, filter, listView === 'graph');

  // Calculate the number of days in the filtered interval
  const fromDate = parseISO(filter.fromDate);
  const toDate = parseISO(filter.toDate);
  const totalDays = differenceInDays(toDate, fromDate) + 1; // +1 to include both start and end dates

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

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const calculateDuration = (interval) => {
    const start = new Date(`${interval.startDate}T${interval.startTime}`);
    const end = new Date(`${interval.endDate}T${interval.endTime}`);
    return differenceInMinutes(end, start);
  };

  const groupedIntervals = Array.isArray(filteredIntervals) 
    ? groupIntervals(filteredIntervals, calculateDuration, getCategoryName)
    : {};

  const totalAllocatedTime = Object.values(groupedIntervals).reduce((sum, { totalTime }) => sum + totalTime, 0);
  const unallocatedTime = Math.max(0, totalPeriodTime - totalAllocatedTime);
  const chartData = Object.entries(groupedIntervals)
    .map(([category, data]) => ({
      name: category,
      value: data.totalTime,
      hours: (data.totalTime / 60).toFixed(1),
      avgHoursPerDay: (data.totalTime / 60 / totalDays).toFixed(1)
    }));

  if (unallocatedTime > 0) {
    chartData.push({
      name: 'Nealocat',
      value: unallocatedTime,
      hours: (unallocatedTime / 60).toFixed(1),
      avgHoursPerDay: (unallocatedTime / 60 / totalDays).toFixed(1)
    });
  }

  chartData.sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border p-2 shadow-md">
          <p>{`${data.name}`}</p>
          <p>{`Total: ${data.hours} ore`}</p>
          {totalDays > 1 && <p>{`Medie/zi: ${data.avgHoursPerDay} ore`}</p>}
        </div>
      );
    }
    return null;
  };

  // Sort categories alphabetically
  const sortedCategories = [...categories].sort((a, b) => 
    a.name.localeCompare(b.name, 'ro', { sensitivity: 'base' })
  );

  const formatDateTimeCompact = (startDate, startTime, endDate, endTime) => {
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    
    if (isSameDay(start, end)) {
      return `${format(start, 'dd.MM.yyyy')} ${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
    } else {
      return `${format(start, 'dd.MM.yyyy HH:mm')} - ${format(end, 'dd.MM.yyyy HH:mm')}`;
    }
  };

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#45B39D', '#F4D03F', '#DC7633', '#5DADE2', '#48C9B0', '#F5B041', '#EC7063'];

  const CustomLabel = ({ x, y, width, height, value, index }) => {
    const entry = chartData[index];
    const hours = entry ? parseFloat(entry.hours).toFixed(1) : '0.0';
    const avgPerDay = totalDays > 1 ? `(${parseFloat(entry.avgHoursPerDay).toFixed(1)})` : '';

    return (
      <text 
        x={x + width + 5} 
        y={y + height / 2} 
        dy={avgPerDay ? -4 : 0.15 * height} // Adjust dy for vertical centering
        fill="#333" 
        fontSize={14} 
        textAnchor="start"
      >
        {hours}
        {avgPerDay && (
          <tspan x={x + width + 5} dy={16}>
            {avgPerDay}
          </tspan>
        )}
      </text>
    );
  };

  const chartLabel = totalDays > 1 ? 'Format: Total ore (Medie ore/zi)' : 'Format: Total ore';

  return (
    <div>
      {/* Cronometru și Adaugă interval rămân neschimbate */}
      
      {/* Adăugăm un container cu border și fundal alb pentru secțiunea de raport */}
      <div className="border rounded-lg p-4 mt-4 shadow-sm bg-white">
        <h2 className="text-xl font-semibold mb-4">Raport</h2>
        <div className="mb-4">
          {/* Controalele de filtrare existente */}
          <div className="flex flex-col space-y-2 mb-2">
            <div className="flex items-center">
              <label htmlFor="fromDate" className="text-sm w-20">De la:</label>
              <input
                id="fromDate"
                type="date"
                name="fromDate"
                value={filter.fromDate || today}
                onChange={handleFilterChange}
                className="p-2 border rounded flex-grow"
              />
            </div>
            <div className="flex items-center">
              <label htmlFor="toDate" className="text-sm w-20">Până la:</label>
              <input
                id="toDate"
                type="date"
                name="toDate"
                value={filter.toDate || today}
                onChange={handleFilterChange}
                className="p-2 border rounded flex-grow"
              />
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            {listView === 'table' && (
              <div className="flex items-center">
                <label htmlFor="category" className="text-sm w-20">Categorie:</label>
                <select
                  id="category"
                  name="category"
                  value={filter.category}
                  onChange={handleFilterChange}
                  className="p-2 border rounded flex-grow"
                >
                  <option key="all" value="all">Toate categoriile</option>
                  {sortedCategories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setListView(listView === 'table' ? 'graph' : 'table');
                  if (listView === 'table') {
                    // Reset category filter when switching to graph view
                    setFilter(prevFilter => ({ ...prevFilter, category: 'all' }));
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                {listView === 'table' ? 'Vizualizare grafic' : 'Vizualizare tabel'}
              </button>
            </div>
          </div>
        </div>
        
        {listView === 'graph' && chartData.length > 0 && (
          <div className="mt-4 mb-8">
            <p className="text-center text-sm text-gray-600 mb-2">
              {chartLabel}
            </p>
            <ResponsiveContainer width="100%" height={chartData.length * 40 + 40}>
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 5, right: 35, left: 0, bottom: 5 }}
              >
                <XAxis type="number" hide={true} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={window.innerWidth * 0.3}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                  <LabelList 
                    dataKey="hours" 
                    position="right" 
                    content={<CustomLabel />}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {(listView === 'table' || (listView === 'graph' && forceTable)) && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2 text-left">Interval</th>
                  <th className="border p-2 text-left">Categorie</th>
                  <th className="border p-2 text-left">Durată</th>
                </tr>
              </thead>
              <tbody>
                {filteredIntervals.map((interval, index) => (
                  <tr key={index} className={interval.categoryId === 'Unallocated' ? 'bg-gray-100' : ''}>
                    <td className="border p-2">
                      <div className="text-sm">
                        {listView === 'table' ? (
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              openEditModal(interval);
                            }}
                            className="text-blue-600 hover:underline"
                          >
                            {formatDateTimeCompact(
                              interval.startDate, 
                              interval.startTime, 
                              interval.endDate, 
                              interval.endTime
                            )}
                          </a>
                        ) : (
                          <span>
                            {formatDateTimeCompact(
                              interval.startDate, 
                              interval.startTime, 
                              interval.endDate, 
                              interval.endTime
                            )}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="border p-2">{getCategoryName(interval.categoryId)}</td>
                    <td className="border p-2">{formatDuration(calculateDuration(interval))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntervalList;
