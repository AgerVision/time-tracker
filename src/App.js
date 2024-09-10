import React, { useState } from 'react';
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
import HamburgerMenu from './components/HamburgerMenu';

const TimeTrackerApp = () => {
  const { 
    intervals, setIntervals, categories, setCategories, 
    newInterval, setNewInterval, filter, setFilter, listView, setListView 
  } = useInitialState();

  const { 
    isEditModalOpen, isDeleteModalOpen, isCategoryModalOpen,
    editingInterval, intervalToDelete, categoryModalConfig,
    openEditModal, closeEditModal, openDeleteModal, closeDeleteModal,
    openCategoryModal, closeCategoryModal, setEditingInterval
  } = useModals();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useLocalStorage(intervals, categories);

  const handleAddInterval = (interval) => {
    const newInterval = {
      ...interval,
      id: `${new Date().toISOString().replace(/[-:T.]/g, '')}${Math.random().toString(36).substr(2, 6)}`
    };
    console.log('Adding new interval:', newInterval);
    if (addInterval(newInterval, intervals, categories, setIntervals, setCategories)) {
      console.log('Interval added successfully');
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
      closeEditModal();  // Add this line to close the edit modal
      toast.success('Interval șters cu succes!');
    }
  };

  const handleSaveEditedInterval = (updatedInterval) => {
    if (editingInterval && editingInterval.id) {
      // Editing an existing interval
      setIntervals(prevIntervals => prevIntervals.map(interval => 
        interval.id === editingInterval.id ? { ...updatedInterval, id: interval.id } : interval
      ));
    } else {
      // Adding a new interval
      const newInterval = {
        ...updatedInterval,
        id: `${new Date().toISOString().replace(/[-:T.]/g, '')}${Math.random().toString(36).substr(2, 6)}`
      };
      setIntervals(prevIntervals => [...prevIntervals, newInterval]);
    }
    closeEditModal();
    toast.success(editingInterval && editingInterval.id ? 'Interval actualizat cu succes!' : 'Interval adăugat cu succes!');
  };

  const updateCategories = (newCategories) => {
    setCategories(newCategories);
    // Dacă folosiți local storage pentru persistență, adăugați și:
    localStorage.setItem('categories', JSON.stringify(newCategories));
  };

  const handleOpenAddIntervalModal = (interval) => {
    setNewInterval(interval);
    openEditModal(interval);
  };

  const handleOpenEditModal = (interval) => {
    setNewInterval(interval);
    setEditingInterval(interval);
    openEditModal(interval);
  };

  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">Time Tracker</h1>
        <HamburgerMenu
          isOpen={isMenuOpen}
          setIsOpen={setIsMenuOpen}
          openCategoryModal={openCategoryModal}
          intervals={intervals}
          categories={categories}
          setIntervals={setIntervals}
          setCategories={setCategories}
          ImportExportData={ImportExportData}
        />
      </div>

      <div className="flex flex-col">
        <div className="w-full mb-6">
          <Timer 
            categories={categories.filter(cat => cat.active)} 
            addInterval={handleAddInterval}
            openAddIntervalModal={handleOpenAddIntervalModal}
            openCategoryModal={openCategoryModal}
          />
        </div>

        <div className="w-full mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Adaugă interval</h2>
            <IntervalForm
              interval={newInterval}
              setInterval={setNewInterval}
              categories={categories.filter(cat => cat.active)}
              onSave={handleAddInterval}
              openCategoryModal={openCategoryModal}
              intervals={intervals}
            />
          </div>
        </div>

        <div className="w-full mb-6">
          <IntervalList 
            intervals={intervals}
            filter={filter}
            setFilter={setFilter}
            listView={listView}
            setListView={setListView}
            categories={categories}
            openEditModal={openEditModal}
            openDeleteModal={openDeleteModal}
            openCategoryModal={openCategoryModal}  // Add this line
          />
        </div>
      </div>

      {isEditModalOpen && (
        <div aria-modal="true" role="dialog">
          <IntervalForm
            interval={newInterval}
            setInterval={setNewInterval}
            categories={categories.filter(cat => cat.active)}
            onSave={handleSaveEditedInterval}
            openAddCategoryModal={openCategoryModal}
            intervals={intervals}
            isModalOpen={isEditModalOpen}
            closeModal={closeEditModal}
            filter={filter}
            editingInterval={editingInterval}
            openDeleteModal={openDeleteModal}
          />
        </div>
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
        addNewOnOpen={categoryModalConfig.addNewOnOpen}
        directAdd={categoryModalConfig.directAdd}
        onCategorySaved={categoryModalConfig.onSave}
        autoCloseOnSave={categoryModalConfig.autoCloseOnSave}
      />
    </div>
  );
};

export default TimeTrackerApp;