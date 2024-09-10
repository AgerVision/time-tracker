import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';

const CategoryModal = ({ isOpen, onClose, categories, updateCategories, intervals }) => {
  const [localCategories, setLocalCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    setLocalCategories(categories.map(cat => typeof cat === 'string' ? { name: cat, active: true } : cat));
  }, [categories]);

  const addNewCategory = (newCategory) => {
    if (newCategory && !categories.some(cat => cat.name.toLowerCase() === newCategory.toLowerCase())) {
      updateCategories([...categories, { name: newCategory, active: true }]);
      toast.success('Categorie adăugată cu succes!');
    } else {
      toast.error('Categoria există deja sau este invalidă!');
    }
  };

  const updateCategory = (index, updatedCategory) => {
    const updated = [...localCategories];
    updated[index] = updatedCategory;
    setLocalCategories(updated);
  };

  const toggleCategoryStatus = (index) => {
    const updated = [...localCategories];
    updated[index].active = !updated[index].active;
    setLocalCategories(updated);
  };

  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setCategoryToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const deleteCategory = () => {
    if (categoryToDelete) {
      if (intervals.some(interval => interval.category === categoryToDelete.name)) {
        toast.error('Nu se poate șterge o categorie utilizată în intervale!');
      } else {
        setLocalCategories(localCategories.filter(cat => cat.name !== categoryToDelete.name));
        closeDeleteModal();
      }
    }
  };

  const saveChanges = () => {
    updateCategories(localCategories);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Gestionare Categorii"
      className="modal"
      overlayClassName="overlay"
      ariaHideApp={false}
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
          background: '#fff',
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
          borderRadius: '4px',
          outline: 'none',
          padding: '20px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          margin: '0 auto',
        }
      }}
    >
      <h2 className="text-2xl font-semibold mb-4">Gestionare Categorii</h2>
      <div className="mb-4">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="p-2 border rounded mr-2"
          placeholder="Nume categorie nouă"
        />
        <button onClick={addNewCategory} className="px-4 py-2 bg-green-500 text-white rounded">Adaugă</button>
      </div>
      <ul>
        {localCategories.map((category, index) => (
          <li key={index} className="flex items-center justify-between mb-2">
            {editingCategory === category.name ? (
              <input
                type="text"
                value={category.name}
                onChange={(e) => updateCategory(index, { ...category, name: e.target.value })}
                onBlur={() => setEditingCategory(null)}
                className="p-2 border rounded"
              />
            ) : (
              <span onClick={() => setEditingCategory(category.name)}>{category.name}</span>
            )}
            <div>
              <button
                onClick={() => toggleCategoryStatus(index)}
                className={`px-2 py-1 mr-2 rounded ${category.active ? 'bg-green-500' : 'bg-red-500'} text-white`}
              >
                {category.active ? 'Activ' : 'Inactiv'}
              </button>
              <button
                onClick={() => openDeleteModal(category)}
                className="px-2 py-1 bg-red-500 text-white rounded"
              >
                Șterge
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <button onClick={saveChanges} className="px-4 py-2 bg-blue-500 text-white rounded mr-2">Salvează</button>
        <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Anulează</button>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={closeDeleteModal}
        contentLabel="Confirmare Ștergere"
        className="modal"
        overlayClassName="overlay"
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
            background: '#fff',
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
            borderRadius: '4px',
            outline: 'none',
            padding: '20px',
            maxWidth: '400px',
            width: '90%',
            maxHeight: '90vh',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            margin: '0 auto',
          }
        }}
      >
        <h2 className="text-xl font-semibold mb-4">Confirmare Ștergere</h2>
        <p>Ești sigur că vrei să ștergi categoria "{categoryToDelete?.name}"?</p>
        <div className="mt-4">
          <button onClick={deleteCategory} className="px-4 py-2 bg-red-500 text-white rounded mr-2">Da, șterge</button>
          <button onClick={closeDeleteModal} className="px-4 py-2 bg-gray-300 rounded">Anulează</button>
        </div>
      </Modal>
    </Modal>
  );
};

export default CategoryModal;