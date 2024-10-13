import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';

const generateId = () => {
  const now = new Date();
  const datePart = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const randomPart = Math.random().toString(36).substr(2, 6);
  return `${datePart}${randomPart}`;
};

const CategoryModal = ({ 
  isOpen, 
  onClose, 
  categories, 
  updateCategories, 
  intervals, 
  addNewOnOpen, 
  directAdd = false, 
  onCategorySaved,
  autoCloseOnSave = true,
  openEditCategoryModal
}) => {
  const [localCategories, setLocalCategories] = useState(categories);
  const [showOnlyActive, setShowOnlyActive] = useState(true);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  useEffect(() => {
    if (isOpen && addNewOnOpen) {
      addNewCategory();
    }
  }, [isOpen, addNewOnOpen]);

  const addNewCategory = () => {
    const newCategory = { id: generateId(), name: '', active: true };
    openEditCategoryModal(newCategory);
  };

  const editCategory = (category) => {
    openEditCategoryModal(category);
  };

  const sortedCategories = [...localCategories]
    .filter(cat => !showOnlyActive || cat.active)
    .sort((a, b) => a.name.localeCompare(b.name, 'ro', { sensitivity: 'base' }));

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Categorii"
      className="modal"
      overlayClassName="overlay"
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        },
        content: {
          position: 'relative',
          top: 'auto',
          left: 'auto',
          right: 'auto',
          bottom: 'auto',
          border: 'none',
          background: '#fff',
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
          borderRadius: '4px',
          outline: 'none',
          padding: '20px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <h2 className="text-2xl font-semibold mb-4">Categorii</h2>
      
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showOnlyActive}
            onChange={(e) => setShowOnlyActive(e.target.checked)}
            className="mr-2"
          />
          Arată doar categoriile active
        </label>
      </div>
      
      <ul className="overflow-auto flex-grow mb-4">
        {sortedCategories.map((category) => (
          <li key={category.id} className="mb-2">
            <button
              onClick={() => editCategory(category)}
              className="w-full text-left hover:bg-gray-100 p-2 rounded transition-colors cursor-pointer flex items-center"
            >
              <span>{category.name}</span>
              <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
      
      <div className="flex justify-between mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
        >
          Înapoi
        </button>
        <button
          onClick={addNewCategory}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Adaugă categorie nouă
        </button>
      </div>
    </Modal>
  );
};

export default CategoryModal;
