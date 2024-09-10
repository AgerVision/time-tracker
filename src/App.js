import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import IntervalForm from './components/IntervalForm';
import CategoryModal from './components/CategoryModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import Timer from './components/Timer';
import IntervalList from './components/IntervalList';
import { useModals } from './hooks/useModals';
import { useInitialState } from './hooks/useInitialState';
import { useLocalStorage } from './hooks/useLocalStorage';
import { addInterval, deleteInterval, saveEditedInterval } from './utils/intervalUtils';
import ImportExportData from './components/ImportExportData';

const TimeTrackerApp = () => {
  const { 
    intervals, setIntervals, categories, setCategories, 
    newInterval, setNewInterval, filter, setFilter, listView, setListView 
  } = useInitialState();

  const { 
    isEditModalOpen, isDeleteModalOpen, isCategoryModalOpen,
    editingInterval, intervalToDelete, openEditModal, closeEditModal,
    openDeleteModal, closeDeleteModal, openCategoryModal, closeCategoryModal,
    setEditingInterval
  } = useModals();

  useLocalStorage(intervals, categories);

  const handleAddInterval = (interval) => {
    const newInterval = {
      ...interval,
      id: `${new Date().toISOString().replace(/[-:T.]/g, '')}${Math.random().toString(36).substr(2, 6)}`
    };
    if (addInterval(newInterval, intervals, categories, setIntervals, setCategories)) {
      toast.success('Interval adăugat cu succes!');
      setNewInterval({
        startDate: interval.endDate,
        startTime: interval.endTime,
        endDate: interval.endDate,
        endTime: interval.endTime,
        category: ''
      });
    }
  };

  const handleDeleteInterval = () => {
    if (intervalToDelete !== null) {
      setIntervals(prevIntervals => prevIntervals.filter(interval => interval.id !== intervalToDelete.id));
      closeDeleteModal();
      toast.success('Interval șters cu succes!');
    }
  };

  const handleSaveEditedInterval = (updatedInterval) => {
    if (editingInterval) {
      setIntervals(prevIntervals => prevIntervals.map(interval => 
        interval.id === editingInterval.id ? { ...updatedInterval, id: interval.id } : interval
      ));
      closeEditModal();
      toast.success('Interval actualizat cu succes!');
    }
  };

  const updateCategories = (newCategories) => {
    setCategories(newCategories);
  };

  const handleOpenEditModal = (interval) => {
    setNewInterval(interval);
    setEditingInterval(null); // Ensure we're in "add" mode, not "edit" mode
    openEditModal(interval);
  };

  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Time Tracker</h1>

      <div className="flex mb-6">
        <div className="w-full md:w-1/4 pr-0 md:pr-4 mb-4 md:mb-0">
          <Timer 
            categories={categories.filter(cat => cat.active)} 
            addInterval={handleAddInterval}
            openEditModal={handleOpenEditModal}
          />
          <button 
            onClick={openCategoryModal} 
            className="w-full px-4 py-2 bg-blue-500 text-white rounded mb-2"
            aria-label="Deschide gestionarea categoriilor"
          >
            Categorii
          </button>
          <ImportExportData 
            intervals={intervals}
            categories={categories}
            setIntervals={setIntervals}
            setCategories={setCategories}
          />
        </div>
        <div className="w-full md:w-3/4 pl-0 md:pl-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Adaugă interval</h2>
            <IntervalForm
              interval={newInterval}
              setInterval={setNewInterval}
              categories={categories.filter(cat => cat.active)}
              onSave={handleAddInterval}
              openAddCategoryModal={openCategoryModal}
              intervals={intervals}
            />
          </div>
        </div>
      </div>

      <IntervalList 
        intervals={intervals}
        filter={filter}
        setFilter={setFilter}
        listView={listView}
        setListView={setListView}
        categories={categories}
        openEditModal={openEditModal}
        openDeleteModal={openDeleteModal}
      />

      {isEditModalOpen && (
        <IntervalForm
          interval={newInterval}
          setInterval={setNewInterval}
          categories={categories.filter(cat => cat.active)}
          onSave={handleAddInterval}
          openAddCategoryModal={openCategoryModal}
          intervals={intervals}
          isModalOpen={isEditModalOpen}
          closeModal={closeEditModal}
          filter={filter}
        />
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteInterval}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={closeCategoryModal}
        categories={categories}
        updateCategories={updateCategories}
        intervals={intervals}
      />
    </div>
  );
};

export default TimeTrackerApp;