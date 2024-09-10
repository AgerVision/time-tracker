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
    editingInterval, intervalToDelete, openEditModal, closeEditModal,
    openDeleteModal, closeDeleteModal, openCategoryModal, closeCategoryModal,
    setEditingInterval
  } = useModals();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categoryModalCallback, setCategoryModalCallback] = useState(null);
  const [addNewCategoryOnOpen, setAddNewCategoryOnOpen] = useState(false);
  const [directAdd, setDirectAdd] = useState(false);

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
      closeEditModal();  // Add this line to close the edit modal
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
    // Dacă folosiți local storage pentru persistență, adăugați și:
    localStorage.setItem('categories', JSON.stringify(newCategories));
  };

  const handleOpenEditModal = (interval) => {
    setNewInterval(interval);
    setEditingInterval(interval);
    openEditModal(interval);
  };

  const handleOpenCategoryModal = (callback, addNew = false, directAdd = false) => {
    console.log('Opening category modal, addNew:', addNew, 'directAdd:', directAdd);
    setAddNewCategoryOnOpen(addNew);
    setDirectAdd(directAdd);
    setCategoryModalCallback(() => callback);
    openCategoryModal();
  };

  const handleCloseCategoryModal = () => {
    closeCategoryModal();
    setAddNewCategoryOnOpen(false);
    setDirectAdd(false);
    setCategoryModalCallback(null);
  };

  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
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
            openEditModal={handleOpenEditModal}
            openCategoryModal={handleOpenCategoryModal}
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
              openCategoryModal={handleOpenCategoryModal}
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
          />
        </div>
      </div>

      {isEditModalOpen && (
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
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteInterval}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseCategoryModal}
        categories={categories}
        updateCategories={updateCategories}
        intervals={intervals}
        addNewOnOpen={addNewCategoryOnOpen}
        directAdd={directAdd}
      />
    </div>
  );
};

export default TimeTrackerApp;