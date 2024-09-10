import React from 'react';
import ImportExportData from './ImportExportData';

const HamburgerMenu = ({ 
  isOpen, 
  setIsOpen, 
  openCategoryModal, 
  intervals, 
  categories, 
  setIntervals, 
  setCategories
}) => {
  const handleMenuItemClick = (action) => {
    action();
    setIsOpen(false);
  };

  const handleOpenCategoryModal = () => {
    openCategoryModal(null, false, false, false); // Set autoCloseOnSave to false
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-blue-500 hover:text-blue-600 transition-colors duration-200"
        aria-label={isOpen ? "Închide meniul" : "Deschide meniul"}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-blue-500 rounded-md shadow-lg overflow-hidden z-10 flex flex-col">
          <button
            onClick={handleOpenCategoryModal}
            className="w-full px-4 py-2 text-white text-center hover:bg-blue-600 transition-colors duration-200"
          >
            Categorii
          </button>
          <ImportExportData
            intervals={intervals}
            categories={categories}
            setIntervals={setIntervals}
            setCategories={setCategories}
            onActionComplete={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;