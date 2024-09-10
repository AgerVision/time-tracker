import React from 'react';
import Modal from 'react-modal';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Confirm Delete"
      style={{
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '100%',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
      }}
    >
      <h2 className="text-2xl font-semibold mb-4">Confirmă ștergerea</h2>
      <p>Ești sigur că vrei să ștergi acest interval?</p>
      <div className="flex justify-end mt-4">
        <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded mr-2">Da, șterge</button>
        <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Anulează</button>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;