import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';

const generateId = () => {
  const now = new Date();
  const datePart = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const randomPart = Math.random().toString(36).substr(2, 6);
  return `${datePart}${randomPart}`;
};

const CategoryModal = ({ isOpen, onClose, categories, updateCategories, intervals, addNewOnOpen, directAdd = false, onCategorySaved }) => {
  const [localCategories, setLocalCategories] = useState(categories);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  useEffect(() => {
    if (isOpen && addNewOnOpen) {
      addNewCategory();
    } else if (!isOpen) {
      setEditingCategory(null);
      setIsEditing(false);
    }
  }, [isOpen, addNewOnOpen]);

  const addNewCategory = () => {
    setEditingCategory({ name: '', active: true, id: '' });
    setIsEditing(false);
  };

  const editCategory = (category) => {
    setEditingCategory({ ...category });
    setIsEditing(true);
  };

  const saveCategory = () => {
    if (!editingCategory) return;

    if (editingCategory.name.trim() === '') {
      toast.error('Numele categoriei nu poate fi gol!');
      return;
    }
    
    const isDuplicate = localCategories.some(cat => 
      cat.name.toLowerCase() === editingCategory.name.toLowerCase() && cat.id !== editingCategory.id
    );

    if (isDuplicate) {
      toast.error('Există deja o categorie cu acest nume!');
      return;
    }

    let updatedCategories;
    let savedCategory;
    if (isEditing) {
      updatedCategories = localCategories.map(cat => 
        cat.id === editingCategory.id ? editingCategory : cat
      );
      savedCategory = editingCategory;
      toast.success('Categoria a fost actualizată cu succes!');
    } else {
      savedCategory = { ...editingCategory, id: generateId() };
      updatedCategories = [...localCategories, savedCategory];
      toast.success('Categoria a fost adăugată cu succes!');
    }

    setLocalCategories(updatedCategories);
    updateCategories(updatedCategories);
    setEditingCategory(null);
    setIsEditing(false);
    
    // Apelăm callback-ul onCategorySaved cu categoria salvată
    onCategorySaved(savedCategory);
  };

  const deleteCategory = (categoryToDelete) => {
    if (intervals.some(interval => interval.category === categoryToDelete.name)) {
      toast.error('Nu se poate șterge o categorie utilizată în intervale!');
    } else {
      const updatedCategories = localCategories.filter(cat => cat.id !== categoryToDelete.id);
      setLocalCategories(updatedCategories);
      updateCategories(updatedCategories);
      toast.success('Categoria a fost ștearsă cu succes!');
    }
  };

  const filteredCategories = showInactive 
    ? localCategories 
    : localCategories.filter(cat => cat.active);

  const sortedCategories = [...filteredCategories].sort((a, b) => 
    a.name.localeCompare(b.name, 'ro', { sensitivity: 'base' })
  );

  const cancelEdit = () => {
    setEditingCategory(null);
    setIsEditing(false);
  };

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
      <h2 className="text-xl font-semibold mb-4">
        {isEditing ? 'Editează Categoria' : 'Adaugă Categorie Nouă'}
      </h2>
      <div className="mb-4">
        <div className="flex flex-col space-y-2">
          <input
            type="text"
            value={editingCategory ? editingCategory.name : ''}
            onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
            className="p-2 border rounded"
            placeholder="Numele categoriei"
          />
          {isEditing && (
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={editingCategory.active}
                onChange={(e) => setEditingCategory({ ...editingCategory, active: e.target.checked })}
                className="mr-2"
              />
              <label>Activ</label>
            </div>
          )}
          <button
            onClick={saveCategory}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {isEditing ? 'Modifică' : 'Adaugă'}
          </button>
          {isEditing && (
            <button
              onClick={cancelEdit}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
            >
              Renunță
            </button>
          )}
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-4">Categorii</h2>
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="showInactive"
          checked={showInactive}
          onChange={(e) => setShowInactive(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="showInactive">Arată categorii inactive</label>
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
        onClick={onClose}
        className="w-full px-4 py-2 bg-gray-300 text-gray-800 rounded mt-4"
      >
        Înapoi
      </button>
    </Modal>
  );
};

export default CategoryModal;