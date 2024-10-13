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

  const deleteCategory = (categoryToDelete) => {
    const isCategoryUsed = intervals.some(interval => interval.categoryId === categoryToDelete.id);
    
    if (isCategoryUsed) {
      toast.error('Nu se poate șterge o categorie utilizată în intervale!');
    } else {
      const updatedCategories = localCategories.filter(cat => cat.id !== categoryToDelete.id);
      setLocalCategories(updatedCategories);
      updateCategories(updatedCategories);
      toast.success('Categoria a fost ștearsă cu succes!');
    }
  };

  const toggleShowOnlyActive = () => {
    setShowOnlyActive(!showOnlyActive);
  };

  const filteredCategories = showOnlyActive
    ? localCategories.filter(cat => cat.active)
    : localCategories;

  const sortedCategories = [...filteredCategories].sort((a, b) => 
    a.name.localeCompare(b.name, 'ro', { sensitivity: 'base' })
  );

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Categorii"
      className="modal"
      overlayClassName="overlay"
      ariaHideApp={false}
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
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
          maxWidth: '400px',
          width: '90%',
          maxHeight: '90vh',
        }
      }}
    >
      <h2 className="text-xl font-semibold mb-4">Categorii</h2>
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showOnlyActive}
            onChange={toggleShowOnlyActive}
            className="mr-2"
          />
          Arată doar categoriile active
        </label>
      </div>
      <ul className="space-y-2 mb-4">
        {sortedCategories.map((category) => (
          <li key={category.id} className="flex justify-between items-center">
            <span>{category.name}</span>
            <div>
              <button
                onClick={() => editCategory(category)}
                className="px-2 py-1 bg-gray-200 rounded mr-2"
              >
                Editează
              </button>
              <button
                onClick={() => deleteCategory(category)}
                className="px-2 py-1 bg-red-500 text-white rounded"
              >
                Șterge
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button
        onClick={addNewCategory}
        className="px-4 py-2 bg-blue-500 text-white rounded mb-4 w-full"
      >
        Adaugă Categorie Nouă
      </button>
      <button
        onClick={onClose}
        className="px-4 py-2 bg-gray-300 text-gray-700 rounded mt-4 w-full"
      >
        Înapoi
      </button>
    </Modal>
  );
};

export default CategoryModal;
