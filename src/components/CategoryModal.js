import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';

const CategoryModal = ({ isOpen, onClose, categories, updateCategories, intervals, addNewOnOpen, directAdd = false }) => {
  const [localCategories, setLocalCategories] = useState(categories);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showInactive, setShowInactive] = useState(false);  // Add this line

  useEffect(() => {
    if (isOpen && addNewOnOpen) {
      addNewCategory();
    }
  }, [isOpen, addNewOnOpen]);

  const filteredCategories = showInactive 
    ? localCategories 
    : localCategories.filter(cat => cat.active);

  const sortedCategories = [...filteredCategories].sort((a, b) => 
    a.name.localeCompare(b.name, 'ro', { sensitivity: 'base' })
  );

  const openEditModal = (category) => {
    setEditingCategory({ ...category });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCategory(null);
    if (directAdd) {
      onClose(null);
    }
  };

  const saveCategory = () => {
    if (editingCategory) {
      if (editingCategory.name.trim() === '') {
        toast.error('Numele categoriei nu poate fi gol!');
        return;
      }
      
      const isDuplicate = localCategories.some(cat => 
        cat.name.toLowerCase() === editingCategory.name.toLowerCase() && cat !== editingCategory
      );

      if (isDuplicate) {
        toast.error('Există deja o categorie cu acest nume!');
        return;
      }

      const updatedCategories = localCategories.map(cat => 
        cat === editingCategory ? editingCategory : cat
      );
      if (!updatedCategories.includes(editingCategory)) {
        updatedCategories.push(editingCategory);
      }

      setLocalCategories(updatedCategories);
      updateCategories(updatedCategories);
      toast.success('Categoria a fost adăugată cu succes!');
      
      onClose(editingCategory);
      setIsEditModalOpen(false);
    }
  };

  const deleteCategory = () => {
    if (editingCategory) {
      if (intervals.some(interval => interval.category === editingCategory.name)) {
        toast.error('Nu se poate șterge o categorie utilizată în intervale!');
      } else {
        setLocalCategories(localCategories.filter(cat => cat !== editingCategory));
        closeEditModal();
        updateCategories(localCategories.filter(cat => cat !== editingCategory));
        toast.success('Categoria a fost ștearsă cu succes!');
      }
    }
  };

  const addNewCategory = () => {
    const newCategory = { name: '', active: true };
    setEditingCategory(newCategory);
    setIsEditModalOpen(true);
  };

  const saveChanges = () => {
    updateCategories(localCategories);
    onClose();
  };

  // Add a toggle function for showInactive
  const toggleShowInactive = () => {
    setShowInactive(!showInactive);
  };

  // Randăm doar modalul de editare, indiferent dacă este adăugare directă sau nu
  return (
    <>
      {isOpen && (
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
            <button
              onClick={addNewCategory}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Adaugă categorie nouă
            </button>
          </div>
          <ul className="space-y-2">
            {sortedCategories.map((category) => (
              <li key={category.name} className="flex justify-between items-center">
                <span>{category.name}</span>
                <button
                  onClick={() => openEditModal(category)}
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  Editează
                </button>
              </li>
            ))}
          </ul>
          {isEditModalOpen && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">
                {editingCategory.name ? "Editare Categorie" : "Adaugă Categorie Nouă"}
              </h3>
              <input
                type="text"
                value={editingCategory ? editingCategory.name : ''}
                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                className="w-full p-2 border rounded mb-4"
                placeholder="Numele categoriei"
              />
              <div className="flex justify-end space-x-2">
                <button onClick={closeEditModal} className="px-4 py-2 bg-gray-300 rounded">Anulează</button>
                <button onClick={saveCategory} className="px-4 py-2 bg-blue-500 text-white rounded">Salvează</button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </>
  );
};

export default CategoryModal;