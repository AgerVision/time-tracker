import React from 'react';
import Modal from 'react-modal';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, closeEditModal }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Confirmare ștergere"
      className="modal"
      overlayClassName="overlay"
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        content: {
          position: 'relative',
          top: 'auto',
          left: 'auto',
          right: 'auto',
          bottom: 'auto',
          border: 'none',
          background: 'white',
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
          borderRadius: '8px',
          outline: 'none',
          padding: '20px',
          maxWidth: '400px',
          width: '90%',
          maxHeight: '90vh',
          zIndex: 1001,
          margin: 'auto',
        },
      }}
    >
      <h2 className="text-xl font-semibold mb-4">Confirmare ștergere</h2>
      <p className="mb-4">Sunteți sigur că doriți să ștergeți acest interval?</p>
      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
        >
          Anulează
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Șterge
        </button>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;