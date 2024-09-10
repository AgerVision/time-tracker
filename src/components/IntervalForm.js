import React, { useEffect, useState, useCallback } from 'react';
import CategoryDropdown from './CategoryDropdown';
import { toast } from 'react-toastify';
import Modal from 'react-modal';
import { filterIntervals, groupIntervals, formatDuration } from '../utils/intervalUtils';
import { differenceInMinutes } from 'date-fns';

const IntervalForm = ({ interval, setInterval, categories, onSave, openCategoryModal, intervals, isModalOpen, closeModal, filter, editingInterval, openDeleteModal }) => {
  useEffect(() => {
    if (editingInterval) {
      setLocalInterval(editingInterval);
    } else {
      setLocalInterval(interval);
    }
  }, [interval, editingInterval]);

  const [localInterval, setLocalInterval] = useState(editingInterval || interval);

  const roundToNearestFiveMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    const coeff = 1000 * 60 * 5;
    const rounded = new Date(Math.round(date.getTime() / coeff) * coeff);
    return rounded.toTimeString().slice(0, 5);
  };

  const handleTimeChange = (field, value) => {
    setLocalInterval(prev => {
      const newInterval = { ...prev, [field]: value };
      
      if (!editingInterval) {
        // Only apply these changes for new intervals
        if (field === 'startDate') {
          newInterval.endDate = value;
        }
        
        if (newInterval.startDate === newInterval.endDate && field === 'startTime') {
          const startTime = new Date(`2000-01-01T${value}`);
          startTime.setMinutes(startTime.getMinutes() + 5);
          newInterval.endTime = startTime.toTimeString().slice(0, 5);
        }
      }
      
      return newInterval;
    });
  };

  const handleTimeBlur = (field) => {
    const originalTime = localInterval[field];
    const roundedTime = roundToNearestFiveMinutes(originalTime);
    
    if (originalTime !== roundedTime) {
      setLocalInterval(prev => ({ ...prev, [field]: roundedTime }));
      toast.info(`Timpul a fost rotunjit la ${roundedTime}`);
    }
  };

  const handleCategoryChange = useCallback((e) => {
    const value = e.target.value;
    setLocalInterval(prev => ({...prev, categoryId: value}));
  }, []);

  const handleAddNewCategory = () => {
    openCategoryModal((newCategory) => {
      if (newCategory && newCategory.id) {
        console.log('New category added:', newCategory);
        setLocalInterval(prev => ({...prev, categoryId: newCategory.id}));
      }
    }, true, true);
  };

  const isOverlapping = (newInterval) => {
    return intervals.some((interval) => {
      if (editingInterval && interval.startDate === editingInterval.startDate &&
          interval.startTime === editingInterval.startTime &&
          interval.endDate === editingInterval.endDate &&
          interval.endTime === editingInterval.endTime) {
        return false; // Skip the current interval being edited
      }
      const newStart = new Date(`${newInterval.startDate}T${newInterval.startTime}`);
      const newEnd = new Date(`${newInterval.endDate}T${newInterval.endTime}`);
      const intStart = new Date(`${interval.startDate}T${interval.startTime}`);
      const intEnd = new Date(`${interval.endDate}T${interval.endTime}`);
      return (newStart < intEnd && newEnd > intStart);
    });
  };

  const validateInterval = (intervalToValidate) => {
    const start = new Date(`${intervalToValidate.startDate}T${intervalToValidate.startTime}`);
    const end = new Date(`${intervalToValidate.endDate}T${intervalToValidate.endTime}`);
    
    if (end <= start) {
      toast.error('Data/ora de sfârit trebuie să fie după data/ora de început!');
      return false;
    }
    
    const durationMinutes = (end - start) / 1000 / 60;
    
    if (durationMinutes < 5) {
      toast.error('Durata intervalului trebuie s fie de cel puțin 5 minute!');
      return false;
    }

    if (isOverlapping(intervalToValidate)) {
      toast.error('Intervalul se suprapune cu unul existent!');
      return false;
    }

    return true;
  };

  const handleSave = useCallback(() => {
    const roundedInterval = {
      ...localInterval,
      startTime: roundToNearestFiveMinutes(localInterval.startTime),
      endTime: roundToNearestFiveMinutes(localInterval.endTime)
    };

    if (!roundedInterval.categoryId) {
      toast.error('Vă rugăm să selectați o categorie!');
      return;
    }

    if (validateInterval(roundedInterval)) {
      onSave(editingInterval ? { ...roundedInterval, id: editingInterval.id } : roundedInterval);
      if (typeof closeModal === 'function') {
        closeModal();
      }
    }
  }, [localInterval, roundToNearestFiveMinutes, validateInterval, onSave, closeModal, editingInterval]);

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        options.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  const formContent = (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-1">
            <label className="text-sm text-gray-600 block mb-1">Data Start</label>
            <input
              type="date"
              value={localInterval.startDate}
              onChange={(e) => handleTimeChange('startDate', e.target.value)}
              className="w-full p-2 bg-gray-100 rounded-md text-m appearance-none"
            />
          </div>
          <div className="col-span-1">
            <label className="text-sm text-gray-600 block mb-1">Ora Start</label>
            <input
              type="time"
              value={localInterval.startTime}
              onChange={(e) => handleTimeChange('startTime', e.target.value)}
              onBlur={() => handleTimeBlur('startTime')}
              className="w-full p-2 bg-gray-100 rounded-md text-m appearance-none"
              step="60"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-1">
            <label className="text-sm text-gray-600 block mb-1">Data Sfârșit</label>
            <input
              type="date"
              value={localInterval.endDate}
              onChange={(e) => handleTimeChange('endDate', e.target.value)}
              className="w-full p-2 bg-gray-100 rounded-md text-m appearance-none"
            />
          </div>
          <div className="col-span-1">
            <label className="text-sm text-gray-600 block mb-1">Ora Sfârșit</label>
            <input
              type="time"
              value={localInterval.endTime}
              onChange={(e) => handleTimeChange('endTime', e.target.value)}
              onBlur={() => handleTimeBlur('endTime')}
              className="w-full p-2 bg-gray-100 rounded-md text-m appearance-none"
              step="60"
              min={localInterval.startDate === localInterval.endDate ? localInterval.startTime : undefined}
            />
          </div>
        </div>
        <div>
          <CategoryDropdown
            value={localInterval.categoryId}
            onChange={handleCategoryChange}
            categories={categories}
            onAddNew={handleAddNewCategory}
          />
        </div>
        <div>
          <button 
            onClick={handleSave} 
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            Salvează
          </button>
        </div>
      </div>
  );

  const calculateDuration = (interval) => {
    const start = new Date(`${interval.startDate}T${interval.startTime}`);
    const end = new Date(`${interval.endDate}T${interval.endTime}`);
    return differenceInMinutes(end, start);
  };

  const { filteredIntervals } = filter ? filterIntervals(intervals, filter) : { filteredIntervals: intervals };
  const groupedIntervals = groupIntervals(filteredIntervals, calculateDuration);

  if (isModalOpen !== undefined) {
    return (
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Edit Interval"
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '100%',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        }}
      >
        <h2 className="text-2xl font-semibold mb-4">
          {editingInterval ? 'Modifică interval' : 'Adaugă interval'}
        </h2>
        {formContent}
        <div className="flex justify-end mt-4">
          <button onClick={closeModal} className="px-4 py-2 bg-gray-300 rounded">Anulează</button>
        </div>
      </Modal>
    );
  }

  return formContent;
};

export default IntervalForm;