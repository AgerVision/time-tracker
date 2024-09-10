import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { filterIntervals, groupIntervals, formatDuration } from '../utils/intervalUtils';
import { differenceInMinutes } from 'date-fns';
import { formatTimeWithoutSeconds } from '../utils/intervalUtils';
import { format, isSameDay } from 'date-fns';

const IntervalList = ({ 
  intervals, 
  filter, 
  setFilter, 
  listView, 
  setListView, 
  categories, 
  openEditModal, 
  openDeleteModal,
  openCategoryModal  // Add this prop
}) => {
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
      value: data.totalTime
    }));

  if (unallocatedTime > 0) {
    chartData.push({
      name: 'Nealocat',
      value: unallocatedTime
    });
  }

  // Sort chart data by value in descending order
  chartData.sort((a, b) => b.value - a.value);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#a4de6c', '#d0ed57', '#cccccc'];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Afișăm eticheta doar dacă procentul este mai mare de 5%
    if (percent < 0.05) return null;

    return (
      <g>
        <text 
          x={x} 
          y={y-10} 
          fill="black" 
          textAnchor="middle" 
          dominantBaseline="central"
          className="text-xs md:text-sm font-semibold"
        >
          {name}
        </text>
        <text 
          x={x} 
          y={y+10} 
          fill="black" 
          textAnchor="middle" 
          dominantBaseline="central"
          className="text-xs md:text-sm"
        >
          {formatDuration(chartData[index].value)}
        </text>
      </g>
    );
  };

  const renderLegend = (props) => {
    const { payload } = props;

    return (
      <ul className="list-none p-0 mt-4 flex flex-wrap justify-center">
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="mr-4 mb-2">
            <span className="inline-block w-3 h-3 mr-1" style={{ backgroundColor: entry.color }}></span>
            <span className="text-sm">
              {entry.value}: {formatDuration(entry.payload.value)}
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

  const formatDateTimeCompact = (startDate, startTime, endDate, endTime) => {
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    
    if (isSameDay(start, end)) {
      return `${format(start, 'dd.MM.yyyy')} ${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
    } else {
      return `${format(start, 'dd.MM.yyyy HH:mm')} - ${format(end, 'dd.MM.yyyy HH:mm')}`;
    }
  };

  const handleAddNewCategory = () => {
    openCategoryModal((newCategory) => {
      if (newCategory && newCategory.name) {
        setFilter(prevFilter => ({ ...prevFilter, category: newCategory.id }));
      }
    }, true, true);
  };

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
                  <option value="all">Toate categoriile</option>
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
              <button
                onClick={handleAddNewCategory}
                className="px-2 py-1 bg-blue-500 text-white rounded ml-2"
              >
                +
              </button>
            </div>
          </div>
        </div>
        
        {listView === 'graph' && chartData.length > 0 && (
          <div className="mt-4 mb-8">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius="80%"
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Nealocat' ? '#cccccc' : COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [formatDuration(value), name]}
                />
                <Legend content={renderLegend} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        
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
                <tr key={index} className={interval.category === 'Unallocated' ? 'bg-gray-100' : ''}>
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
                  <td className="border p-2">{interval.category}</td>
                  <td className="border p-2">{formatDuration(calculateDuration(interval))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IntervalList;