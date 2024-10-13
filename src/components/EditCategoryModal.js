import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';

const EditCategoryModal = ({ isOpen, onClose, category, onSave, categories }) => {
  const [editedCategory, setEditedCategory] = useState({ name: '', active: true, id: '' });
  const [isNewCategory, setIsNewCategory] = useState(false);

  useEffect(() => {
    if (category) {
      setEditedCategory(category);
      setIsNewCategory(category.name === '');
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedCategory((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const isCategoryNameUnique = (name) => {
    return !categories.some(cat => 
      cat.name.toLowerCase() === name.toLowerCase() && cat.id !== editedCategory.id
    );
  };

  const handleSave = () => {
    if (editedCategory.name.trim() === '') {
      toast.error('Numele categoriei nu poate fi gol!');
      return;
    }

    if (!isCategoryNameUnique(editedCategory.name.trim())) {
      toast.error('Există deja o categorie cu acest nume!');
      return;
    }

    onSave(editedCategory);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Editare Categorie"
      className="modal"
      overlayClassName="overlay"
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1002,
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
          margin: 'auto',
        }
      }}
    >
      <h2 className="text-xl font-semibold mb-4">
        {isNewCategory ? 'Adaugă Categorie Nouă' : 'Editează Categoria'}
      </h2>
      <div className="flex flex-col space-y-4">
        <input
          type="text"
          name="name"
          value={editedCategory.name}
          onChange={handleChange}
          className="p-2 border rounded"
          placeholder="Numele categoriei"
        />
        <div className="flex items-center">
          <input
            type="checkbox"
            name="active"
            checked={editedCategory.active}
            onChange={handleChange}
            className="mr-2"
          />
          <label>Activ</label>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {isNewCategory ? 'Adaugă' : 'Salvează'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
          >
            Anulează
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditCategoryModal;
