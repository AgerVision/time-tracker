import React from 'react';
import Modal from 'react-modal';

const ContactModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Contact Modal"
      className="modal"
      overlayClassName="overlay"
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
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
          background: 'transparent',
          overflow: 'visible',
          WebkitOverflowScrolling: 'touch',
          borderRadius: '0',
          outline: 'none',
          padding: '0',
          maxWidth: '400px',
          width: '90%',
          maxHeight: '90vh',
          zIndex: 10000,
        }
      }}
    >
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Contact</h2>
        <p className="mb-4">În pagina următoare veți putea raporta probleme sau solicita adăugarea de noi funcționalități.</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
          >
            Înapoi
          </button>
          <button
            onClick={onConfirm}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Continuă
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ContactModal;
